/**
 * Tests for the OpenIDService
 */
import { AuthService } from '../../src/services/auth.service';
import { AuthToken, OpenIDCallback } from '../../src/models/auth';
import { VikunjaError } from '../../src/core/service';

// Mock global fetch
global.fetch = jest.fn();

describe('OpenIDService', () => {
  let service: AuthService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';

  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new AuthService(mockBaseUrl, mockToken);
  });

  describe('authenticate', () => {
    it('should authenticate a user with OpenID Connect and return an auth token', async () => {
      // Mock callback data
      const providerId = 1;
      const callback: OpenIDCallback = {
        code: 'openid-auth-code',
        provider: providerId,
      };

      // Mock response
      const mockToken: AuthToken = {
        token: 'jwt-token-from-openid',
        expires_at: '2025-06-01T12:00:00Z',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockToken),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.authenticate(providerId, callback);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/auth/openid/${providerId}/callback`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(callback),
        }
      );

      // Verify response
      expect(result).toEqual(mockToken);
    });

    it('should handle authentication errors from the OpenID provider', async () => {
      // Mock callback data
      const providerId = 1;
      const callback: OpenIDCallback = {
        code: 'invalid-code',
        provider: providerId,
      };

      // Error response
      const errorResponse = {
        code: 500,
        message: 'Authentication failed with the OpenID provider',
      };

      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      try {
        await service.authenticate(providerId, callback);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(500);
      }
    });

    it('should handle network errors during authentication', async () => {
      // Mock callback data
      const providerId = 1;
      const callback: OpenIDCallback = {
        code: 'openid-auth-code',
        provider: providerId,
      };

      // Network error
      const networkError = new Error('Network error during authentication');

      // Mock the fetch to throw a network error
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Call the method and expect it to throw
      try {
        await service.authenticate(providerId, callback);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(networkError.message);
        expect((error as VikunjaError).response).toEqual({ message: networkError.message });
        expect((error as VikunjaError).statusCode).toBe(0);
      }
    });
  });
});
