/**
 * Filter models for Vikunja API
 */
import { BaseEntity, JSONObject } from './common.js';

/**
 * Represents a saved filter in Vikunja
 */
export interface SavedFilter extends BaseEntity {
  /**
   * The unique identifier of the filter
   */
  id?: number;

  /**
   * The title of the filter
   */
  title: string;

  /**
   * The filter query parameters as a JSON object
   */
  filters: JSONObject;

  /**
   * Project ID the filter belongs to
   */
  project_id?: number;

  /**
   * User ID who created the filter
   */
  created_by_id?: number;

  /**
   * Creation timestamp
   */
  created?: string;

  /**
   * Last updated timestamp
   */
  updated?: string;
}
