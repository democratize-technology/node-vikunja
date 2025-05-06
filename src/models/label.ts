/**
 * Label related interfaces
 */
import { BaseEntity, Pagination } from './common';

/**
 * Label entity
 */
export interface Label extends BaseEntity {
  title: string;
  hex_color?: string;
  created_by?: {
    id: number;
    username: string;
    email?: string;
  };
  created?: string;
  updated?: string;
  description?: string;
}

/**
 * Task-label relationship
 */
export interface TaskLabel {
  task_id: number;
  label_id: number;
}

/**
 * Parameters for getting task labels
 */
export interface GetTaskLabelsParams extends Pagination {
  /**
   * Search labels by label text
   */
  s?: string;
}
