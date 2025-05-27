/**
 * Tests for TickTick migration methods in MigrationService
 */
import { MigrationService } from '../../src/services/migration.service';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';
import { MigrationStatus } from '../../src/models/migration';

// Mock global fetch
global.fetch = jest.fn();

describe('MigrationService - TickTick', () => {
  let service: MigrationService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new MigrationService(mockBaseUrl, mockToken);
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

    it('should handle file upload error', async () => {
      const mockFile = new File(["invalid content"], "invalid_export.csv", { type: "text/csv" });
      
      const errorResponse = {
        code: 400,
        message: 'Invalid CSV file'
      };
      
      // Mock the fetch response with an error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      });
      
      // Call the method and expect it to throw
      await expect(service.migrateTickTick(mockFile)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateTickTick(mockFile);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response).toEqual(errorResponse);
        expect((error as VikunjaError).statusCode).toBe(400);
      }
    });

    it('should handle JSON parsing error in error response', async () => {
      const mockFile = new File(["invalid content"], "invalid_export.csv", { type: "text/csv" });
      
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
      await expect(service.migrateTickTick(mockFile)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateTickTick(mockFile);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('API request failed with status 500');
        expect((error as VikunjaError).response).toEqual({ message: 'API request failed with status 500' });
        expect((error as VikunjaError).statusCode).toBe(500);
      }
    });

    it('should handle network errors', async () => {
      const mockFile = new File(["valid content"], "ticktick_export.csv", { type: "text/csv" });
      
      // Mock fetch to throw a network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));
      
      // Call the method and expect it to throw
      await expect(service.migrateTickTick(mockFile)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateTickTick(mockFile);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network failure');
        expect((error as VikunjaError).response).toEqual({ message: 'Network failure' });
        expect((error as VikunjaError).statusCode).toBe(0);
      }
    });

    it('should handle empty error message in network errors', async () => {
      const mockFile = new File(["valid content"], "ticktick_export.csv", { type: "text/csv" });
      
      // Create an error without a message
      const emptyError = new Error();
      emptyError.message = '';
      
      // Mock fetch to throw a network error with empty message
      (global.fetch as jest.Mock).mockRejectedValue(emptyError);
      
      // Call the method and expect it to throw
      await expect(service.migrateTickTick(mockFile)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateTickTick(mockFile);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network error');
        expect((error as VikunjaError).response).toEqual({ message: 'Network error' });
        expect((error as VikunjaError).statusCode).toBe(0);
      }
    });

    it('should handle non-Error objects thrown by fetch', async () => {
      const mockFile = new File(["valid content"], "ticktick_export.csv", { type: "text/csv" });
      
      // Mock fetch to throw an object that's not an Error and doesn't have a message property
      (global.fetch as jest.Mock).mockRejectedValue({ code: 'NETWORK_FAILURE' });
      
      // Call the method and expect it to throw
      await expect(service.migrateTickTick(mockFile)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateTickTick(mockFile);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network error'); // Should use default message
        expect((error as VikunjaError).response).toEqual({ message: 'Network error' });
        expect((error as VikunjaError).statusCode).toBe(0);
      }
    });

    it('should handle response with unusual error structure', async () => {
      const mockFile = new File(["valid content"], "ticktick_export.csv", { type: "text/csv" });
      
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
      await expect(service.migrateTickTick(mockFile)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateTickTick(mockFile);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('API request failed with status 500');
        expect((error as VikunjaError).response).toEqual({ error: { details: 'Something went wrong' } });
        expect((error as VikunjaError).statusCode).toBe(500);
      }
    });

    it('should handle unexpected error during network request', async () => {
      const mockFile = new File(["valid content"], "ticktick_export.csv", { type: "text/csv" });
      
      // Create a custom error that will be thrown by the fetch mock
      class CustomError {}
      
      // Mock fetch to throw an unexpected error type
      (global.fetch as jest.Mock).mockRejectedValue(new CustomError());
      
      // Call the method and expect it to throw
      await expect(service.migrateTickTick(mockFile)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateTickTick(mockFile);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network error');
        expect((error as VikunjaError).response).toEqual({ message: 'Network error' });
        expect((error as VikunjaError).statusCode).toBe(0);
      }
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
        expect((error as VikunjaError).response).toEqual(errorResponse);
        expect((error as VikunjaError).statusCode).toBe(500);
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
      await expect(service.getTickTickMigrationStatus()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getTickTickMigrationStatus();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('API request failed with status 500');
        expect((error as VikunjaError).response).toEqual({ message: 'API request failed with status 500' });
        expect((error as VikunjaError).statusCode).toBe(500);
      }
    });

    it('should handle error with missing code', async () => {
      // Error response missing code
      const errorResponse = {
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
        expect((error as VikunjaError).response).toEqual({ message: errorResponse.message });
        expect((error as VikunjaError).statusCode).toBe(500);
      }
    });
    
    it('should handle error with empty message', async () => {
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
      await expect(service.getTickTickMigrationStatus()).rejects.toThrow(VikunjaError);
      
      try {
        await service.getTickTickMigrationStatus();
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(`API request failed with status 500`); // Default message
        expect((error as VikunjaError).response).toEqual(errorResponse);
        expect((error as VikunjaError).statusCode).toBe(500);
      }
    });
  });
});