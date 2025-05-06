/**
 * Tests for the TaskService updateTaskComment method
 */
import { TaskService } from '../../src/services/task.service';
import { TaskComment } from '../../src/models/task';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskService - Update Comment', () => {
  let taskService: TaskService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
    
    // Create a new service instance
    taskService = new TaskService(baseUrl, mockToken);
  });
  
  describe('updateTaskComment', () => {
    it('should update an existing task comment', async () => {
      const taskId = 123;
      const commentId = 456;
      const comment: TaskComment = {
        task_id: taskId,
        id: commentId,
        comment: 'This is an updated comment'
      };
      
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(comment),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.updateTaskComment(taskId, commentId, comment);
      
      // Verify the result
      expect(result).toEqual(comment);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/comments/${commentId}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(comment)
        })
      );
    });
    
    it('should handle 404 error when comment does not exist', async () => {
      const taskId = 123;
      const commentId = 999;
      const comment: TaskComment = {
        task_id: taskId,
        id: commentId,
        comment: 'This is an updated comment'
      };
      
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
      await expect(taskService.updateTaskComment(taskId, commentId, comment))
        .rejects.toMatchObject({
          message: errorResponse.message,
          code: errorResponse.code,
          status: 404
        });
    });
  });
});
