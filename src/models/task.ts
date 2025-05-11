/**
 * Task related interfaces
 */
import { BaseEntity } from './common.js';
import { Label } from './label.js';

/**
 * Task entity
 */
export interface Task extends BaseEntity {
  project_id: number;
  title: string;
  description?: string;
  done?: boolean;
  done_at?: string;
  due_date?: string;
  start_date?: string;
  end_date?: string;
  repeat_after?: number;
  repeat_mode?: 'day' | 'week' | 'month' | 'year';
  priority?: number;
  created_by?: {
    id: number;
    username: string;
    email?: string;
  };
  created?: string;
  updated?: string;
  labels?: Label[];
  assignees?: {
    id: number;
    username: string;
    email?: string;
  }[];
  hex_color?: string;
  percent_done?: number;
  identifier?: string;
  index?: number;
  kanban_position?: number;
  bucket_id?: number;
  position?: number;
  related_tasks?: {
    task_id: number;
    relation_kind: RelationKind;
  }[];
  attachments?: {
    id: number;
    task_id: number;
    file_name: string;
    file_size: number;
    created_by: {
      id: number;
      username: string;
    };
    created: string;
  }[];
  reminders?: {
    id: number;
    reminder_date: string;
  }[];
}

/**
 * Task assignment
 */
export interface TaskAssignment {
  user_id: number;
  task_id: number;
}

/**
 * Task relation kind
 */
export enum RelationKind {
  UNKNOWN = 'unknown',
  SUBTASK = 'subtask',
  PARENTTASK = 'parenttask',
  RELATED = 'related',
  DUPLICATEOF = 'duplicateof',
  DUPLICATES = 'duplicates',
  BLOCKING = 'blocking',
  BLOCKED = 'blocked',
  PRECEDES = 'precedes',
  FOLLOWS = 'follows',
  COPIEDFROM = 'copiedfrom',
  COPIEDTO = 'copiedto',
}

/**
 * Task relation
 */
export interface TaskRelation {
  task_id: number;
  other_task_id: number;
  relation_kind: RelationKind;
}

/**
 * Task comment
 */
export interface TaskComment {
  id?: number;
  task_id: number;
  comment: string;
  created?: string;
  updated?: string;
  created_by?: {
    id: number;
    username: string;
  };
}

/**
 * Task attachment
 */
export interface TaskAttachment {
  /**
   * Attachment ID
   */
  id: number;

  /**
   * ID of the task this attachment belongs to
   */
  task_id: number;

  /**
   * Name of the uploaded file
   */
  file_name: string;

  /**
   * Size of the file in bytes
   */
  file_size: number;

  /**
   * User who created/uploaded this attachment
   */
  created_by: {
    id: number;
    username: string;
  };

  /**
   * Creation timestamp
   */
  created: string;

  /**
   * Last updated timestamp
   */
  updated?: string;
}

/**
 * Bulk assignees operation
 */
export interface BulkAssignees {
  user_ids: number[];
}

/**
 * Bulk label operation
 */
export interface LabelTaskBulk {
  label_ids: number[];
}

/**
 * Task bulk update operation
 */
export interface TaskBulkOperation {
  task_ids: number[];
  field: string;
  value: unknown;
}

/**
 * Bulk Task for updating tasks across multiple projects
 *
 * This model is like a normal task, but uses an array of project_ids instead of a single project_id
 */
export interface BulkTask extends Omit<Task, 'project_id'> {
  project_ids: number[];
}
