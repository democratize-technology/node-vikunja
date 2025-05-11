/**
 * Events service for Vikunja API
 */
import { VikunjaService } from '../core/service.js';
import { WebhookEvent } from '../models/events.js';

/**
 * Handles webhook events operations with the Vikunja API
 */
export class EventsService extends VikunjaService {
  /**
   * Get all possible webhook events
   *
   * @returns Array of webhook event types
   */
  async getWebhookEvents(): Promise<WebhookEvent[]> {
    return this.request<WebhookEvent[]>('/webhooks/events', 'GET');
  }
}
