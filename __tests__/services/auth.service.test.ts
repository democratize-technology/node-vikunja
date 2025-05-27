/**
 * Tests for the AuthService
 */
import { AuthService } from '../../src/services/auth.service';
import { VikunjaError } from '../../src/core/service';
import { AuthToken, LoginCredentials, OpenIDCallback, User, UserCreation } from '../../src/models/auth';

// Mock global fetch
global.fetch = jest.fn();

describe('AuthService', () => {
  let service: AuthService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new AuthService(mockBaseUrl, mockToken);
  });
  
  describe('login', () => {
    it('should login successfully with credentials', async () => {
      // Mock credentials
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'password123'
      };
      
      // Mock token response
      const mockTokenResponse: AuthToken = {
        token: 'auth-token-value',
        expires_at: '2025-06-05T12:00:00Z'
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
      
      // Call the service
      const result = await service.login(credentials);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/login`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(credentials)
        })
      );
      
      // Verify response
      expect(result).toEqual(mockTokenResponse);
    });
    
    it('should include TOTP passcode when provided', async () => {
      // Mock credentials with TOTP
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'password123',
        totp_passcode: '123456'
      };
      
      // Mock token response
      const mockTokenResponse: AuthToken = {
        token: 'auth-token-value',
        expires_at: '2025-06-05T12:00:00Z'
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
      
      // Call the service
      const result = await service.login(credentials);
      
      // Verify request includes TOTP
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/login`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(credentials)
        })
      );
      
      // Verify response
      expect(result).toEqual(mockTokenResponse);
    });
    
    it('should handle authentication errors', async () => {
      // Mock credentials
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'wrong-password'
      };
      
      const errorResponse = {
        code: 401,
        message: 'Invalid username or password'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await service.login(credentials);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(401);
      }
    });
  });
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock user registration data
      const userData: UserCreation = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'securepassword123'
      };
      
      // Mock created user response
      const mockUserResponse: User = {
        id: 123,
        username: 'newuser',
        email: 'new@example.com',
        is_active: true,
        created: '2023-05-01T10:00:00Z',
        updated: '2023-05-01T10:00:00Z'
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(mockUserResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.register(userData);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/register`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(userData)
        })
      );
      
      // Verify response
      expect(result).toEqual(mockUserResponse);
    });
    
    it('should handle registration errors', async () => {
      // Mock user registration data with existing username
      const userData: UserCreation = {
        username: 'existinguser',
        email: 'exists@example.com',
        password: 'password123'
      };
      
      const errorResponse = {
        code: 400,
        message: 'Username already exists'
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
        await service.register(userData);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(400);
      }
    });
  });
  
  describe('openIDAuthenticate', () => {
    it('should authenticate with OpenID successfully', async () => {
      // Mock OpenID callback data
      const callbackData: OpenIDCallback = {
        code: 'openid-auth-code',
        provider: 1 // Assuming 1 is a valid provider ID
      };
      
      // Mock token response
      const mockTokenResponse: AuthToken = {
        token: 'openid-token-value',
        expires_at: '2025-06-05T12:00:00Z'
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
      
      // Call the service
      const result = await service.openIDAuthenticate(callbackData);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/auth/openid/${callbackData.provider}/callback`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(callbackData)
        })
      );
      
      // Verify response
      expect(result).toEqual(mockTokenResponse);
    });
    
    it('should handle OpenID authentication errors', async () => {
      // Mock OpenID callback data with invalid code
      const callbackData: OpenIDCallback = {
        code: 'invalid-code',
        provider: 1
      };
      
      const errorResponse = {
        code: 400,
        message: 'Invalid authentication code'
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
        await service.openIDAuthenticate(callbackData);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(400);
      }
    });
  });
  
  describe('token management', () => {
    it('should set the authentication token', () => {
      const newToken = 'new-auth-token';
      
      // Verify initial token
      expect(service['token']).toBe(mockToken);
      
      // Set the token
      service.setToken(newToken);
      
      // Verify token was set
      expect(service['token']).toBe(newToken);
    });
    
    it('should clear the authentication token', () => {
      // Verify initial token
      expect(service['token']).toBe(mockToken);
      
      // Clear the token
      service.clearToken();
      
      // Verify token was cleared
      expect(service['token']).toBeNull();
    });
  });
  
  describe('renewToken', () => {
    it('should renew user token successfully', async () => {
      // Mock response
      const mockTokenResponse: AuthToken = {
        token: 'new-token-value',
        expires_at: '2025-06-05T12:00:00Z'
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
      
      // Call the service
      const result = await service.renewToken();
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/token`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockTokenResponse);
    });
    
    it('should handle error when token renewal fails', async () => {
      const errorResponse = {
        code: 400,
        message: 'Cannot renew token'
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
        await service.renewToken();
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(400);
      }
    });
  });
});