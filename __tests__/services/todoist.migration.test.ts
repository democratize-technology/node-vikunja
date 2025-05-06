/**
 * Tests for Todoist migration methods in MigrationService
 */
import { MigrationService } from '../../src/services/migration.service';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';
import { AuthURL, MigrationStatus, TodoistMigration } from '../../src/models/migration';

// Mock global fetch
global.fetch = jest.fn();

describe('MigrationService - Todoist', () => {
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

    it('should handle JSON parsing error in error response', async () => {
      // Mock the fetch response with an error and JSON parsing that throws
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
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
        expect((error as VikunjaError).message).toBe('API request failed with status 500');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(500);
      }
    });

    it('should handle network errors', async () => {
      // Mock fetch to throw a network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));
      
      // Call the method and expect it to throw
      await expect(service.getTodoistAuthUrl()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getTodoistAuthUrl();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network failure');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(0);
      }
    });

    it('should handle empty error message in network errors', async () => {
      // Create an error without a message
      const emptyError = new Error();
      emptyError.message = '';
      
      // Mock fetch to throw a network error with empty message
      (global.fetch as jest.Mock).mockRejectedValue(emptyError);
      
      // Call the method and expect it to throw
      await expect(service.getTodoistAuthUrl()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getTodoistAuthUrl();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network error');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(0);
      }
    });

    it('should handle non-Error objects thrown by fetch', async () => {
      // Mock fetch to throw an object that's not an Error and doesn't have a message property
      (global.fetch as jest.Mock).mockRejectedValue({ code: 'NETWORK_FAILURE' });
      
      // Call the method and expect it to throw
      await expect(service.getTodoistAuthUrl()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getTodoistAuthUrl();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network error'); // Should use default message
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(0);
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

    it('should handle error with missing code', async () => {
      const migration: TodoistMigration = {
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
      await expect(service.migrateTodoist(migration)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateTodoist(migration);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(0); // Default value when code is missing
        expect((error as VikunjaError).status).toBe(500);
      }
    });
    
    it('should handle error with empty message', async () => {
      const migration: TodoistMigration = {
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
      await expect(service.migrateTodoist(migration)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateTodoist(migration);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(`API request failed with status 500`); // Default message
        expect((error as VikunjaError).code).toBe(500);
        expect((error as VikunjaError).status).toBe(500);
      }
    });

    it('should handle response with unusual error structure', async () => {
      const migration: TodoistMigration = {
        code: 'invalid-auth-code'
      };
      
      // Mock fetch to return an error response with unusual structure
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ error: { details: 'Something went wrong' } }),
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
        expect((error as VikunjaError).message).toBe('API request failed with status 500');
        expect((error as VikunjaError).code).toBe(0);
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

    it('should handle error without json method', async () => {
      // Mock the fetch response with an error response that doesn't have json method
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        // This is a key difference - no json method!
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
        expect((error as VikunjaError).message).toBe('API request failed with status 500');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(500);
      }
    });

    it('should handle unexpected error during network request', async () => {
      // Create a custom error that will be thrown by the fetch mock
      class CustomError {}
      
      // Mock fetch to throw an unexpected error type
      (global.fetch as jest.Mock).mockRejectedValue(new CustomError());
      
      // Call the method and expect it to throw
      await expect(service.getTodoistMigrationStatus()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getTodoistMigrationStatus();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network error');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(0);
      }
    });
  });
});