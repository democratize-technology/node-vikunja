/**
 * Error handling tests for TaskService attachment uploads
 */
import { TaskService } from '../../src/services/task.service';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskService - Attachment Upload Error Handling', () => {
  let taskService: TaskService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
    
    // Create a new service instance
    taskService = new TaskService(baseUrl, mockToken);
  });

  describe('uploadTaskAttachment error handling', () => {
    it('should handle invalid JSON error response for uploads', async () => {
      const taskId = 123;
      
      // Create a mock FormData with file
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('files', mockFile);
      
      // Mock a fetch response that fails to parse as JSON
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: new Headers({
          'content-type': 'text/plain', // Not JSON
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await taskService.uploadTaskAttachment(taskId, formData);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('API request failed with status 500');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
    
    it('should handle network errors for uploads', async () => {
      const taskId = 123;
      
      // Create a mock FormData with file
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('files', mockFile);
      
      // Mock a network error
      const networkError = new Error('Network connection failed');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);
      
      // Call the method and expect it to throw
      try {
        await taskService.uploadTaskAttachment(taskId, formData);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network connection failed');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(0);
      }
    });
  });
});