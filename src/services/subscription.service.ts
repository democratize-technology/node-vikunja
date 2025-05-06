/**
 * Subscription service for Vikunja API
 */
import { VikunjaService } from '../core/service';
import { Subscription, SubscriptionEntityType } from '../models/subscription';

/**
 * Service for managing entity subscriptions
 */
export class SubscriptionService extends VikunjaService {
  /**
   * Subscribe the current user to an entity
   *
   * @param entityType - Type of entity to subscribe to (project or task)
   * @param entityId - ID of the entity to subscribe to
   * @returns Subscription data
   */
  async subscribe(entityType: SubscriptionEntityType, entityId: number): Promise<Subscription> {
    return this.request<Subscription>(`/subscriptions/${entityType}/${entityId}`, 'PUT');
  }

  /**
   * Unsubscribe the current user from an entity
   *
   * @param entityType - Type of entity to unsubscribe from (project or task)
   * @param entityId - ID of the entity to unsubscribe from
   * @returns Subscription data
   */
  async unsubscribe(entityType: SubscriptionEntityType, entityId: number): Promise<Subscription> {
    return this.request<Subscription>(`/subscriptions/${entityType}/${entityId}`, 'DELETE');
  }
}
