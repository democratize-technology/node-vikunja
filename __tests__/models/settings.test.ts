/**
 * Tests for the Settings models
 */
import {
  UserAvatarProvider,
  AvatarProvider,
  UserSettings,
  EmailUpdate,
  Token,
  TOTP,
  TOTPPasscode
} from '../../src/models/settings';

describe('Settings Models', () => {
  describe('UserAvatarProvider', () => {
    it('should create a valid UserAvatarProvider object', () => {
      const avatar: UserAvatarProvider = {
        provider: AvatarProvider.Gravatar,
        email: 'test@example.com',
      };
      
      expect(avatar.provider).toBe(AvatarProvider.Gravatar);
      expect(avatar.email).toBe('test@example.com');
    });
    
    it('should handle all possible avatar providers', () => {
      // Check all enum values exist
      expect(AvatarProvider.Gravatar).toBe('gravatar');
      expect(AvatarProvider.Upload).toBe('upload');
      expect(AvatarProvider.Initials).toBe('initials');
      expect(AvatarProvider.Marble).toBe('marble');
    });
  });
  
  describe('UserSettings', () => {
    it('should create a valid UserSettings object', () => {
      const settings: UserSettings = {
        email_reminders_enabled: true,
        discoverable_by_name: false,
        discoverable_by_email: true,
        default_project_id: 123,
        week_start: 0,
        timezone: 'Europe/Berlin',
        language: 'en',
        email: 'test@example.com',
        name: 'Test User',
      };
      
      expect(settings.email_reminders_enabled).toBe(true);
      expect(settings.discoverable_by_name).toBe(false);
      expect(settings.discoverable_by_email).toBe(true);
      expect(settings.default_project_id).toBe(123);
      expect(settings.week_start).toBe(0);
      expect(settings.timezone).toBe('Europe/Berlin');
      expect(settings.language).toBe('en');
      expect(settings.email).toBe('test@example.com');
      expect(settings.name).toBe('Test User');
    });
  });
  
  describe('EmailUpdate', () => {
    it('should create a valid EmailUpdate object', () => {
      const emailUpdate: EmailUpdate = {
        email: 'newemail@example.com',
        password: 'securePassword123',
      };
      
      expect(emailUpdate.email).toBe('newemail@example.com');
      expect(emailUpdate.password).toBe('securePassword123');
    });
  });
  
  describe('Token', () => {
    it('should create a valid Token object', () => {
      const token: Token = {
        id: 123,
        token: 'abc123def456',
        created: '2025-05-05T12:00:00Z',
        expires: '2026-05-05T12:00:00Z',
      };
      
      expect(token.id).toBe(123);
      expect(token.token).toBe('abc123def456');
      expect(token.created).toBe('2025-05-05T12:00:00Z');
      expect(token.expires).toBe('2026-05-05T12:00:00Z');
    });
  });
  
  describe('TOTP', () => {
    it('should create a valid TOTP object', () => {
      const totp: TOTP = {
        enabled: true,
        url: 'otpauth://totp/Vikunja:user@example.com?secret=ABC123&issuer=Vikunja',
        secret: 'ABC123',
      };
      
      expect(totp.enabled).toBe(true);
      expect(totp.url).toBe('otpauth://totp/Vikunja:user@example.com?secret=ABC123&issuer=Vikunja');
      expect(totp.secret).toBe('ABC123');
    });
    
    it('should handle disabled TOTP', () => {
      const totp: TOTP = {
        enabled: false,
      };
      
      expect(totp.enabled).toBe(false);
      expect(totp.url).toBeUndefined();
      expect(totp.secret).toBeUndefined();
    });
  });
  
  describe('TOTPPasscode', () => {
    it('should create a valid TOTPPasscode object', () => {
      const passcode: TOTPPasscode = {
        passcode: '123456',
      };
      
      expect(passcode.passcode).toBe('123456');
    });
  });
});
