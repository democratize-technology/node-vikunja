/**
 * Comprehensive tests for the MigrationService
 */
import { MigrationService } from '../../src/services/migration.service';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';
import { AuthURL, MigrationStatus, TodoistMigration } from '../../src/models/migration';

// Mock global fetch
global.fetch = jest.fn();

describe('MigrationService', () => {
  let service: MigrationService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new MigrationService(mockBaseUrl, mockToken);
  });
  
  describe('getTodoistAuthUrl', () => {
    it('should get Todoist auth URL successfully', async () => {
      const mockResponse: AuthURL = {
        url: 'https://todoist.com/oauth/authorize?client_id=xxx&scope=data:read&state=yyy'
      };
      
      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      });
      
      // Call the service
      const result = await service.getTodoistAuthUrl();
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/migration/todoist/auth`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle server error', async () => {
      const errorResponse = {
        code: 500,
        message: 'Internal server error'
      };
      
      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      });
      
      // Call the method and expect it to throw
      await expect(service.getTodoistAuthUrl()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getTodoistAuthUrl();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
  });
  
  describe('migrateTodoist', () => {
    it('should initiate Todoist migration successfully', async () => {
      const migration: TodoistMigration = {
        code: 'valid-auth-code'
      };
      
      const mockResponse: Message = {
        message: 'Migration initiated successfully'
      };
      
      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      });
      
      // Call the service
      const result = await service.migrateTodoist(migration);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/migration/todoist/migrate`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(migration),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle invalid auth code error', async () => {
      const migration: TodoistMigration = {
        code: 'invalid-auth-code'
      };
      
      const errorResponse = {
        code: 500,
        message: 'Invalid authentication code'
      };
      
      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      });
      
      // Call the method and expect it to throw
      await expect(service.migrateTodoist(migration)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateTodoist(migration);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
  });
  
  describe('getTodoistMigrationStatus', () => {
    it('should get Todoist migration status successfully', async () => {
      const mockResponse: MigrationStatus = {
        running: true,
        total: 100,
        done: 50,
        current: 'Processing projects'
      };
      
      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      });
      
      // Call the service
      const result = await service.getTodoistMigrationStatus();
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/migration/todoist/status`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle server error', async () => {
      const errorResponse = {
        code: 500,
        message: 'Internal server error'
      };
      
      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      });
      
      // Call the method and expect it to throw
      await expect(service.getTodoistMigrationStatus()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getTodoistMigrationStatus();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
  });
  
  describe('migrateTickTick', () => {
    it('should initiate TickTick migration successfully', async () => {
      const mockFile = new File(["ticktick csv content"], "ticktick_export.csv", { type: "text/csv" });
      
      const mockResponse: Message = {
        message: 'Migration initiated successfully'
      };
      
      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      });
      
      // Call the service
      const result = await service.migrateTickTick(mockFile);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/migration/ticktick/migrate`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          }),
          body: expect.any(FormData)
        })
      );
      
      // Verify response
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('getTickTickMigrationStatus', () => {
    it('should get TickTick migration status successfully', async () => {
      const mockResponse: MigrationStatus = {
        running: true,
        total: 100,
        done: 75,
        current: 'Processing tasks'
      };
      
      // Mock the fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      });
      
      // Call the service
      const result = await service.getTickTickMigrationStatus();
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/migration/ticktick/status`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle server error', async () => {
      const errorResponse = {
        code: 500,
        message: 'Internal server error'
      };
      
      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      });
      
      // Call the method and expect it to throw
      await expect(service.getTickTickMigrationStatus()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getTickTickMigrationStatus();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
  });
});