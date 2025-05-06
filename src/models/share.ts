/**
 * Types and interfaces for project sharing functionality
 */
import { BaseEntity, Pagination, SearchParams } from './common';

/**
 * Sharing type enumeration
 */
export enum SharingType {
  Read = 0,
  Write = 1,
  Admin = 2,
}

/**
 * Authentication data for accessing a password-protected share
 */
export interface LinkShareAuth {
  /**
   * The password for the share
   */
  password: string;
}

/**
 * Represents a link sharing for a project
 */
export interface LinkSharing extends BaseEntity {
  /**
   * The project ID this share belongs to
   */
  project_id?: number;

  /**
   * The hash used in the sharing link
   */
  hash?: string;

  /**
   * The right this share grants
   */
  right?: SharingType;

  /**
   * A user-defined label for the share
   */
  label?: string;

  /**
   * Indicates if password protection is enabled
   */
  password_enabled?: boolean;

  /**
   * Optional password (only used when creating/updating a share)
   */
  password?: string;

  /**
   * The date when the share was created
   */
  created?: string;

  /**
   * The date when the share expires (or null if it doesn't expire)
   */
  expires?: string | null;

  /**
   * The full sharing URL (read-only, set by the server)
   */
  sharing_url?: string;
}

/**
 * Parameters for getting link shares
 */
export interface GetLinkSharesParams extends Pagination, SearchParams {
  // Additional parameters can be added if needed
}
