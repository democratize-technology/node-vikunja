/**
 * Tests for the AuthService renewToken method
 */
import { AuthService } from '../../src/services/auth.service';
import { VikunjaError } from '../../src/core/service';
import { AuthToken } from '../../src/models/auth';

// Mock global fetch
global.fetch = jest.fn();

describe('AuthService', () => {
  let authService: AuthService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';
   
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
     
    // Create a new service instance
    authService = new AuthService(baseUrl, mockToken);
  });
   
  describe('renewToken', () => {
    it('should renew a token successfully', async () => {
      // Mock token response
      const mockTokenResponse: AuthToken = {
        token: 'new-token',
        expires_at: '2025-06-05T00:00:00Z'
      };
       
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTokenResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
       
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
       
      // Call the method
      const result = await authService.renewToken();
       
      // Verify the result
      expect(result).toEqual(mockTokenResponse);
       
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/user/token`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
     
    it('should handle error responses', async () => {
      // Mock error response
      const errorMessage = 'Token has expired';
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({
          message: errorMessage,
          code: 401
        }),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
       
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
       
      // Call the method and expect it to throw
      await expect(authService.renewToken()).rejects.toThrow(VikunjaError);
      await expect(authService.renewToken()).rejects.toMatchObject({
        message: errorMessage,
        statusCode: 401
      });
    });
     
    it('should handle network errors', async () => {
      // Mock a network error
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);
       
      // Call the method and expect it to throw
      await expect(authService.renewToken()).rejects.toThrow(VikunjaError);
      await expect(authService.renewToken()).rejects.toMatchObject({
        message: 'Network error',
        statusCode: 0
      });
    });
  });
});