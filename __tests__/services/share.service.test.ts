/**
 * Tests for the ShareService
 */
import { ShareService } from '../../src/services/share.service';
import { VikunjaError } from '../../src/core/service';
import { LinkShareAuth } from '../../src/models/share';
import { AuthToken } from '../../src/models/auth';

// Mock global fetch
global.fetch = jest.fn();

describe('ShareService', () => {
  let shareService: ShareService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';

  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();

    // Create a new service instance
    shareService = new ShareService(baseUrl, mockToken);
  });

  describe('getShareAuth', () => {
    it('should get an auth token for a share with password', async () => {
      const shareHash = 'abc123';
      const auth: LinkShareAuth = {
        password: 'secret123',
      };

      const mockToken: AuthToken = {
        token: 'share-access-token',
        expires_at: '2023-12-31T23:59:59Z',
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

      // Call the method
      const result = await shareService.getShareAuth(shareHash, auth);

      // Verify the result
      expect(result).toEqual(mockToken);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/shares/${shareHash}/auth`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(auth),
        })
      );

      // Ensure the Authorization header was NOT sent since we're requesting a token
      const calledOptions = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(calledOptions.headers.Authorization).toBeUndefined();
    });

    it('should handle API errors when authenticating', async () => {
      const shareHash = 'invalid-hash';
      const auth: LinkShareAuth = {
        password: 'wrong-password',
      };

      const errorResponse = {
        code: 400,
        message: 'Invalid password or share does not exist',
      };

      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      await expect(shareService.getShareAuth(shareHash, auth)).rejects.toThrow(VikunjaError);

      try {
        await shareService.getShareAuth(shareHash, auth);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });
});
