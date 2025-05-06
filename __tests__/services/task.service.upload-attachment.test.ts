/**
 * Tests for the TaskService uploadTaskAttachment method
 */
import { TaskService } from '../../src/services/task.service';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskService', () => {
  let taskService: TaskService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';

  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();

    // Create a new service instance
    taskService = new TaskService(baseUrl, mockToken);
  });

  describe('uploadTaskAttachment', () => {
    it('should upload a file attachment successfully', async () => {
      const taskId = 123;
      const mockMessage: Message = { message: 'File uploaded successfully' };

      // Create a mock FormData object
      const formData = new FormData();
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      formData.append('file', mockFile);

      // Mock successful response
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockMessage),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await taskService.uploadTaskAttachment(taskId, formData);

      // Verify the result
      expect(result).toEqual(mockMessage);

      // Verify the fetch call
      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/tasks/${taskId}/attachments`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${mockToken}` },
        body: formData,
      });
    });

    it('should handle API error with JSON response', async () => {
      const taskId = 123;
      const errorMessage = 'Invalid file format';
      const formData = new FormData();

      // Mock error response with JSON data
      const mockResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({
          message: errorMessage,
          code: 400,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      await expect(taskService.uploadTaskAttachment(taskId, formData)).rejects.toThrow(
        VikunjaError
      );
      await expect(taskService.uploadTaskAttachment(taskId, formData)).rejects.toMatchObject({
        message: errorMessage,
        code: 400,
        status: 400,
      });
    });

    it('should handle API error with non-JSON response', async () => {
      const taskId = 123;
      const formData = new FormData();

      // Mock error response with non-JSON data (will throw when trying to parse)
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      await expect(taskService.uploadTaskAttachment(taskId, formData)).rejects.toThrow(
        VikunjaError
      );
      await expect(taskService.uploadTaskAttachment(taskId, formData)).rejects.toMatchObject({
        message: `API request failed with status ${mockResponse.status}`,
        code: 0,
        status: 500,
      });
    });

    it('should handle network errors', async () => {
      const taskId = 123;
      const formData = new FormData();
      const networkError = new Error('Network error');

      // Mock a network error
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Call the method and expect it to throw
      await expect(taskService.uploadTaskAttachment(taskId, formData)).rejects.toThrow(
        VikunjaError
      );
      await expect(taskService.uploadTaskAttachment(taskId, formData)).rejects.toMatchObject({
        message: 'Network error',
        code: 0,
        status: 0,
      });
    });

    it('should handle network error with no message', async () => {
      const taskId = 123;
      const formData = new FormData();
      const networkError = new Error();
      networkError.message = ''; // Empty error message

      // Mock a network error with empty message
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Call the method and expect it to throw
      await expect(taskService.uploadTaskAttachment(taskId, formData)).rejects.toThrow(
        VikunjaError
      );
      await expect(taskService.uploadTaskAttachment(taskId, formData)).rejects.toMatchObject({
        message: 'Network error', // Should fallback to 'Network error'
        code: 0,
        status: 0,
      });
    });

    it('should handle API errors with non-standard status formats', async () => {
      const taskId = 123;
      const formData = new FormData();

      // Mock successful response
      const mockResponse = {
        ok: false,
        status: 'unknown error',
        json: jest.fn().mockResolvedValue({}),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      await expect(taskService.uploadTaskAttachment(taskId, formData)).rejects.toThrow(
        VikunjaError
      );
      await expect(taskService.uploadTaskAttachment(taskId, formData)).rejects.toMatchObject({
        code: 0,
        status: 'unknown error',
      });
    });
  });
});
