/**
 * Notification service for Vikunja API
 */
import { VikunjaService } from '../core/service.js';
import { Message } from '../models/common.js';
import { DatabaseNotification } from '../models/misc.js';
import { DatabaseNotifications } from '../models/notification.js';
import { NotificationListParams } from '../models/request.js';
import { convertParams } from '../core/request.js';

/**
 * Handles notification operations with the Vikunja API
 */
export class NotificationService extends VikunjaService {
  /**
   * Get all notifications for the current user
   *
   * @param params - Pagination parameters
   * @returns List of notifications
   */
  async getNotifications(params?: NotificationListParams): Promise<DatabaseNotification[]> {
    return this.request<DatabaseNotification[]>('/notifications', 'GET', undefined, {
      params: convertParams(params),
    });
  }

  /**
   * Mark all notifications as read
   *
   * @returns Success message
   */
  async markAllAsRead(): Promise<Message> {
    return this.request<Message>('/notifications', 'POST');
  }

  /**
   * Mark a notification as read/unread (toggles the state)
   *
   * @param notificationId - Notification ID
   * @returns Updated notifications
   */
  async markNotification(notificationId: number): Promise<DatabaseNotifications> {
    return this.request<DatabaseNotifications>(`/notifications/${notificationId}`, 'POST');
  }
}
