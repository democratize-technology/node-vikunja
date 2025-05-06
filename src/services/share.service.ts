/**
 * Share service for Vikunja API
 */
import { VikunjaService } from '../core/service';
import { LinkShareAuth } from '../models/share';
import { AuthToken } from '../models/auth';

/**
 * Service for managing project link shares
 */
export class ShareService extends VikunjaService {
  /**
   * Get an authentication token for a share
   *
   * @param shareHash - The share hash
   * @param auth - Authentication data with password for password-protected shares
   * @returns Authentication token
   */
  async getShareAuth(shareHash: string, auth: LinkShareAuth): Promise<AuthToken> {
    // Create a temporary service instance without a token to prevent sending Authorization header
    // This is needed because we're requesting an auth token
    const tempService = new ShareService(this.baseUrl);
    return tempService.request<AuthToken>(`/shares/${shareHash}/auth`, 'POST', auth);
  }
}
