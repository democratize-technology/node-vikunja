/**
 * Tests for the TaskService getTaskComment method
 */
import { TaskService } from '../../src/services/task.service';
import { TaskComment } from '../../src/models/task';
import { VikunjaError } from '../../src/core/service';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskService - Get Comment', () => {
  let taskService: TaskService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
    
    // Create a new service instance
    taskService = new TaskService(baseUrl, mockToken);
  });
  
  describe('getTaskComment', () => {
    it('should fetch a specific comment for a task', async () => {
      const taskId = 123;
      const commentId = 456;
      const mockComment: TaskComment = {
        id: commentId,
        task_id: taskId,
        comment: 'This is a test comment',
        created: '2023-01-01T12:00:00Z',
        created_by: {
          id: 1,
          username: 'user1'
        }
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockComment),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getTaskComment(taskId, commentId);
      
      // Verify the result
      expect(result).toEqual(mockComment);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/comments/${commentId}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
    
    it('should handle 404 error when comment does not exist', async () => {
      const taskId = 123;
      const commentId = 999;
      const errorResponse = {
        code: 404,
        message: 'Comment not found'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await taskService.getTaskComment(taskId, commentId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(404);
      }
    });
  });
});
