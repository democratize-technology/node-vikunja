import { VikunjaService, HttpMethod } from '../../src/core/service.js';
import {
  VikunjaError,
  VikunjaAuthenticationError,
  VikunjaNotFoundError,
  VikunjaValidationError,
  VikunjaServerError
} from '../../src/core/errors.js';

// Mock fetch
global.fetch = jest.fn();

// Create a test service class
class TestService extends VikunjaService {
  async testRequest<T>(endpoint: string, method: HttpMethod, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, method, body);
  }
}

describe('VikunjaService Error Handling', () => {
  let service: TestService;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    service = new TestService('https://api.vikunja.io', 'test-token');
    jest.clearAllMocks();
  });

  describe('Authentication Errors', () => {
    it('should throw VikunjaAuthenticationError for 401 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          code: 1001,
          message: 'Invalid authentication'
        })
      } as Partial<Response> as Response);

      try {
        await service.testRequest('/tasks', 'GET');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaAuthenticationError);
        expect((error as VikunjaAuthenticationError).statusCode).toBe(401);
        expect((error as VikunjaAuthenticationError).endpoint).toBe('/tasks');
        expect((error as VikunjaAuthenticationError).method).toBe('GET');
        expect((error as VikunjaAuthenticationError).response).toEqual({
          code: 1001,
          message: 'Invalid authentication'
        });
      }
    });

    it('should throw VikunjaAuthenticationError for 403 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          message: 'Access forbidden'
        })
      } as Partial<Response> as Response);

      await expect(service.testRequest('/admin/users', 'DELETE'))
        .rejects
        .toThrow(VikunjaAuthenticationError);
    });
  });

  describe('Not Found Errors', () => {
    it('should throw VikunjaNotFoundError for 404 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          code: 4004,
          message: 'Task not found'
        })
      } as Partial<Response> as Response);

      try {
        await service.testRequest('/tasks/999', 'GET');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaNotFoundError);
        expect((error as VikunjaNotFoundError).statusCode).toBe(404);
        expect((error as VikunjaNotFoundError).message).toBe('Task not found');
      }
    });
  });

  describe('Validation Errors', () => {
    it('should throw VikunjaValidationError for 400 responses', async () => {
      const validationResponse = {
        code: 4001,
        message: 'Validation failed',
        errors: {
          title: 'Title is required',
          due_date: 'Invalid date format'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => validationResponse
      } as Partial<Response> as Response);

      try {
        await service.testRequest('/tasks', 'POST', { title: '' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaValidationError);
        expect((error as VikunjaValidationError).statusCode).toBe(400);
        expect((error as VikunjaValidationError).response).toEqual(validationResponse);
      }
    });
  });

  describe('Server Errors', () => {
    it('should throw VikunjaServerError for 500 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          code: 5000,
          message: 'Internal server error'
        })
      } as Partial<Response> as Response);

      await expect(service.testRequest('/tasks', 'GET'))
        .rejects
        .toThrow(VikunjaServerError);
    });

    it('should throw VikunjaServerError for other 5xx responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({
          message: 'Service temporarily unavailable'
        })
      } as Partial<Response> as Response);

      try {
        await service.testRequest('/tasks', 'GET');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaServerError);
        expect((error as VikunjaServerError).statusCode).toBe(503);
      }
    });
  });

  describe('Generic Errors', () => {
    it('should throw generic VikunjaError for other status codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          code: 4009,
          message: 'Conflict detected'
        })
      } as Partial<Response> as Response);

      try {
        await service.testRequest('/tasks', 'POST');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect(!(error instanceof VikunjaAuthenticationError)).toBe(true);
        expect(!(error instanceof VikunjaNotFoundError)).toBe(true);
        expect(!(error instanceof VikunjaValidationError)).toBe(true);
        expect(!(error instanceof VikunjaServerError)).toBe(true);
        expect((error as VikunjaError).statusCode).toBe(409);
      }
    });
  });

  describe('JSON Parse Errors', () => {
    it('should handle non-JSON error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      } as Partial<Response> as Response);

      try {
        await service.testRequest('/tasks', 'GET');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaServerError);
        expect((error as VikunjaServerError).message).toBe('API request failed with status 500');
        expect((error as VikunjaServerError).response).toEqual({
          message: 'API request failed with status 500'
        });
      }
    });
  });

  describe('Network Errors', () => {
    it('should throw VikunjaError for network failures', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await service.testRequest('/tasks', 'GET');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network error');
        expect((error as VikunjaError).statusCode).toBe(0);
        expect((error as VikunjaError).endpoint).toBe('/tasks');
        expect((error as VikunjaError).method).toBe('GET');
      }
    });

    it('should handle fetch rejection without error message', async () => {
      mockFetch.mockRejectedValueOnce({});

      try {
        await service.testRequest('/tasks', 'GET');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network error');
      }
    });
  });

  describe('Error Re-throwing', () => {
    it('should re-throw existing VikunjaError instances', async () => {
      const customError = new VikunjaAuthenticationError(
        'Custom auth error',
        '/custom',
        'POST',
        401,
        { message: 'Custom auth error' }
      );

      mockFetch.mockImplementationOnce(() => {
        throw customError;
      });

      await expect(service.testRequest('/tasks', 'GET'))
        .rejects
        .toThrow(customError);
    });
  });
});