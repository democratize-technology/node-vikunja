/**
 * Label service for Vikunja API
 */
import { VikunjaService } from '../core/service.js';
import { Message } from '../models/common.js';
import { Label } from '../models/label.js';
import { LabelListParams } from '../models/request.js';
import { convertParams } from '../core/request.js';

/**
 * Handles label operations with the Vikunja API
 */
export class LabelService extends VikunjaService {
  /**
   * Get all labels with pagination and search
   *
   * @param params - Pagination and search parameters
   * @returns List of labels
   */
  async getLabels(params?: LabelListParams): Promise<Label[]> {
    return this.request<Label[]>('/labels', 'GET', undefined, { params: convertParams(params) });
  }

  /**
   * Create a new label
   *
   * @param label - Label data
   * @returns Created label
   */
  async createLabel(label: Label): Promise<Label> {
    return this.request<Label>('/labels', 'PUT', label);
  }

  /**
   * Get a specific label by ID
   *
   * @param labelId - Label ID
   * @returns Label details
   */
  async getLabel(labelId: number): Promise<Label> {
    return this.request<Label>(`/labels/${labelId}`, 'GET');
  }

  /**
   * Update a label
   *
   * @param labelId - Label ID
   * @param label - Updated label data
   * @returns Updated label
   */
  async updateLabel(labelId: number, label: Label): Promise<Label> {
    return this.request<Label>(`/labels/${labelId}`, 'PUT', label);
  }

  /**
   * Delete a label
   *
   * @param labelId - Label ID
   * @returns Success message
   */
  async deleteLabel(labelId: number): Promise<Message> {
    return this.request<Message>(`/labels/${labelId}`, 'DELETE');
  }
}
