/**
 * Tests for the MigrationService error re-throwing
 */
import { MigrationService } from '../../src/services/migration.service';
import { VikunjaError } from '../../src/core/service';

// Mock global fetch
global.fetch = jest.fn();

describe('MigrationService - Error Rethrowing', () => {
  let service: MigrationService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';

  beforeEach(() => {
    jest.resetAllMocks();
    service = new MigrationService(mockBaseUrl, mockToken);
  });

  describe('migrateTickTick', () => {
    it('should handle API errors with proper error message', async () => {
      const mockFile = new File(['ticktick csv content'], 'ticktick_export.csv', {
        type: 'text/csv',
      });

      // Mock fetch to throw the VikunjaError
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 'unknown error',
          json: () => Promise.resolve({}),
        })
      ) as jest.Mock;

      // Call the method and expect it to throw the exact same error
      try {
        await service.migrateTickTick(mockFile);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect((error as VikunjaError).message).toBe(
          'API request failed with status unknown error'
        );
        expect((error as VikunjaError).response).toEqual({});
      }
    });

    it('should handle network errors with a generic error message', async () => {
      const mockFile = new File(['ticktick csv content'], 'ticktick_export.csv', {
        type: 'text/csv',
      });

      // Mock fetch to throw the VikunjaError
      global.fetch = jest.fn(() => Promise.reject({})) as jest.Mock;

      // Call the method and expect it to throw the exact same error
      try {
        await service.migrateTickTick(mockFile);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect((error as VikunjaError).message).toBe('Network error');
        expect((error as VikunjaError).response).toEqual({ message: 'Network error' });
      }
    });
  });
});
