/**
 * Migration service for Vikunja API
 */
import { VikunjaService, VikunjaError, VikunjaAuthenticationError } from '../core/service.js';
import { ErrorResponse } from '../core/errors.js';
import { Message } from '../models/common.js';
import {
  AuthURL,
  MigrationStatus,
  TodoistMigration,
  MicrosoftTodoMigration,
  TrelloMigration,
} from '../models/migration.js';

/**
 * Handles migration operations with the Vikunja API
 */
export class MigrationService extends VikunjaService {
  /**
   * Get the authentication URL for Todoist
   *
   * @returns The auth URL object
   */
  async getTodoistAuthUrl(): Promise<AuthURL> {
    return this.request<AuthURL>('/migration/todoist/auth', 'GET');
  }

  /**
   * Migrate data from Todoist to Vikunja
   *
   * @param migration - Object containing the Todoist authorization code
   * @returns Success message
   */
  async migrateTodoist(migration: TodoistMigration): Promise<Message> {
    return this.request<Message>('/migration/todoist/migrate', 'POST', migration);
  }

  /**
   * Get the status of an ongoing Todoist migration
   *
   * @returns Migration status object
   */
  async getTodoistMigrationStatus(): Promise<MigrationStatus> {
    return this.request<MigrationStatus>('/migration/todoist/status', 'GET');
  }

  /**
   * Migrate data from TickTick to Vikunja
   *
   * @param file - The TickTick backup CSV file
   * @returns Success message
   */
  async migrateTickTick(file: File): Promise<Message> {
    const url = this.buildUrl('/migration/ticktick/migrate');
    const formData = new FormData();
    formData.append('import', file);

    // Create fetch request manually for FormData
    const headers: HeadersInit = {};

    // Add authorization header if token is available
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        let errorResponse: ErrorResponse;
        try {
          errorData = await response.json();
          errorResponse = {
            ...errorData
          };
        } catch {
          errorResponse = {
            message: `API request failed with status ${response.status}`
          };
        }

        const errorMessage = errorResponse.message || `API request failed with status ${response.status}`;
        const endpoint = '/migration/ticktick/migrate';
        const method = 'POST';
        
        if (response.status === 401 || response.status === 403) {
          throw new VikunjaAuthenticationError(
            errorMessage,
            endpoint,
            method,
            response.status,
            errorResponse
          );
        } else {
          throw new VikunjaError(
            errorMessage,
            endpoint,
            method,
            response.status,
            errorResponse
          );
        }
      }

      return (await response.json()) as Message;
    } catch (error) {
      // Re-throw VikunjaError
      if (error instanceof VikunjaError) {
        throw error;
      }

      // Handle network errors
      throw new VikunjaError(
        (error as Error).message || 'Network error',
        '/migration/ticktick/migrate',
        'POST',
        0,
        { message: (error as Error).message || 'Network error' }
      );
    }
  }

  /**
   * Get the status of an ongoing TickTick migration
   *
   * @returns Migration status object
   */
  async getTickTickMigrationStatus(): Promise<MigrationStatus> {
    return this.request<MigrationStatus>('/migration/ticktick/status', 'GET');
  }

  /**
   * Get the authentication URL for Microsoft Todo
   *
   * @returns The auth URL object
   */
  async getMicrosoftTodoAuthUrl(): Promise<AuthURL> {
    return this.request<AuthURL>('/migration/microsoft-todo/auth', 'GET');
  }

  /**
   * Migrate data from Microsoft Todo to Vikunja
   *
   * @param migration - Object containing the Microsoft Todo authorization code
   * @returns Success message
   */
  async migrateMicrosoftTodo(migration: MicrosoftTodoMigration): Promise<Message> {
    return this.request<Message>('/migration/microsoft-todo/migrate', 'POST', migration);
  }

  /**
   * Get the status of an ongoing Microsoft Todo migration
   *
   * @returns Migration status object
   */
  async getMicrosoftTodoMigrationStatus(): Promise<MigrationStatus> {
    return this.request<MigrationStatus>('/migration/microsoft-todo/status', 'GET');
  }

  /**
   * Get the authentication URL for Trello
   *
   * @returns The auth URL object
   */
  async getTrelloAuthUrl(): Promise<AuthURL> {
    return this.request<AuthURL>('/migration/trello/auth', 'GET');
  }

  /**
   * Migrate data from Trello to Vikunja
   *
   * @param migration - Object containing the Trello authorization code
   * @returns Success message
   */
  async migrateTrello(migration: TrelloMigration): Promise<Message> {
    return this.request<Message>('/migration/trello/migrate', 'POST', migration);
  }

  /**
   * Get the status of an ongoing Trello migration
   *
   * @returns Migration status object
   */
  async getTrelloMigrationStatus(): Promise<MigrationStatus> {
    return this.request<MigrationStatus>('/migration/trello/status', 'GET');
  }

  /**
   * Migrate data from a Vikunja export file
   *
   * @param file - The Vikunja export zip file
   * @returns Success message
   */
  async migrateVikunjaFile(file: File): Promise<Message> {
    const url = this.buildUrl('/migration/vikunja-file/migrate');
    const formData = new FormData();
    formData.append('import', file);

    // Create fetch request manually for FormData
    const headers: HeadersInit = {};

    // Add authorization header if token is available
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        let errorResponse: ErrorResponse;
        try {
          errorData = await response.json();
          errorResponse = {
            ...errorData
          };
        } catch {
          errorResponse = {
            message: `API request failed with status ${response.status}`
          };
        }

        const errorMessage = errorResponse.message || `API request failed with status ${response.status}`;
        const endpoint = '/migration/vikunja-file/migrate';
        const method = 'POST';
        
        if (response.status === 401 || response.status === 403) {
          throw new VikunjaAuthenticationError(
            errorMessage,
            endpoint,
            method,
            response.status,
            errorResponse
          );
        } else {
          throw new VikunjaError(
            errorMessage,
            endpoint,
            method,
            response.status,
            errorResponse
          );
        }
      }

      return (await response.json()) as Message;
    } catch (error) {
      // Re-throw VikunjaError
      if (error instanceof VikunjaError) {
        throw error;
      }

      // Handle network errors
      throw new VikunjaError(
        (error as Error).message || 'Network error',
        '/migration/vikunja-file/migrate',
        'POST',
        0,
        { message: (error as Error).message || 'Network error' }
      );
    }
  }

  /**
   * Get the status of an ongoing Vikunja file migration
   *
   * @returns Migration status object
   */
  async getVikunjaFileMigrationStatus(): Promise<MigrationStatus> {
    return this.request<MigrationStatus>('/migration/vikunja-file/status', 'GET');
  }
}
