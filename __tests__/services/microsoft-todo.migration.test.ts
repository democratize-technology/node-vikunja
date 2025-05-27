/**
 * Tests for Microsoft Todo migration methods in MigrationService
 */
import { MigrationService } from '../../src/services/migration.service';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';
import { AuthURL, MigrationStatus, MicrosoftTodoMigration } from '../../src/models/migration';

// Mock global fetch
global.fetch = jest.fn();

describe('MigrationService - Microsoft Todo', () => {
  let service: MigrationService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new MigrationService(mockBaseUrl, mockToken);
  });
  
  describe('getMicrosoftTodoAuthUrl', () => {
    it('should get Microsoft Todo auth URL successfully', async () => {
      const mockResponse: AuthURL = {
        url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=xxx&scope=Tasks.ReadWrite&state=yyy'
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
      const result = await service.getMicrosoftTodoAuthUrl();
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/migration/microsoft-todo/auth`,
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
      await expect(service.getMicrosoftTodoAuthUrl()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getMicrosoftTodoAuthUrl();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response).toEqual(errorResponse);
        expect((error as VikunjaError).statusCode).toBe(500);
      }
    });
  });
  
  describe('migrateMicrosoftTodo', () => {
    it('should initiate Microsoft Todo migration successfully', async () => {
      const migration: MicrosoftTodoMigration = {
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
      const result = await service.migrateMicrosoftTodo(migration);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/migration/microsoft-todo/migrate`,
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
      const migration: MicrosoftTodoMigration = {
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
      await expect(service.migrateMicrosoftTodo(migration)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateMicrosoftTodo(migration);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response).toEqual(errorResponse);
        expect((error as VikunjaError).statusCode).toBe(500);
      }
    });
    
    it('should handle error with missing code', async () => {
      const migration: MicrosoftTodoMigration = {
        code: 'invalid-auth-code'
      };
      
      // Error response missing code
      const errorResponse = {
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
      await expect(service.migrateMicrosoftTodo(migration)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateMicrosoftTodo(migration);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response).toEqual({ message: errorResponse.message });
        expect((error as VikunjaError).statusCode).toBe(500);
      }
    });
    
    it('should handle error with empty message', async () => {
      const migration: MicrosoftTodoMigration = {
        code: 'invalid-auth-code'
      };
      
      // Error response with empty message
      const errorResponse = {
        code: 500,
        message: ''
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
      await expect(service.migrateMicrosoftTodo(migration)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateMicrosoftTodo(migration);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(`API request failed with status 500`); // Default message
        expect((error as VikunjaError).response).toEqual(errorResponse);
        expect((error as VikunjaError).statusCode).toBe(500);
      }
    });
  });
  
  describe('getMicrosoftTodoMigrationStatus', () => {
    it('should get Microsoft Todo migration status successfully', async () => {
      const mockResponse: MigrationStatus = {
        running: true,
        total: 100,
        done: 50,
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
      const result = await service.getMicrosoftTodoMigrationStatus();
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/migration/microsoft-todo/status`,
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
      await expect(service.getMicrosoftTodoMigrationStatus()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getMicrosoftTodoMigrationStatus();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response).toEqual(errorResponse);
        expect((error as VikunjaError).statusCode).toBe(500);
      }
    });
  });
});