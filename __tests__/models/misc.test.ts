/**
 * Tests for misc domain models
 */
import {
  Team,
  TeamUser,
  APIToken,
  APITokenRoute,
  DatabaseNotification,
} from '../../src/models/misc';
import { VikunjaInfo } from '../../src/models/system';

describe('Misc Models', () => {
  describe('VikunjaInfo', () => {
    it('should have the correct structure', () => {
      const info: VikunjaInfo = {
        version: '0.20.0',
        frontend_url: 'https://vikunja.example.com',
        motd: 'Welcome to Vikunja!',
        jwt_ttl: 3600,
        registration_enabled: true,
        email_reminders_enabled: true,
        legal: {
          imprint_url: 'https://vikunja.example.com/imprint',
          privacy_policy_url: 'https://vikunja.example.com/privacy',
        },
        auth: {
          local: {
            enabled: true,
          },
          openid: {
            enabled: true,
            providers: [
              {
                id: 1,
                name: 'Google',
                auth_url: 'https://accounts.google.com/o/oauth2/auth',
                client_id: 'client-id',
              },
            ],
          },
        },
      };

      expect(info.version).toBe('0.20.0');
      expect(info.frontend_url).toBe('https://vikunja.example.com');
      expect(info.auth?.local?.enabled).toBe(true);
      expect(info.auth?.openid?.providers?.[0].name).toBe('Google');
    });
  });

  describe('Team', () => {
    it('should extend BaseEntity', () => {
      const team: Team = {
        id: 1,
        name: 'Development Team',
        description: 'Team for development tasks',
        created_by: {
          id: 5,
          username: 'admin',
        },
        created: '2025-05-05T10:30:00Z',
        updated: '2025-05-05T10:30:00Z',
      };

      expect(team).toHaveProperty('id');
      expect(team.name).toBe('Development Team');
      expect(team.created_by?.id).toBe(5);
    });
  });

  describe('TeamUser', () => {
    it('should have the correct structure', () => {
      const teamUser: TeamUser = {
        team_id: 1,
        user_id: 5,
        admin: true,
        created: '2025-05-05T10:30:00Z',
        updated: '2025-05-05T10:30:00Z',
      };

      expect(teamUser.team_id).toBe(1);
      expect(teamUser.user_id).toBe(5);
      expect(teamUser.admin).toBe(true);
    });
  });

  describe('APIToken', () => {
    it('should extend BaseEntity', () => {
      const token: APIToken = {
        id: 1,
        title: 'API Access',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        right: 'read',
        created_by: {
          id: 5,
          username: 'admin',
        },
        created: '2025-05-05T10:30:00Z',
        updated: '2025-05-05T10:30:00Z',
        last_used: '2025-05-05T10:35:00Z',
        expires: '2026-05-05T10:30:00Z',
      };

      expect(token).toHaveProperty('id');
      expect(token.title).toBe('API Access');
      expect(token.right).toBe('read');
    });
  });

  describe('APITokenRoute', () => {
    it('should have the correct structure', () => {
      const route: APITokenRoute = {
        path: '/projects',
        method: 'GET',
        description: 'Get all projects a user has access to',
      };

      expect(route.path).toBe('/projects');
      expect(route.method).toBe('GET');
      expect(route.description).toBe('Get all projects a user has access to');
    });
  });

  describe('DatabaseNotification', () => {
    it('should extend BaseEntity', () => {
      const notification: DatabaseNotification = {
        id: 1,
        subject: 'Task Assignment',
        message: 'You have been assigned to a new task',
        read: false,
        created: '2025-05-05T10:30:00Z',
        entity_id: 42,
        entity_type: 'task',
        user_id: 5,
      };

      expect(notification).toHaveProperty('id');
      expect(notification.subject).toBe('Task Assignment');
      expect(notification.read).toBe(false);
      expect(notification.entity_id).toBe(42);
    });
  });
});
