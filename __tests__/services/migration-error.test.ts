/**
 * Error handling tests for MigrationService
 */
import { MigrationService } from '../../src/services/migration.service';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('MigrationService - Error Handling', () => {
  let service: MigrationService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new MigrationService(mockBaseUrl, mockToken);
  });
  
  describe('migrateTickTick error handling', () => {
    it('should handle invalid JSON error response', async () => {
      const mockFile = new File(["ticktick csv content"], "ticktick_export.csv", { type: "text/csv" });
      
      // Mock a fetch response that fails to parse as JSON
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: new Headers({
          'content-type': 'text/plain', // Not JSON
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
      const mockFile = new File(["ticktick csv content"], "ticktick_export.csv", { type: "text/csv" });
      
      // Mock a network error
      const networkError = new Error('Network connection failed');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);
      
      // Call the method and expect it to throw
      await expect(service.migrateTickTick(mockFile)).rejects.toThrow(VikunjaError);
      
      try {
        await service.migrateTickTick(mockFile);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network connection failed');
        expect((error as VikunjaError).response).toEqual({ message: 'Network connection failed' });
        expect((error as VikunjaError).statusCode).toBe(0);
      }
    });
  });
});