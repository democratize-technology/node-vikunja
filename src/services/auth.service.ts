/**
 * Authentication service for Vikunja API
 */
import { VikunjaService } from '../core/service.js';
import { AuthToken, LoginCredentials, OpenIDCallback, User, UserCreation } from '../models/auth.js';

/**
 * Handles authentication with the Vikunja API
 */
export class AuthService extends VikunjaService {
  /**
   * Login with username and password
   *
   * @param credentials - Login credentials
   * @returns Authentication token information
   */
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    return this.request<AuthToken>('/login', 'POST', credentials);
  }

  /**
   * Register a new user
   *
   * @param user - User registration data
   * @returns Created user
   */
  async register(user: UserCreation): Promise<User> {
    return this.request<User>('/register', 'POST', user);
  }

  /**
   * Authenticate with OpenID Connect
   *
   * @param callback - OpenID callback data
   * @returns Authentication token information
   */
  async openIDAuthenticate(callback: OpenIDCallback): Promise<AuthToken> {
    return this.request<AuthToken>(`/auth/openid/${callback.provider}/callback`, 'POST', callback);
  }

  /**
   * Authenticate a user with OpenID Connect
   *
   * @param providerId - The OpenID Connect provider key
   * @param callback - The OpenID callback data
   * @returns Authentication token
   */
  async authenticate(providerId: number, callback: OpenIDCallback): Promise<AuthToken> {
    return this.request<AuthToken>(`/auth/openid/${providerId}/callback`, 'POST', callback);
  }

  /**
   * Renew the current user's authentication token
   *
   * @returns New token information
   */
  async renewToken(): Promise<AuthToken> {
    return this.request<AuthToken>('/user/token', 'POST');
  }
}
