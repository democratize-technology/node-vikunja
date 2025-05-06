/**
 * User service for Vikunja API
 */
import { VikunjaService, VikunjaError } from '../core/service';
import { User } from '../models/auth';
import { UserSearchParams } from '../models/request';
import { Message } from '../models/common';
import {
  EmailConfirm,
  UserPasswordConfirmation,
  UserDeletionRequestConfirm,
  UserPassword,
  PasswordReset,
  PasswordTokenRequest,
} from '../models/user';
import {
  UserAvatarProvider,
  UserSettings,
  EmailUpdate,
  Token,
  TOTP,
  TOTPPasscode,
  Login,
} from '../models/settings';
import { convertParams } from '../core/request';

/**
 * Handles user operations with the Vikunja API
 */
export class UserService extends VikunjaService {
  /**
   * Get current user information
   *
   * @returns User information
   */
  async getUser(): Promise<User> {
    return this.request<User>('/user', 'GET');
  }

  /**
   * Request user account deletion
   *
   * @param confirmation - Object containing the user's password for confirmation
   * @returns Success message
   */
  async requestDeletion(confirmation: UserPasswordConfirmation): Promise<Message> {
    return this.request<Message>('/user/deletion/request', 'POST', confirmation);
  }

  /**
   * Confirm user account deletion with a token
   *
   * @param confirmation - Object containing the confirmation token
   * @returns Success message
   */
  async confirmDeletion(confirmation: UserDeletionRequestConfirm): Promise<Message> {
    return this.request<Message>('/user/deletion/confirm', 'POST', confirmation);
  }

  /**
   * Cancel a pending user account deletion request
   *
   * @param confirmation - Object containing the user's password for confirmation
   * @returns Success message
   */
  async cancelDeletion(confirmation: UserPasswordConfirmation): Promise<Message> {
    return this.request<Message>('/user/deletion/cancel', 'POST', confirmation);
  }

  /**
   * Confirm a user's email address
   *
   * @param confirmation - Object containing the confirmation token
   * @returns Success message
   */
  async confirmEmail(confirmation: EmailConfirm): Promise<Message> {
    return this.request<Message>('/user/confirm', 'POST', confirmation);
  }

  /**
   * Request a user data export
   *
   * @param confirmation - Object containing the user's password for confirmation
   * @returns Success message
   */
  async requestExport(confirmation: UserPasswordConfirmation): Promise<Message> {
    return this.request<Message>('/user/export/request', 'POST', confirmation);
  }

  /**
   * Download a user data export
   *
   * @param confirmation - Object containing the user's password for confirmation
   * @returns Success message with download information
   */
  async downloadExport(confirmation: UserPasswordConfirmation): Promise<Message> {
    return this.request<Message>('/user/export/download', 'POST', confirmation);
  }

  /**
   * Change the user's password
   *
   * @param userPassword - Object containing current_password and new_password
   * @returns Success message
   */
  async changePassword(userPassword: UserPassword): Promise<Message> {
    return this.request<Message>('/user/password', 'POST', userPassword);
  }

  /**
   * Reset a user's password using a reset token
   *
   * @param reset - Object containing the reset token and new password
   * @returns Success message
   */
  async resetPassword(reset: PasswordReset): Promise<Message> {
    return this.request<Message>('/user/password/reset', 'POST', reset);
  }

  /**
   * Request a password reset token for a user
   *
   * @param request - Object containing the username
   * @returns Success message
   */
  async requestResetToken(request: PasswordTokenRequest): Promise<Message> {
    return this.request<Message>('/user/password/token', 'POST', request);
  }

  /**
   * Search for users
   *
   * @param params - Search parameters
   * @returns List of users
   */
  async getUsers(params?: UserSearchParams): Promise<User[]> {
    return this.request<User[]>('/users', 'GET', undefined, { params: convertParams(params) });
  }

  /**
   * Get the current user's avatar settings
   *
   * @returns Avatar settings
   */
  async getUserAvatar(): Promise<UserAvatarProvider> {
    return this.request<UserAvatarProvider>('/user/settings/avatar', 'GET');
  }

  /**
   * Set the user's avatar settings
   *
   * @param avatar - Avatar settings to set
   * @returns Success message
   */
  async setUserAvatar(avatar: UserAvatarProvider): Promise<Message> {
    return this.request<Message>('/user/settings/avatar', 'POST', avatar);
  }

  /**
   * Upload a user avatar image
   *
   * @param file - Avatar image file (supported formats: JPEG, PNG, GIF)
   * @returns Success message
   */
  async uploadAvatar(file: Blob): Promise<Message> {
    // Create form data
    const formData = new FormData();
    formData.append('avatar', file);

    // Make the request with FormData
    const url = this.buildUrl('/user/settings/avatar/upload');

    // Custom headers for multipart/form-data upload
    const headers: HeadersInit = {};

    // Add authorization header if token is available
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Build request options
    const requestOptions: RequestInit = {
      method: 'PUT',
      headers,
      body: formData,
    };

    try {
      // Make the request
      const response = await fetch(url, requestOptions);

      // Check if the request was successful
      if (!response.ok) {
        let errorData;

        try {
          errorData = await response.json();
        } catch {
          // If parsing JSON fails, use a generic error message
          throw new VikunjaError(
            `API request failed with status ${response.status}`,
            0,
            response.status
          );
        }

        throw new VikunjaError(
          errorData.message || `API request failed with status ${response.status}`,
          errorData.code || 0,
          response.status
        );
      }

      // Return parsed response
      return (await response.json()) as Message;
    } catch (error) {
      // Re-throw VikunjaError
      if (error instanceof VikunjaError) {
        throw error;
      }

      // Handle network errors
      throw new VikunjaError((error as Error).message || 'Network error', 0, 0);
    }
  }

  /**
   * Update general user settings
   *
   * @param settings - User settings to update
   * @returns Success message
   */
  async updateGeneralSettings(settings: UserSettings): Promise<Message> {
    return this.request<Message>('/user/settings/general', 'POST', settings);
  }

  /**
   * Update user's email address
   *
   * @param emailUpdate - Email update data with new email and current password
   * @returns Success message
   */
  async updateEmail(emailUpdate: EmailUpdate): Promise<Message> {
    return this.request<Message>('/user/settings/email', 'POST', emailUpdate);
  }

  /**
   * Get the current user's TOTP (2FA) settings
   *
   * @returns TOTP settings
   */
  async getTOTPSettings(): Promise<TOTP> {
    return this.request<TOTP>('/user/settings/totp', 'GET');
  }

  /**
   * Enroll the user in TOTP (2FA)
   * Note: This generates a new TOTP secret but does not enable 2FA yet
   *
   * @returns TOTP enrollment details
   */
  async enrollTOTP(): Promise<TOTP> {
    return this.request<TOTP>('/user/settings/totp/enroll', 'POST');
  }

  /**
   * Enable TOTP (2FA) with a verification passcode
   *
   * @param passcode - TOTP passcode for verification
   * @returns Success message
   */
  async enableTOTP(passcode: TOTPPasscode): Promise<Message> {
    return this.request<Message>('/user/settings/totp/enable', 'POST', passcode);
  }

  /**
   * Disable TOTP (2FA) for the current user
   *
   * @param credentials - User credentials (password required for verification)
   * @returns Success message
   */
  async disableTOTP(credentials: Login): Promise<Message> {
    return this.request<Message>('/user/settings/totp/disable', 'POST', credentials);
  }

  /**
   * Get all CalDAV tokens for the current user
   *
   * @returns List of CalDAV tokens
   */
  async getCalDavTokens(): Promise<Token[]> {
    return this.request<Token[]>('/user/settings/token/caldav', 'GET');
  }

  /**
   * Generate a new CalDAV token
   *
   * @returns The newly generated token
   */
  async generateCalDavToken(): Promise<Token> {
    return this.request<Token>('/user/settings/token/caldav', 'PUT');
  }

  /**
   * Delete a CalDAV token by ID
   *
   * @param tokenId - Token ID to delete
   * @returns Success message
   */
  async deleteCalDavToken(tokenId: number): Promise<Message> {
    return this.request<Message>(`/user/settings/token/caldav/${tokenId}`, 'GET');
  }

  /**
   * Get TOTP QR code as an image
   *
   * @returns QR code image as a Blob
   */
  async getTOTPQRCode(): Promise<Blob> {
    return this.request<Blob>('/user/settings/totp/qrcode', 'GET', undefined, {
      responseType: 'blob',
    });
  }

  /**
   * Get all available timezones on this Vikunja instance
   *
   * @returns Array of timezone strings
   */
  async getTimezones(): Promise<string[]> {
    return this.request<string[]>('/user/timezones', 'GET');
  }
}
