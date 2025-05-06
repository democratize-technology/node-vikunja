/**
 * Authentication related interfaces
 */
import { BaseEntity } from './common';

/**
 * Login credentials for authentication
 */
export interface LoginCredentials {
  username: string;
  password: string;
  totp_passcode?: string;
}

/**
 * Authentication token response
 */
export interface AuthToken {
  token: string;
  expires_at: string;
}

/**
 * OpenID callback parameters
 */
export interface OpenIDCallback {
  code: string;
  provider: number;
}

/**
 * User information
 */
export interface User extends BaseEntity {
  username: string;
  email?: string;
  name?: string;
  is_active?: boolean;
  created?: string;
  updated?: string;
}

/**
 * User creation parameters
 */
export interface UserCreation {
  username: string;
  email: string;
  password: string;
}
