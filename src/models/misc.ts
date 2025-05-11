/**
 * Miscellaneous domain interfaces
 */
import { BaseEntity } from './common.js';

/**
 * Team entity
 */
export interface Team extends BaseEntity {
  name: string;
  description?: string;
  created_by?: {
    id: number;
    username: string;
    email?: string;
  };
  created?: string;
  updated?: string;
}

/**
 * Team membership
 */
export interface TeamUser {
  team_id: number;
  user_id: number;
  admin?: boolean;
  created?: string;
  updated?: string;
}

/**
 * API token
 */
export interface APIToken extends BaseEntity {
  title: string;
  token?: string;
  created_by?: {
    id: number;
    username: string;
    email?: string;
  };
  created?: string;
  updated?: string;
  last_used?: string;
  expires?: string;
  right?: 'read' | 'write' | 'admin';
}

/**
 * API token route
 */
export interface APITokenRoute {
  path: string;
  method: string;
  description?: string;
}

/**
 * Database notification
 */
export interface DatabaseNotification extends BaseEntity {
  subject: string;
  message?: string;
  read: boolean;
  created?: string;
  entity_id: number;
  entity_type: string;
  user_id: number;
  project_id?: number;
}
