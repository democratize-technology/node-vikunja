/**
 * Project related interfaces
 */
import { BaseEntity } from './common';
import { Task } from './task';

/**
 * Project entity
 */
export interface Project extends BaseEntity {
  title: string;
  description?: string;
  parent_project_id?: number;
  is_archived?: boolean;
  hex_color?: string;
  owner?: {
    id: number;
    username: string;
    email?: string;
  };
  created?: string;
  updated?: string;
  position?: number;
  identifier?: string;
  background_information?: {
    blur_hash?: string;
    full_url?: string;
    thumb_url?: string;
    background_image_id?: number;
    background_image_url?: string;
  };
}

/**
 * Project user relationship
 */
export interface ProjectUser {
  user_id: number;
  project_id: number;
  right: number; // 0: Read, 1: Write, 2: Admin
}

/**
 * User with their project right
 */
export interface UserWithRight {
  id: number;
  username: string;
  email?: string;
  name?: string;
  right: number;
}

/**
 * Project team relationship
 */
export interface TeamProject {
  team_id: number;
  project_id: number;
  right: number;
}

/**
 * Team with its project right
 */
export interface TeamWithRight {
  id: number;
  name: string;
  description?: string;
  right: number;
}

/**
 * Project view definition
 */
export interface ProjectView extends BaseEntity {
  project_id: number;
  title: string;
  type: 'list' | 'board' | 'table' | 'gantt';
  position?: number;
  created?: string;
  updated?: string;
}

/**
 * Project background image (Unsplash)
 */
export interface BackgroundImage {
  id: string;
  url: string;
  author_name: string;
  author_url: string;
  download_url?: string;
}

/**
 * Project duplication request
 */
export interface ProjectDuplicate {
  parent_project_id?: number;
  title?: string;
  include_tasks?: boolean;
  include_teams?: boolean;
  include_labels?: boolean;
  include_buckets?: boolean;
}

/**
 * Bucket entity (Kanban column)
 */
export interface Bucket extends BaseEntity {
  project_id: number;
  title: string;
  position: number;
  created?: string;
  updated?: string;
  limit?: number;
  created_by?: {
    id: number;
    username: string;
    email?: string;
  };
  tasks?: Task[];
}

/**
 * Parameters for getting buckets
 */
export interface BucketParams {
  page?: number;
  per_page?: number;
  s?: string;
  filter_by?: string | string[];
  filter_value?: string | string[];
  filter_comparator?:
    | 'equals'
    | 'greater'
    | 'greater_equals'
    | 'less'
    | 'less_equals'
    | 'like'
    | 'in';
  filter_concat?: 'and' | 'or';
  filter_include_nulls?: boolean;
}
