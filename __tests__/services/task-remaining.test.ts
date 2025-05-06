/**
 * Tests for the remaining methods in TaskService
 */
import { TaskService } from '../../src/services/task.service';
import { 
  Task, 
  TaskComment, 
  TaskBulkOperation
} from '../../src/models/task';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskService - Remaining Methods', () => {
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
        comment: 'This is a comment',
        created: '2023-01-01T12:00:00Z',
        created_by: {
          id: 1,
          username: 'user1'
        }
      };
      
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
  });
  
  describe('updateTaskComment', () => {
    it('should update an existing comment on a task', async () => {
      const taskId = 123;
      const commentId = 456;
      const comment: TaskComment = {
        id: commentId,
        task_id: taskId,
        comment: 'Updated comment text'
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
  });
  
  describe('deleteTaskComment', () => {
    it('should delete a task comment', async () => {
      const taskId = 123;
      const commentId = 456;
      const mockMessage: Message = {
        message: 'Comment successfully deleted'
      };
      
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.deleteTaskComment(taskId, commentId);
      
      // Verify the result
      expect(result).toEqual(mockMessage);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/comments/${commentId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });
  
  describe('bulkUpdateTasks', () => {
    it('should perform bulk updates on tasks', async () => {
      const operation: TaskBulkOperation = {
        task_ids: [1, 2, 3],
        field: 'priority',
        value: 5
      };
      
      const mockMessage: Message = {
        message: 'Tasks updated successfully'
      };
      
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.bulkUpdateTasks(operation);
      
      // Verify the result
      expect(result).toEqual(mockMessage);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/bulk`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(operation)
        })
      );
    });
  });
});
