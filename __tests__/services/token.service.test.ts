/**
 * Tests for the TokenService
 */
import { TokenService } from '../../src/services/token.service';
import { VikunjaError } from '../../src/core/service';
import { AuthToken } from '../../src/models/auth';
import { APIToken, APITokenRoute } from '../../src/models/misc';
import { TokenListParams } from '../../src/models/request';

// Mock global fetch
global.fetch = jest.fn();

describe('TokenService', () => {
  let service: TokenService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new TokenService(mockBaseUrl, mockToken);
  });
  

  // New tests for getTokens method - lines 30-32
  describe('getTokens', () => {
    it('should fetch all API tokens', async () => {
      const mockTokens: APIToken[] = [
        {
          id: 1,
          title: 'API Token 1',
          right: 'read',
          created: '2023-01-01T12:00:00Z',
          updated: '2023-01-01T12:00:00Z'
        },
        {
          id: 2,
          title: 'API Token 2',
          right: 'write',
          created: '2023-02-01T12:00:00Z',
          updated: '2023-02-01T12:00:00Z'
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTokens),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await service.getTokens();
      
      // Verify the result
      expect(result).toEqual(mockTokens);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/tokens`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
    
    it('should fetch tokens with pagination and search params', async () => {
      const params: TokenListParams = {
        page: 2,
        per_page: 10,
        s: 'api'
      };
      
      const mockTokens: APIToken[] = [
        {
          id: 2,
          title: 'API Token 2',
          right: 'write',
          created: '2023-02-01T12:00:00Z',
          updated: '2023-02-01T12:00:00Z'
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTokens),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await service.getTokens(params);
      
      // Verify the result
      expect(result).toEqual(mockTokens);
      
      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/tokens?page=2&per_page=10&s=api`,
        expect.anything()
      );
    });
    
    it('should handle API errors properly', async () => {
      const errorResponse = {
        code: 403,
        message: 'Forbidden - no access to tokens'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await service.getTokens();
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(403);
      }
    });
  });
  
  // New tests for createToken method - lines 33-41
  describe('createToken', () => {
    it('should create a new token', async () => {
      const newToken: APIToken = {
        title: 'New API Token',
        right: 'read'
      };
      
      const createdToken: APIToken = {
        id: 3,
        title: 'New API Token',
        token: 'generated-token-value',
        right: 'read',
        created: '2023-03-01T12:00:00Z',
        updated: '2023-03-01T12:00:00Z',
        created_by: {
          id: 1,
          username: 'user1'
        }
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(createdToken),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await service.createToken(newToken);
      
      // Verify the result
      expect(result).toEqual(createdToken);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/tokens`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(newToken)
        })
      );
    });
    
    it('should handle API errors when creating a token', async () => {
      const newToken: APIToken = {
        title: '',  // Empty title to trigger validation error
        right: 'read'
      };
      
      const errorResponse = {
        code: 400,
        message: 'Token title cannot be empty'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await service.createToken(newToken);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });
  
  // Tests for deleteToken method
  describe('deleteToken', () => {
    it('should delete a token successfully', async () => {
      const tokenId = 123;
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({ message: 'Token deleted successfully' }),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await service.deleteToken(tokenId);
      
      // Verify the result
      expect(result).toEqual({ message: 'Token deleted successfully' });
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/tokens/${tokenId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
    
    it('should handle API errors when deleting a token', async () => {
      const tokenId = 999;
      const errorResponse = {
        code: 404,
        message: 'Token not found'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await service.deleteToken(tokenId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
  });

  // New tests for getTokenRoutes method - lines 42-49
  describe('getTokenRoutes', () => {
    it('should get all token API routes', async () => {
      const mockRoutes: APITokenRoute[] = [
        {
          path: '/api/v1/user',
          method: 'GET',
          description: 'Get current user'
        },
        {
          path: '/api/v1/tasks',
          method: 'GET',
          description: 'Get all tasks'
        },
        {
          path: '/api/v1/projects',
          method: 'GET',
          description: 'Get all projects'
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockRoutes),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await service.getTokenRoutes();
      
      // Verify the result
      expect(result).toEqual(mockRoutes);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/routes`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
    
    it('should handle API errors when getting token routes', async () => {
      const errorResponse = {
        code: 500,
        message: 'Internal server error'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await service.getTokenRoutes();
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
  });
});