/**
 * Models for user settings
 */
import { BaseEntity, JSONObject } from './common';

/**
 * Avatar provider types
 */
export enum AvatarProvider {
  Gravatar = 'gravatar',
  Upload = 'upload',
  Initials = 'initials',
  Marble = 'marble',
}

/**
 * User avatar provider settings
 */
export interface UserAvatarProvider extends JSONObject {
  /**
   * The avatar provider type
   */
  provider: AvatarProvider;

  /**
   * Email for gravatar (optional, used only for gravatar provider)
   */
  email?: string;
}

/**
 * General user settings
 */
export interface UserSettings extends JSONObject {
  /**
   * User's email address
   */
  email?: string;

  /**
   * User's name
   */
  name?: string;

  /**
   * Whether email reminders are enabled
   */
  email_reminders_enabled?: boolean;

  /**
   * Whether the user can be discovered by name
   */
  discoverable_by_name?: boolean;

  /**
   * Whether the user can be discovered by email
   */
  discoverable_by_email?: boolean;

  /**
   * Default project ID
   */
  default_project_id?: number;

  /**
   * First day of the week (0 = Sunday, 1 = Monday, etc.)
   */
  week_start?: number;

  /**
   * User's timezone (e.g., "Europe/Berlin")
   */
  timezone?: string;

  /**
   * User's language preference
   */
  language?: string;
}

/**
 * Email update request
 */
export interface EmailUpdate extends JSONObject {
  /**
   * New email address
   */
  email: string;

  /**
   * Current password for verification
   */
  password: string;
}

/**
 * API token
 */
export interface Token extends BaseEntity {
  /**
   * Token string
   */
  token?: string;

  /**
   * Creation timestamp (ISO 8601)
   */
  created?: string;

  /**
   * Expiration timestamp (ISO 8601)
   */
  expires?: string;
}

/**
 * TOTP (Time-based One-Time Password) settings
 */
export interface TOTP extends JSONObject {
  /**
   * Whether TOTP is enabled
   */
  enabled: boolean;

  /**
   * TOTP URL for QR code
   */
  url?: string;

  /**
   * TOTP secret key
   */
  secret?: string;
}

/**
 * TOTP passcode for enabling TOTP
 */
export interface TOTPPasscode extends JSONObject {
  /**
   * The TOTP passcode
   */
  passcode: string;
}

/**
 * Login credentials
 * Used for disabling TOTP
 */
export interface Login extends JSONObject {
  /**
   * User's username or email
   */
  username?: string;

  /**
   * User's password
   */
  password?: string;

  /**
   * TOTP passcode (for 2FA login)
   */
  totp?: string;
}
