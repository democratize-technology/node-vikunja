/**
 * Tests for the VikunjaClient
 */
import { VikunjaClient } from '../src/client';
import { VikunjaError } from '../src/core/service';

// Mock global fetch
global.fetch = jest.fn();

describe('VikunjaClient', () => {
  let client: VikunjaClient;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    client = new VikunjaClient(mockBaseUrl, mockToken);
  });
  
  describe('initialization', () => {
    it('should initialize all services with the provided base URL and token', () => {
      // Create client without a token
      const client = new VikunjaClient(mockBaseUrl);
      
      // Check that all services are initialized
      expect(client.auth).toBeDefined();
      expect(client.projects).toBeDefined();
      expect(client.tasks).toBeDefined();
      expect(client.labels).toBeDefined();
      expect(client.avatar).toBeDefined();
      expect(client.events).toBeDefined();
      expect(client.filters).toBeDefined();
      expect(client.migration).toBeDefined();
      expect(client.notifications).toBeDefined();
      expect(client.shares).toBeDefined();
      expect(client.subscriptions).toBeDefined();
      expect(client.system).toBeDefined();
      expect(client.tables).toBeDefined();
      expect(client.teams).toBeDefined();
      expect(client.tokens).toBeDefined();
      expect(client.users).toBeDefined();
    });
    
    it('should initialize all services with the provided token', () => {
      // Create client with a token
      const client = new VikunjaClient(mockBaseUrl, mockToken);
      
      // Check that the token is set in the auth service
      expect((client.auth as any).token).toBe(mockToken);
    });
  });
  
  describe('token management', () => {
    it('should update the token in all services', () => {
      const newToken = 'new-token';
      
      // Set the token
      client.setToken(newToken);
      
      // Check that the token is updated in all services
      expect((client.auth as any).token).toBe(newToken);
      expect((client.projects as any).token).toBe(newToken);
      expect((client.tasks as any).token).toBe(newToken);
      // Check a few more services
      expect((client.labels as any).token).toBe(newToken);
      expect((client.users as any).token).toBe(newToken);
    });
    
    it('should clear the token in all services', () => {
      // Clear the token
      client.clearToken();
      
      // Check that the token is cleared in all services
      expect((client.auth as any).token).toBeNull();
      expect((client.projects as any).token).toBeNull();
      expect((client.tasks as any).token).toBeNull();
      // Check a few more services
      expect((client.labels as any).token).toBeNull();
      expect((client.users as any).token).toBeNull();
    });
  });
  
  describe('login', () => {
    it('should login and set the token', async () => {
      // Mock credentials
      const username = 'testuser';
      const password = 'password123';
      
      // Mock token response
      const mockTokenResponse = {
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
      
      // Call the client login method
      const result = await client.login(username, password);
      
      // Verify the token is set
      expect((client.auth as any).token).toBe(mockTokenResponse.token);
      
      // Verify response
      expect(result).toEqual(mockTokenResponse);
    });
    
    it('should include TOTP passcode when provided', async () => {
      // Mock credentials with TOTP
      const username = 'testuser';
      const password = 'password123';
      const totpPasscode = '123456';
      
      // Mock token response
      const mockTokenResponse = {
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
      
      // Call the client login method with TOTP
      const result = await client.login(username, password, totpPasscode);
      
      // Verify request includes TOTP
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('totp_passcode')
        })
      );
      
      // Verify the token is set
      expect((client.auth as any).token).toBe(mockTokenResponse.token);
      
      // Verify response
      expect(result).toEqual(mockTokenResponse);
    });
  });
  
  describe('renewToken', () => {
    it('should renew token and update all services when token is present', async () => {
      // Spy on the setToken method
      const setTokenSpy = jest.spyOn(client, 'setToken');
      
      // Mock token response
      const mockTokenResponse = {
        token: 'renewed-token-value',
        expires_at: '2025-06-05T12:00:00Z'
      };
      
      // Mock the auth service renewToken method
      client.auth.renewToken = jest.fn().mockResolvedValue(mockTokenResponse);
      
      // Call the client renewToken method
      const result = await client.renewToken();
      
      // Verify the auth service's renewToken method was called
      expect(client.auth.renewToken).toHaveBeenCalled();
      
      // Verify setToken was called with the new token
      expect(setTokenSpy).toHaveBeenCalledWith(mockTokenResponse.token);
      
      // Verify response
      expect(result).toEqual(mockTokenResponse);
    });
    
    it('should not update services when renewed token is undefined', async () => {
      // Spy on the setToken method
      const setTokenSpy = jest.spyOn(client, 'setToken');
      
      // Mock token response without a token
      const mockTokenResponse = {
        expires_at: '2025-06-05T12:00:00Z'
        // token is intentionally missing
      };
      
      // Mock the auth service renewToken method
      client.auth.renewToken = jest.fn().mockResolvedValue(mockTokenResponse);
      
      // Call the client renewToken method
      const result = await client.renewToken();
      
      // Verify the auth service's renewToken method was called
      expect(client.auth.renewToken).toHaveBeenCalled();
      
      // Verify setToken was NOT called since there's no token
      expect(setTokenSpy).not.toHaveBeenCalled();
      
      // Verify response
      expect(result).toEqual(mockTokenResponse);
    });
  });
});
