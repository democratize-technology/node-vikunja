/**
 * Filter service for Vikunja API
 */
import { VikunjaService } from '../core/service.js';
import { Message } from '../models/common.js';
import { SavedFilter } from '../models/filter.js';

/**
 * Handles filter operations with the Vikunja API
 */
export class FilterService extends VikunjaService {
  /**
   * Create a new saved filter
   *
   * @param filter - Filter data
   * @returns Created filter
   */
  async createFilter(filter: SavedFilter): Promise<SavedFilter> {
    return this.request<SavedFilter>('/filters', 'PUT', filter);
  }

  /**
   * Get a specific saved filter by ID
   *
   * @param filterId - Filter ID
   * @returns Filter details
   */
  async getFilter(filterId: number): Promise<SavedFilter> {
    return this.request<SavedFilter>(`/filters/${filterId}`, 'GET');
  }

  /**
   * Update a saved filter
   *
   * @param filterId - Filter ID
   * @param filter - Updated filter data
   * @returns Updated filter
   */
  async updateFilter(filterId: number, filter: SavedFilter): Promise<SavedFilter> {
    return this.request<SavedFilter>(`/filters/${filterId}`, 'POST', filter);
  }

  /**
   * Delete a saved filter
   *
   * @param filterId - Filter ID
   * @returns Success message
   */
  async deleteFilter(filterId: number): Promise<Message> {
    return this.request<Message>(`/filters/${filterId}`, 'DELETE');
  }
}
