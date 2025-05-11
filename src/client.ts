/**
 * Main client for Vikunja API
 *
 * Copyright (c) 2025 Democratize Technology
 */

import { AuthService } from './services/auth.service.js';
import { AvatarService } from './services/avatar.service.js';
import { EventsService } from './services/events.service.js';
import { FilterService } from './services/filter.service.js';
import { LabelService } from './services/label.service.js';
import { MigrationService } from './services/migration.service.js';
import { NotificationService } from './services/notification.service.js';
import { ProjectService } from './services/project.service.js';
import { ShareService } from './services/share.service.js';
import { SubscriptionService } from './services/subscription.service.js';
import { SystemService } from './services/system.service.js';
import { TableService } from './services/table.service.js';
import { TaskService } from './services/task.service.js';
import { TeamService } from './services/team.service.js';
import { TokenService } from './services/token.service.js';
import { UserService } from './services/user.service.js';
import { AuthToken, LoginCredentials } from './models/auth.js';

/**
 * Main client for interacting with the Vikunja API
 */
export class VikunjaClient {
  /**
   * Authentication and user management
   */
  public auth: AuthService;

  /**
   * User avatar management
   */
  public avatar: AvatarService;

  /**
   * Event logging and retrieval
   */
  public events: EventsService;

  /**
   * List filter management
   */
  public filters: FilterService;

  /**
   * Label management
   */
  public labels: LabelService;

  /**
   * Data migration tools
   */
  public migration: MigrationService;

  /**
   * User notification management
   */
  public notifications: NotificationService;

  /**
   * Project management
   */
  public projects: ProjectService;

  /**
   * Content sharing
   */
  public shares: ShareService;

  /**
   * User subscriptions
   */
  public subscriptions: SubscriptionService;

  /**
   * System information
   */
  public system: SystemService;

  /**
   * Table view management
   */
  public tables: TableService;

  /**
   * Task management
   */
  public tasks: TaskService;

  /**
   * Team management
   */
  public teams: TeamService;

  /**
   * API token management
   */
  public tokens: TokenService;

  /**
   * User management
   */
  public users: UserService;

  /**
   * Create a new Vikunja client
   *
   * @param baseUrl - Base URL for the Vikunja API
   * @param token - Optional authentication token
   */
  constructor(baseUrl: string, token?: string) {
    // Initialize all services with the base URL and token
    this.auth = new AuthService(baseUrl, token || null);
    this.avatar = new AvatarService(baseUrl, token || null);
    this.events = new EventsService(baseUrl, token || null);
    this.filters = new FilterService(baseUrl, token || null);
    this.labels = new LabelService(baseUrl, token || null);
    this.migration = new MigrationService(baseUrl, token || null);
    this.notifications = new NotificationService(baseUrl, token || null);
    this.projects = new ProjectService(baseUrl, token || null);
    this.shares = new ShareService(baseUrl, token || null);
    this.subscriptions = new SubscriptionService(baseUrl, token || null);
    this.system = new SystemService(baseUrl, token || null);
    this.tables = new TableService(baseUrl, token || null);
    this.tasks = new TaskService(baseUrl, token || null);
    this.teams = new TeamService(baseUrl, token || null);
    this.tokens = new TokenService(baseUrl, token || null);
    this.users = new UserService(baseUrl, token || null);
  }

  /**
   * Set the authentication token across all services
   *
   * @param token - Authentication token
   */
  setToken(token: string): void {
    this.auth.setToken(token);
    this.avatar.setToken(token);
    this.events.setToken(token);
    this.filters.setToken(token);
    this.labels.setToken(token);
    this.migration.setToken(token);
    this.notifications.setToken(token);
    this.projects.setToken(token);
    this.shares.setToken(token);
    this.subscriptions.setToken(token);
    this.system.setToken(token);
    this.tables.setToken(token);
    this.tasks.setToken(token);
    this.teams.setToken(token);
    this.tokens.setToken(token);
    this.users.setToken(token);
  }

  /**
   * Clear the authentication token across all services
   */
  clearToken(): void {
    this.auth.clearToken();
    this.avatar.clearToken();
    this.events.clearToken();
    this.filters.clearToken();
    this.labels.clearToken();
    this.migration.clearToken();
    this.notifications.clearToken();
    this.projects.clearToken();
    this.shares.clearToken();
    this.subscriptions.clearToken();
    this.system.clearToken();
    this.tables.clearToken();
    this.tasks.clearToken();
    this.teams.clearToken();
    this.tokens.clearToken();
    this.users.clearToken();
  }

  /**
   * Login with username and password
   *
   * @param username - Username
   * @param password - Password
   * @param totpPasscode - Optional TOTP passcode
   * @returns Authentication token information
   */
  async login(username: string, password: string, totpPasscode?: string): Promise<AuthToken> {
    const credentials: LoginCredentials = {
      username,
      password,
    };

    if (totpPasscode) {
      credentials.totp_passcode = totpPasscode;
    }

    const authToken = await this.auth.login(credentials);

    // Update token across all services
    if (authToken.token) {
      this.setToken(authToken.token);
    }

    return authToken;
  }

  /**
   * Renew the current user's authentication token
   *
   * @returns New token information
   */
  async renewToken(): Promise<AuthToken> {
    const authToken = await this.auth.renewToken();

    // Update token across all services
    if (authToken.token) {
      this.setToken(authToken.token);
    }

    return authToken;
  }
}
