/**
 * Notification related interfaces
 */
import { BaseEntity } from './common.js';

/**
 * Individual database notification
 */
export interface Notification extends BaseEntity {
  /**
   * Notification ID
   */
  id: number;

  /**
   * Notification name
   */
  name: string;

  /**
   * Subject of the notification
   */
  subject: string;

  /**
   * Message content
   */
  message: string;

  /**
   * Whether the notification has been read
   */
  read: boolean;

  /**
   * Creation timestamp
   */
  created?: string;

  /**
   * Last updated timestamp
   */
  updated?: string;
}

/**
 * Database notifications response
 */
export interface DatabaseNotifications {
  /**
   * Total count of notifications
   */
  count: number;

  /**
   * List of notifications
   */
  notifications: Notification[];
}
