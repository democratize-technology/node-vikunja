/**
 * Subscription models for Vikunja API
 */
import { BaseEntity } from './common.js';

/**
 * Valid entity types for subscriptions
 */
export type SubscriptionEntityType = 'project' | 'task';

/**
 * Represents a user subscription to an entity
 */
export interface Subscription extends BaseEntity {
  /**
   * Subscription ID
   */
  id?: number;

  /**
   * Creation timestamp
   */
  created?: string;

  /**
   * Last update timestamp
   */
  updated?: string;
}
