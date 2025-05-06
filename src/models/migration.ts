/**
 * Migration-related models for Vikunja API
 */
import { JSONObject } from './common';

/**
 * Interface for migration status
 */
export interface MigrationStatus extends JSONObject {
  /**
   * Whether a migration is currently running
   */
  running: boolean;

  /**
   * Amount of total items to be migrated
   */
  total?: number;

  /**
   * Amount of items currently migrated
   */
  done?: number;

  /**
   * Current item being migrated
   */
  current?: string;

  /**
   * Any error that occurred during migration
   */
  error?: string;
}

/**
 * Interface for Todoist migration
 */
export interface TodoistMigration extends JSONObject {
  /**
   * The auth code obtained from the Todoist auth URL
   */
  code: string;
}

/**
 * Interface for Microsoft Todo migration
 */
export interface MicrosoftTodoMigration extends JSONObject {
  /**
   * The auth code obtained from the Microsoft Todo auth URL
   */
  code: string;
}

/**
 * Interface for Trello migration
 */
export interface TrelloMigration extends JSONObject {
  /**
   * The auth code obtained from the Trello auth URL
   */
  code: string;
}

/**
 * Interface for authorization URL
 */
export interface AuthURL extends JSONObject {
  /**
   * The URL to authorize the integration
   */
  url: string;
}
