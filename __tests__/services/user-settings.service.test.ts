/**
 * Tests for the SettingsService
 */
import { UserService } from '../../src/services/user.service';
import {
  UserAvatarProvider,
  AvatarProvider,
  UserSettings,
  EmailUpdate,
  Token,
  TOTP,
  TOTPPasscode,
  Login,
} from '../../src/models/settings';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('SettingsService', () => {
  let service: UserService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';

  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new UserService(mockBaseUrl, mockToken);
  });

  // Test for getting user avatar
  describe('getUserAvatar', () => {
    it('should get the user avatar settings', async () => {
      // Mock response
      const mockAvatarSettings: UserAvatarProvider = {
        provider: AvatarProvider.Gravatar,
        email: 'test@example.com',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockAvatarSettings),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.getUserAvatar();

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/avatar`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockAvatarSettings);
    });

    it('should handle error responses', async () => {
      // Error response
      const errorResponse = {
        code: 401,
        message: 'Unauthorized',
      };

      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      try {
        await service.getUserAvatar();
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(401);
      }
    });
  });

  // Test for setting user avatar
  describe('setUserAvatar', () => {
    it('should set the user avatar settings', async () => {
      // Avatar settings to set
      const avatarSettings: UserAvatarProvider = {
        provider: AvatarProvider.Initials,
      };

      // Mock response
      const mockMessage: Message = {
        message: 'Avatar settings updated successfully',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.setUserAvatar(avatarSettings);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/avatar`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(avatarSettings),
        })
      );

      // Verify response
      expect(result).toEqual(mockMessage);
    });

    it('should handle error when setting avatar', async () => {
      // Avatar settings to set
      const avatarSettings: UserAvatarProvider = {
        provider: AvatarProvider.Gravatar,
        email: 'invalid-email',
      };

      // Error response
      const errorResponse = {
        code: 400,
        message: 'Invalid avatar settings',
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
      try {
        await service.setUserAvatar(avatarSettings);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });

  // Test for uploading avatar
  describe('uploadAvatar', () => {
    it('should upload an avatar image', async () => {
      // Mock file data
      const mockFile = new Blob(['mock file content'], { type: 'image/png' });

      // Mock response
      const mockMessage: Message = {
        message: 'Avatar uploaded successfully',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.uploadAvatar(mockFile);

      // Verify request was made with FormData
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/avatar/upload`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            // Content-Type header should be removed to let the browser set it with the boundary
          }),
          body: expect.any(FormData),
        })
      );

      // Get the FormData from the request
      const actualRequest = (global.fetch as jest.Mock).mock.calls[0][1];
      const formData = actualRequest.body as FormData;

      // Verify the form data has the file
      expect(formData.has('avatar')).toBe(true);

      // Verify response
      expect(result).toEqual(mockMessage);
    });

    it('should handle error when uploading avatar', async () => {
      // Mock file data
      const mockFile = new Blob(['invalid image data'], { type: 'text/plain' });

      // Error response
      const errorResponse = {
        code: 400,
        message: 'Invalid image format',
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
      try {
        await service.uploadAvatar(mockFile);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });

    // Test for JSON parsing error in uploadAvatar
    it('should handle JSON parsing error when uploading avatar', async () => {
      // Mock file data
      const mockFile = new Blob(['mock file content'], { type: 'image/png' });

      // Mock the fetch response with invalid JSON response
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      try {
        await service.uploadAvatar(mockFile);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(
          `API request failed with status ${mockResponse.status}`
        );
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(400);
      }
    });

    // Test for network error in uploadAvatar
    it('should handle network error when uploading avatar', async () => {
      // Mock file data
      const mockFile = new Blob(['mock file content'], { type: 'image/png' });

      // Network error
      const networkError = new Error('Network error during upload');

      // Mock the fetch to throw a network error
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Call the method and expect it to throw
      try {
        await service.uploadAvatar(mockFile);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(networkError.message);
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(0);
      }
    });

    // Test for missing token in uploadAvatar
    it('should make request without authorization header when no token is provided', async () => {
      // Create a service instance without token
      const serviceWithoutToken = new UserService(mockBaseUrl);

      // Mock file data
      const mockFile = new Blob(['mock file content'], { type: 'image/png' });

      // Mock response
      const mockMessage: Message = {
        message: 'Avatar uploaded successfully',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      await serviceWithoutToken.uploadAvatar(mockFile);

      // Verify request was made without Authorization header
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/avatar/upload`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
          body: expect.any(FormData),
        })
      );
    });

    // Test for error with empty message property
    it('should handle error with empty message property', async () => {
      // Mock file data
      const mockFile = new Blob(['mock file content'], { type: 'image/png' });

      // Error response with empty message
      const errorResponse = {
        code: 400,
        message: '', // Empty message will trigger the fallback
      };

      // Mock the fetch response with an error containing empty message
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
      try {
        await service.uploadAvatar(mockFile);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        // Should use the fallback message
        expect((error as VikunjaError).message).toBe(
          `API request failed with status ${mockResponse.status}`
        );
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(mockResponse.status);
      }
    });

    // Test for error with missing code property
    it('should handle error with missing code property', async () => {
      // Mock file data
      const mockFile = new Blob(['mock file content'], { type: 'image/png' });

      // Error response with missing code
      const errorResponse = {
        message: 'Error message without code',
        // code is missing and will trigger the fallback
      };

      // Mock the fetch response with an error missing the code property
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
      try {
        await service.uploadAvatar(mockFile);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        // Should use the fallback code
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(mockResponse.status);
      }
    });

    // Test for network error with empty message
    it('should handle network error with empty message', async () => {
      // Mock file data
      const mockFile = new Blob(['mock file content'], { type: 'image/png' });

      // Create an Error with empty message
      const networkError = new Error('');

      // Mock the fetch to throw a network error with empty message
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Call the method and expect it to throw
      try {
        await service.uploadAvatar(mockFile);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        // Should use the fallback message
        expect((error as VikunjaError).message).toBe('Network error');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(0);
      }
    });
  });

  // Test for updating general user settings
  describe('updateGeneralSettings', () => {
    it('should update general user settings', async () => {
      // Settings to update
      const settings: UserSettings = {
        email_reminders_enabled: true,
        discoverable_by_name: false,
        discoverable_by_email: true,
        week_start: 1, // Monday
        timezone: 'America/New_York',
        language: 'en',
      };

      // Mock response
      const mockMessage: Message = {
        message: 'Settings updated successfully',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.updateGeneralSettings(settings);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/general`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(settings),
        })
      );

      // Verify response
      expect(result).toEqual(mockMessage);
    });

    it('should handle error when updating general settings', async () => {
      // Settings to update
      const settings: UserSettings = {
        timezone: 'InvalidTimezone',
      };

      // Error response
      const errorResponse = {
        code: 400,
        message: 'Invalid timezone',
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
      try {
        await service.updateGeneralSettings(settings);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });

  // Test for updating email address
  describe('updateEmail', () => {
    it('should update user email address', async () => {
      // Email update data
      const emailUpdate: EmailUpdate = {
        email: 'new-email@example.com',
        password: 'current-password',
      };

      // Mock response
      const mockMessage: Message = {
        message: 'Email address updated successfully',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.updateEmail(emailUpdate);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/email`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(emailUpdate),
        })
      );

      // Verify response
      expect(result).toEqual(mockMessage);
    });

    it('should handle error when updating email', async () => {
      // Email update data
      const emailUpdate: EmailUpdate = {
        email: 'invalid-email',
        password: 'wrong-password',
      };

      // Error response
      const errorResponse = {
        code: 400,
        message: 'Invalid email or incorrect password',
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
      try {
        await service.updateEmail(emailUpdate);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });

  // Test for getting TOTP settings
  describe('getTOTPSettings', () => {
    it('should get TOTP settings', async () => {
      // Mock response
      const mockTOTP: TOTP = {
        enabled: true,
        url: 'otpauth://totp/Vikunja:user@example.com?secret=ABC123&issuer=Vikunja',
        secret: 'ABC123',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTOTP),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.getTOTPSettings();

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/totp`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockTOTP);
    });
  });

  // Test for enrolling in TOTP
  describe('enrollTOTP', () => {
    it('should enroll in TOTP', async () => {
      // Mock response
      const mockTOTP: TOTP = {
        enabled: false,
        url: 'otpauth://totp/Vikunja:user@example.com?secret=NEW123&issuer=Vikunja',
        secret: 'NEW123',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTOTP),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.enrollTOTP();

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/totp/enroll`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockTOTP);
    });
  });

  // Test for enabling TOTP
  describe('enableTOTP', () => {
    it('should enable TOTP with a passcode', async () => {
      // TOTP passcode
      const passcode: TOTPPasscode = {
        passcode: '123456',
      };

      // Mock response
      const mockMessage: Message = {
        message: 'TOTP enabled successfully',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.enableTOTP(passcode);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/totp/enable`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(passcode),
        })
      );

      // Verify response
      expect(result).toEqual(mockMessage);
    });
  });

  // Test for disabling TOTP
  describe('disableTOTP', () => {
    it('should disable TOTP with password', async () => {
      // Login credentials (password only)
      const credentials: Login = {
        password: 'current-password',
      };

      // Mock response
      const mockMessage: Message = {
        message: 'TOTP disabled successfully',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.disableTOTP(credentials);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/totp/disable`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(credentials),
        })
      );

      // Verify response
      expect(result).toEqual(mockMessage);
    });
  });

  // Test for getting caldav tokens
  describe('getCalDavTokens', () => {
    it('should get all caldav tokens', async () => {
      // Mock response
      const mockTokens: Token[] = [
        {
          id: 1,
          token: 'token1',
          created: '2025-05-01T12:00:00Z',
          expires: '2026-05-01T12:00:00Z',
        },
        {
          id: 2,
          token: 'token2',
          created: '2025-05-02T12:00:00Z',
          expires: '2026-05-02T12:00:00Z',
        },
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTokens),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.getCalDavTokens();

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/token/caldav`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockTokens);
    });
  });

  // Test for generating caldav token
  describe('generateCalDavToken', () => {
    it('should generate a new caldav token', async () => {
      // Mock response
      const mockToken: Token = {
        id: 3,
        token: 'new-token',
        created: '2025-05-05T12:00:00Z',
        expires: '2026-05-05T12:00:00Z',
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
      const result = await service.generateCalDavToken();

      // Just assert that fetch was called with the correct URL and method
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/token/caldav`,
        expect.objectContaining({
          method: 'PUT',
        })
      );

      // Verify response
      expect(result).toEqual(mockToken);
    });
  });

  // Test for deleting caldav token
  describe('deleteCalDavToken', () => {
    it('should delete a caldav token by ID', async () => {
      // Mock response
      const mockMessage: Message = {
        message: 'Token deleted successfully',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Token ID to delete
      const tokenId = 2;

      // Call the service
      const result = await service.deleteCalDavToken(tokenId);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/token/caldav/${tokenId}`,
        expect.objectContaining({
          method: 'GET', // Note: API uses GET for deletion which is unusual
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockMessage);
    });
  });

  // Test for getting TOTP QR Code
  describe('getTOTPQRCode', () => {
    it('should get TOTP QR code as a blob', async () => {
      // Mock blob response
      const mockBlob = new Blob(['fake-qr-code-data'], { type: 'image/png' });

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        blob: jest.fn().mockResolvedValue(mockBlob),
        headers: new Headers({
          'content-type': 'image/png',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.getTOTPQRCode();

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/settings/totp/qrcode`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          // Should request blob response type
        })
      );

      // Verify response is the blob
      expect(result).toEqual(mockBlob);
    });
  });
});
