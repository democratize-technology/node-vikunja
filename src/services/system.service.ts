/**
 * System service for Vikunja API
 */
import { VikunjaService } from '../core/service.js';
import { VikunjaInfo } from '../models/system.js';

/**
 * Handles system information operations with the Vikunja API
 */
export class SystemService extends VikunjaService {
  /**
   * Get system information
   *
   * @returns System information
   */
  async getInfo(): Promise<VikunjaInfo> {
    return this.request<VikunjaInfo>('/info', 'GET');
  }
}
