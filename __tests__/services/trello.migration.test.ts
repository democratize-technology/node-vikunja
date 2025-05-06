/**
 * Tests for Trello migration methods in MigrationService
 */
import { MigrationService } from '../../src/services/migration.service';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';
import { AuthURL, MigrationStatus, TrelloMigration } from '../../src/models/migration';

// Mock global fetch
global.fetch = jest.fn();

describe('MigrationService - Trello', () => {
  let service: MigrationService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new MigrationService(mockBaseUrl, mockToken);
  });
  
  describe('getTrelloAuthUrl', () => {
    it('should get Trello auth URL successfully', async () => {
      const mockResponse: AuthURL = {
        url: 'https://trello.com/1/authorize?expiration=1day&name=Vikunja&scope=read&key=xxx&callback_method=fragment&return_url=yyy'
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
      const result = await service.getTrelloAuthUrl();
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/migration/trello/auth`,
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
      await expect(service.getTrelloAuthUrl()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getTrelloAuthUrl();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
  });
  
  describe('migrateTrello', () => {
    it('should initiate Trello migration successfully', async () => {
      const migration: TrelloMigration = {
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
      const result = await service.migrateTrello(migration);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/migration/trello/migrate`,
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
      const migration: TrelloMigration = {
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
      await expect(service.migrateTrello(migration)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateTrello(migration);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
  });
  
  describe('getTrelloMigrationStatus', () => {
    it('should get Trello migration status successfully', async () => {
      const mockResponse: MigrationStatus = {
        running: true,
        total: 100,
        done: 50,
        current: 'Processing boards'
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
      const result = await service.getTrelloMigrationStatus();
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/migration/trello/status`,
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
      await expect(service.getTrelloMigrationStatus()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getTrelloMigrationStatus();
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
      await expect(service.getTrelloMigrationStatus()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getTrelloMigrationStatus();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('API request failed with status 500');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
  });
});