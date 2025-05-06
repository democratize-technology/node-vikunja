/**
 * Tests for UserService
 */
import { UserService } from '../../src/services/user.service';
import { User } from '../../src/models/auth';
import { VikunjaError } from '../../src/core/service';
import {
  EmailConfirm,
  UserPasswordConfirmation,
  UserDeletionRequestConfirm,
  UserPassword,
  PasswordReset,
  PasswordTokenRequest,
} from '../../src/models/user';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('UserService', () => {
  let service: UserService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';

  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new UserService(mockBaseUrl, mockToken);
  });

  describe('getUser', () => {
    it('should get user information', async () => {
      // Mock response
      const mockUser: User = {
        id: 123,
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        is_active: true,
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockUser),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.getUser();

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockUser);
    });

    it('should handle not found errors', async () => {
      // Error response
      const errorResponse = {
        code: 404,
        message: 'User not found',
      };

      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      await expect(service.getUser()).rejects.toThrow(VikunjaError);
      await expect(service.getUser()).rejects.toMatchObject({
        message: errorResponse.message,
        code: errorResponse.code,
        status: 404,
      });
    });
  });

  describe('getUsers', () => {
    it('should search for users', async () => {
      // Mock request params
      const searchParams = {
        s: 'test',
      };

      // Mock response
      const mockUsers: User[] = [
        {
          id: 123,
          username: 'testuser',
          email: 'test@example.com',
        },
        {
          id: 124,
          username: 'tester',
          email: 'tester@example.com',
        },
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockUsers),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.getUsers(searchParams);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/users?s=test`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockUsers);
    });

    it('should handle bad request errors', async () => {
      // Error response
      const errorResponse = {
        code: 400,
        message: 'Invalid search parameters',
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
      await expect(service.getUsers({ s: 'test' })).rejects.toThrow(VikunjaError);
      await expect(service.getUsers({ s: 'test' })).rejects.toMatchObject({
        message: errorResponse.message,
        code: errorResponse.code,
        status: 400,
      });
    });
  });

  describe('confirmEmail', () => {
    it('should confirm email successfully', async () => {
      const confirmation: EmailConfirm = {
        token: 'valid-token',
      };

      const mockResponse: Message = {
        message: 'Email confirmed successfully',
      };

      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the service
      const result = await service.confirmEmail(confirmation);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/confirm`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(confirmation),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid token error', async () => {
      const confirmation: EmailConfirm = {
        token: 'invalid-token',
      };

      const errorResponse = {
        code: 412,
        message: 'Invalid or expired token',
      };

      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 412,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the method and expect it to throw
      await expect(service.confirmEmail(confirmation)).rejects.toThrow(VikunjaError);

      try {
        await service.confirmEmail(confirmation);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(412);
      }
    });

    it('should handle server error', async () => {
      const confirmation: EmailConfirm = {
        token: 'valid-token',
      };

      const errorResponse = {
        code: 500,
        message: 'Internal server error',
      };

      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the method and expect it to throw
      await expect(service.confirmEmail(confirmation)).rejects.toThrow(VikunjaError);

      try {
        await service.confirmEmail(confirmation);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
  });

  describe('requestDeletion', () => {
    it('should request user deletion successfully', async () => {
      const passwordConfirmation: UserPasswordConfirmation = {
        password: 'correct-password',
      };

      const mockResponse: Message = {
        message: 'Deletion request sent to your email',
      };

      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the service
      const result = await service.requestDeletion(passwordConfirmation);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/deletion/request`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(passwordConfirmation),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should handle precondition failed error', async () => {
      const passwordConfirmation: UserPasswordConfirmation = {
        password: 'wrong-password',
      };

      const errorResponse = {
        code: 412,
        message: 'Precondition failed',
      };

      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 412,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the method and expect it to throw
      await expect(service.requestDeletion(passwordConfirmation)).rejects.toThrow(VikunjaError);

      try {
        await service.requestDeletion(passwordConfirmation);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(412);
      }
    });
  });

  describe('confirmDeletion', () => {
    it('should confirm user deletion successfully', async () => {
      const confirmation: UserDeletionRequestConfirm = {
        token: 'valid-token',
      };

      const mockResponse: Message = {
        message: 'Account deleted successfully',
      };

      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the service
      const result = await service.confirmDeletion(confirmation);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/deletion/confirm`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(confirmation),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid token error', async () => {
      const confirmation: UserDeletionRequestConfirm = {
        token: 'invalid-token',
      };

      const errorResponse = {
        code: 412,
        message: 'Invalid or expired token',
      };

      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 412,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the method and expect it to throw
      await expect(service.confirmDeletion(confirmation)).rejects.toThrow(VikunjaError);

      try {
        await service.confirmDeletion(confirmation);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(412);
      }
    });
  });

  describe('cancelDeletion', () => {
    it('should cancel user deletion successfully', async () => {
      const passwordConfirmation: UserPasswordConfirmation = {
        password: 'correct-password',
      };

      const mockResponse: Message = {
        message: 'Deletion request cancelled',
      };

      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the service
      const result = await service.cancelDeletion(passwordConfirmation);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/deletion/cancel`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(passwordConfirmation),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should handle password verification error', async () => {
      const passwordConfirmation: UserPasswordConfirmation = {
        password: 'wrong-password',
      };

      const errorResponse = {
        code: 412,
        message: 'Password verification failed',
      };

      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 412,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the method and expect it to throw
      await expect(service.cancelDeletion(passwordConfirmation)).rejects.toThrow(VikunjaError);

      try {
        await service.cancelDeletion(passwordConfirmation);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(412);
      }
    });
  });

  describe('requestExport', () => {
    it('should request user data export successfully', async () => {
      const passwordConfirmation: UserPasswordConfirmation = {
        password: 'correct-password',
      };

      const mockResponse: Message = {
        message: 'Export request received, you will be notified when it is ready',
      };

      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the service
      const result = await service.requestExport(passwordConfirmation);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/export/request`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(passwordConfirmation),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when password is incorrect', async () => {
      const passwordConfirmation: UserPasswordConfirmation = {
        password: 'wrong-password',
      };

      const errorResponse = {
        code: 400,
        message: 'Password is incorrect',
      };

      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the method and expect it to throw
      await expect(service.requestExport(passwordConfirmation)).rejects.toThrow(VikunjaError);

      try {
        await service.requestExport(passwordConfirmation);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });

  describe('downloadExport', () => {
    it('should download user data export successfully', async () => {
      const passwordConfirmation: UserPasswordConfirmation = {
        password: 'correct-password',
      };

      const mockResponse: Message = {
        message: 'Export downloaded successfully',
      };

      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the service
      const result = await service.downloadExport(passwordConfirmation);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/export/download`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(passwordConfirmation),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when password is incorrect', async () => {
      const passwordConfirmation: UserPasswordConfirmation = {
        password: 'wrong-password',
      };

      const errorResponse = {
        code: 400,
        message: 'Password is incorrect',
      };

      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the method and expect it to throw
      await expect(service.downloadExport(passwordConfirmation)).rejects.toThrow(VikunjaError);

      try {
        await service.downloadExport(passwordConfirmation);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });

  describe('changePassword', () => {
    it('should change user password successfully', async () => {
      const userPassword: UserPassword = {
        current_password: 'current-password',
        new_password: 'new-password',
      };

      const mockResponse: Message = {
        message: 'Password changed successfully',
      };

      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the service
      const result = await service.changePassword(userPassword);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/password`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userPassword),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when current password is incorrect', async () => {
      const userPassword: UserPassword = {
        current_password: 'wrong-password',
        new_password: 'new-password',
      };

      const errorResponse = {
        code: 400,
        message: 'Current password is incorrect',
      };

      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the method and expect it to throw
      await expect(service.changePassword(userPassword)).rejects.toThrow(VikunjaError);

      try {
        await service.changePassword(userPassword);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetRequest: PasswordReset = {
        token: 'reset-token',
        password: 'new-password',
      };

      const mockResponse: Message = {
        message: 'Password reset successfully',
      };

      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the service
      const result = await service.resetPassword(resetRequest);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/password/reset`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(resetRequest),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when reset token is invalid', async () => {
      const resetRequest: PasswordReset = {
        token: 'invalid-token',
        password: 'new-password',
      };

      const errorResponse = {
        code: 400,
        message: 'Invalid or expired reset token',
      };

      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the method and expect it to throw
      await expect(service.resetPassword(resetRequest)).rejects.toThrow(VikunjaError);

      try {
        await service.resetPassword(resetRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });

  describe('requestResetToken', () => {
    it('should request password reset token successfully', async () => {
      const tokenRequest: PasswordTokenRequest = {
        username: 'testuser',
      };

      const mockResponse: Message = {
        message: 'Reset token sent to your email',
      };

      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the service
      const result = await service.requestResetToken(tokenRequest);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/password/token`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(tokenRequest),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when username is not found', async () => {
      const tokenRequest: PasswordTokenRequest = {
        username: 'nonexistentuser',
      };

      const errorResponse = {
        code: 404,
        message: 'User not found',
      };

      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Call the method and expect it to throw
      await expect(service.requestResetToken(tokenRequest)).rejects.toThrow(VikunjaError);

      try {
        await service.requestResetToken(tokenRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
  });

  describe('getTimezones', () => {
    it('should get all available timezones', async () => {
      // Mock response
      const mockTimezones = [
        'UTC',
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
        'Australia/Sydney',
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTimezones),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.getTimezones();

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/user/timezones`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockTimezones);
    });

    it('should handle 500 error when server error occurs', async () => {
      const errorResponse = {
        code: 500,
        message: 'Internal server error',
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
        await service.getTimezones();
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
