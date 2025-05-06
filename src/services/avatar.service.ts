/**
 * Avatar service for Vikunja API
 */
import { VikunjaService } from '../core/service';

/**
 * Handles user avatar operations with the Vikunja API
 */
export class AvatarService extends VikunjaService {
  /**
   * Get a user's avatar by username
   *
   * @param username - The username of the user whose avatar you want to get
   * @param size - Optional size parameter for the avatar
   * @returns Blob containing the avatar image data
   */
  async getUserAvatar(username: string, size?: number): Promise<Blob> {
    return this.request<Blob>(`/${username}/avatar`, 'GET', undefined, {
      params: size ? { size } : undefined,
      responseType: 'blob',
    });
  }
}
