/**
 * Token service for Vikunja API
 */
import { VikunjaService } from '../core/service';
import { APIToken, APITokenRoute } from '../models/misc';
import { TokenListParams } from '../models/request';
import { convertParams } from '../core/request';
import { Message } from '../models/common';

/**
 * Handles token operations with the Vikunja API
 */
export class TokenService extends VikunjaService {
  /**
   * Get all API tokens for the current user
   *
   * @param params - Pagination and search parameters
   * @returns List of API tokens
   */
  async getTokens(params?: TokenListParams): Promise<APIToken[]> {
    return this.request<APIToken[]>('/tokens', 'GET', undefined, { params: convertParams(params) });
  }

  /**
   * Create a new API token
   *
   * @param token - Token data
   * @returns Created token
   */
  async createToken(token: APIToken): Promise<APIToken> {
    return this.request<APIToken>('/tokens', 'PUT', token);
  }

  /**
   * Delete an API token by ID
   *
   * @param tokenId - ID of the token to delete
   * @returns Success message
   */
  async deleteToken(tokenId: number): Promise<Message> {
    return this.request<Message>(`/tokens/${tokenId}`, 'DELETE');
  }

  /**
   * Get a list of all token API routes
   *
   * @returns List of API routes
   */
  async getTokenRoutes(): Promise<APITokenRoute[]> {
    return this.request<APITokenRoute[]>('/routes', 'GET');
  }
}
