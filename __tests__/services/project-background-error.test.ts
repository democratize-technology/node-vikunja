/**
 * Error handling tests for ProjectService background uploads
 */
import { ProjectService } from '../../src/services/project.service';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('ProjectService - Background Upload Error Handling', () => {
  let projectService: ProjectService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';

  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();

    // Create a new service instance
    projectService = new ProjectService(baseUrl, mockToken);
  });

  describe('uploadProjectBackground error handling', () => {
    it('should handle invalid JSON error response for uploads', async () => {
      const projectId = 123;

      // Create a mock FormData with file
      const mockFile = new File(['test image content'], 'image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('background', mockFile);

      // Mock a fetch response that fails to parse as JSON
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: new Headers({
          'content-type': 'text/plain', // Not JSON
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      try {
        await projectService.uploadProjectBackground(projectId, formData);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('API request failed with status 500');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(500);
      }
    });

    it('should handle network errors for uploads', async () => {
      const projectId = 123;

      // Create a mock FormData with file
      const mockFile = new File(['test image content'], 'image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('background', mockFile);

      // Mock a network error
      const networkError = new Error('Network connection failed');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Call the method and expect it to throw
      try {
        await projectService.uploadProjectBackground(projectId, formData);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network connection failed');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(0);
      }
    });

    it('should handle API errors with non-standard status formats', async () => {
      const projectId = 123;

      // Create a mock FormData with file
      const mockFile = new File(['test image content'], 'image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('background', mockFile);

      const mockResponse = {
        ok: false,
        status: 'unknown error',
        json: jest.fn().mockResolvedValue({}),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw the exact same error
      try {
        await projectService.uploadProjectBackground(projectId, formData);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect((error as VikunjaError).status).toBe('unknown error');
        expect((error as VikunjaError).code).toBe(0);
      }
    });

    it('should handle network errors with empty response objects', async () => {
      const projectId = 123;

      // Create a mock FormData with file
      const mockFile = new File(['test image content'], 'image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('background', mockFile);

      const mockResponse = {
        ok: false,
        status: 'unknown error',
        json: jest.fn().mockResolvedValue({}),
      };

      (global.fetch as jest.Mock).mockRejectedValue({});

      // Call the method and expect it to throw the exact same error
      try {
        await projectService.uploadProjectBackground(projectId, formData);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect((error as VikunjaError).status).toBe(0);
        expect((error as VikunjaError).code).toBe(0);
      }
    });
  });
});
