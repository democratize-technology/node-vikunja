/**
 * Tests for the VikunjaService base class
 */
import { VikunjaService, VikunjaError, HttpMethod } from '../../src/core/service';

// Concrete implementation of abstract VikunjaService for testing
class TestService extends VikunjaService {
  public testRequest<T>(
    endpoint: string,
    method: HttpMethod,
    body?: unknown,
    options = {}
  ): Promise<T> {
    return this.request<T>(endpoint, method, body, options);
  }

  public testBuildUrl(endpoint: string, params?: any): string {
    return this.buildUrl(endpoint, params);
  }
}

// Mock global fetch
global.fetch = jest.fn();

describe('VikunjaService', () => {
  let service: TestService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new TestService(mockBaseUrl, mockToken);
  });
  
  describe('constructor', () => {
    it('should remove trailing slash from baseUrl', () => {
      const serviceWithTrailingSlash = new TestService(`${mockBaseUrl}/`, mockToken);
      expect(serviceWithTrailingSlash.testBuildUrl('/test')).toBe(`${mockBaseUrl}/test`);
    });
    
    it('should accept baseUrl without trailing slash', () => {
      expect(service.testBuildUrl('/test')).toBe(`${mockBaseUrl}/test`);
    });
  });
  
  describe('buildUrl', () => {
    it('should add leading slash to endpoint if missing', () => {
      expect(service.testBuildUrl('test')).toBe(`${mockBaseUrl}/test`);
    });
    
    it('should keep leading slash if present', () => {
      expect(service.testBuildUrl('/test')).toBe(`${mockBaseUrl}/test`);
    });
    
    it('should add query parameters correctly', () => {
      const params = { page: 1, per_page: 10, s: 'search term' };
      const url = service.testBuildUrl('/test', params);
      expect(url).toContain(`${mockBaseUrl}/test?`);
      expect(url).toContain('page=1');
      expect(url).toContain('per_page=10');
      // URL encoding might use + or %20 for spaces depending on the environment
      expect(url).toMatch(/s=search(\+|%20)term/);
    });
  });
  
  describe('request', () => {
    it('should handle error response with non-parsable JSON', async () => {
      // Mock error response with non-JSON data (will throw when trying to parse)
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        text: jest.fn().mockResolvedValue('Internal Server Error'),
        headers: new Headers({
          'content-type': 'text/plain',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw a generic error
      try {
        await service.testRequest<any>('/test', 'GET');
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('API request failed with status 500');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(500);
      }
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/test`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
      
      // Verify that response.json was called
      expect(mockResponse.json).toHaveBeenCalled();
    });
    
    it('should handle FormData objects correctly', async () => {
      // Create a mock FormData object
      const formData = new FormData();
      
      // Create mock method to make TypeScript happy
      formData.append = jest.fn();
      
      // Add a file-like object
      const fileBlob = new Blob(['test content'], { type: 'text/plain' });
      formData.append('file', fileBlob, 'test.txt');
      
      // Verify the object is instanceof FormData
      Object.setPrototypeOf(formData, FormData.prototype);
      
      // Mock successful response
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ success: true }),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method with FormData
      await service.testRequest<any>('/upload', 'POST', formData);
      
      // Verify that fetch was called with FormData directly (not stringified)
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/upload`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: formData // The FormData object should be passed directly
        })
      );
      
      // Verify that response.json was called
      expect(mockResponse.json).toHaveBeenCalled();
    });
    
    it('should handle different response types', async () => {
      // Test text response
      const textResponse = {
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue('Plain text response'),
        headers: new Headers({
          'content-type': 'text/plain',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(textResponse);
      
      const textResult = await service.testRequest<string>('/test', 'GET', undefined, { responseType: 'text' });
      expect(textResult).toBe('Plain text response');
      expect(textResponse.text).toHaveBeenCalled();
      
      // Test blob response
      const mockBlob = new Blob(['test data'], { type: 'application/octet-stream' });
      const blobResponse = {
        ok: true,
        status: 200,
        blob: jest.fn().mockResolvedValue(mockBlob),
        headers: new Headers({
          'content-type': 'application/octet-stream',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(blobResponse);
      
      const blobResult = await service.testRequest<Blob>('/test', 'GET', undefined, { responseType: 'blob' });
      expect(blobResult).toBe(mockBlob);
      expect(blobResponse.blob).toHaveBeenCalled();
      
      // Test empty response
      const emptyResponse = {
        ok: true,
        status: 204,
        json: jest.fn(),
        headers: new Headers({
          'content-length': '0',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(emptyResponse);
      
      const emptyResult = await service.testRequest<object>('/test', 'DELETE');
      expect(emptyResult).toEqual({});
      expect(emptyResponse.json).not.toHaveBeenCalled();
    });
    
    it('should handle network errors', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      // Call the method and expect it to throw
      try {
        await service.testRequest<any>('/test', 'GET');
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network error');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(0);
      }
    });
  });
});