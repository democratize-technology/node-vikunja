/**
 * Tests for TaskService assignee authentication error handling
 */
import { TaskService } from '../../src/services/task.service';
import { AssigneeAuthenticationError, VikunjaAuthenticationError } from '../../src/core/service';
import { TaskAssignment, BulkAssignees } from '../../src/models/task';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskService - Assignee Authentication Errors', () => {
  let taskService: TaskService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';

  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
    
    // Create a new service instance
    taskService = new TaskService(baseUrl, mockToken);
  });

  describe('assignUserToTask - Authentication Retry Logic', () => {
    it('should retry with X-API-Token header on initial 401 error', async () => {
      const taskId = 123;
      const userId = 456;
      const mockAssignment: TaskAssignment = { task_id: taskId, user_id: userId };

      // First call fails with 401
      const firstResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({ message: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      // Second call succeeds
      const secondResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockAssignment),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      const result = await taskService.assignUserToTask(taskId, userId);

      expect(result).toEqual(mockAssignment);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // First call with Bearer token
      expect(global.fetch).toHaveBeenNthCalledWith(1,
        `${baseUrl}/tasks/${taskId}/assignees`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );

      // Second call with X-API-Token
      expect(global.fetch).toHaveBeenNthCalledWith(2,
        `${baseUrl}/tasks/${taskId}/assignees`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Token': mockToken
          })
        })
      );
    });

    it('should retry with lowercase authorization on X-API-Token failure', async () => {
      const taskId = 123;
      const userId = 456;
      const mockAssignment: TaskAssignment = { task_id: taskId, user_id: userId };

      // All calls fail except the last one
      const failResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue({ message: 'Forbidden' }),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      const successResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockAssignment),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(failResponse)  // First attempt
        .mockResolvedValueOnce(failResponse)  // X-API-Token attempt
        .mockResolvedValueOnce(successResponse); // lowercase authorization attempt

      const result = await taskService.assignUserToTask(taskId, userId);

      expect(result).toEqual(mockAssignment);
      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Third call with lowercase authorization
      expect(global.fetch).toHaveBeenNthCalledWith(3,
        `${baseUrl}/tasks/${taskId}/assignees`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'authorization': `Bearer ${mockToken}`
          })
        })
      );
    });

    it('should throw AssigneeAuthenticationError after all retries fail', async () => {
      const taskId = 123;
      const userId = 456;

      const failResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({ message: 'Authentication failed' }),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      (global.fetch as jest.Mock).mockResolvedValue(failResponse);

      await expect(taskService.assignUserToTask(taskId, userId))
        .rejects.toThrow(AssigneeAuthenticationError);

      expect(global.fetch).toHaveBeenCalledTimes(3); // All retry attempts
    });

    it('should not retry on non-authentication errors', async () => {
      const taskId = 123;
      const userId = 456;

      const errorResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ message: 'Invalid user ID' }),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      (global.fetch as jest.Mock).mockResolvedValue(errorResponse);

      await expect(taskService.assignUserToTask(taskId, userId))
        .rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('bulkAssignUsersToTask - Authentication Retry Logic', () => {
    it('should retry with alternative headers on authentication error', async () => {
      const taskId = 123;
      const bulkAssignees: BulkAssignees = { user_ids: [1, 2, 3] };
      const mockAssignment: TaskAssignment = { task_id: taskId, user_id: 0 };

      // First two calls fail
      const failResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue({ message: 'Forbidden' }),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      const successResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockAssignment),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(failResponse)
        .mockResolvedValueOnce(failResponse)
        .mockResolvedValueOnce(successResponse);

      const result = await taskService.bulkAssignUsersToTask(taskId, bulkAssignees);

      expect(result).toEqual(mockAssignment);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw AssigneeAuthenticationError when all retries fail', async () => {
      const taskId = 123;
      const bulkAssignees: BulkAssignees = { user_ids: [1, 2, 3] };

      const failResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({ message: 'Authentication required' }),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      (global.fetch as jest.Mock).mockResolvedValue(failResponse);

      await expect(taskService.bulkAssignUsersToTask(taskId, bulkAssignees))
        .rejects.toThrow(AssigneeAuthenticationError);

      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Verify all three authentication methods were tried
      expect(global.fetch).toHaveBeenNthCalledWith(1,
        `${baseUrl}/tasks/${taskId}/assignees/bulk`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );

      expect(global.fetch).toHaveBeenNthCalledWith(2,
        `${baseUrl}/tasks/${taskId}/assignees/bulk`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Token': mockToken
          })
        })
      );

      expect(global.fetch).toHaveBeenNthCalledWith(3,
        `${baseUrl}/tasks/${taskId}/assignees/bulk`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'authorization': `Bearer ${mockToken}`
          })
        })
      );
    });
  });

  describe('removeUserFromTask - Authentication Retry Logic', () => {
    it('should retry with X-API-Token header on 401 error', async () => {
      const taskId = 123;
      const userId = 456;
      const mockMessage: Message = { message: 'User removed successfully' };

      const failResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({ message: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      const successResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(failResponse)
        .mockResolvedValueOnce(successResponse);

      const result = await taskService.removeUserFromTask(taskId, userId);

      expect(result).toEqual(mockMessage);
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Verify X-API-Token was used in retry
      expect(global.fetch).toHaveBeenNthCalledWith(2,
        `${baseUrl}/tasks/${taskId}/assignees/${userId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'X-API-Token': mockToken
          })
        })
      );
    });

    it('should throw AssigneeAuthenticationError after all retries fail', async () => {
      const taskId = 123;
      const userId = 456;

      const failResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue({ message: 'Access denied' }),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      (global.fetch as jest.Mock).mockResolvedValue(failResponse);

      await expect(taskService.removeUserFromTask(taskId, userId))
        .rejects.toThrow(AssigneeAuthenticationError);

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should preserve error details in AssigneeAuthenticationError', async () => {
      const taskId = 123;
      const userId = 456;

      const errorDetails = {
        message: 'Token validation failed',
        code: 401,
        details: 'Token expired'
      };

      const failResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue(errorDetails),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      (global.fetch as jest.Mock).mockResolvedValue(failResponse);

      try {
        await taskService.removeUserFromTask(taskId, userId);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AssigneeAuthenticationError);
        const authError = error as AssigneeAuthenticationError;
        expect(authError.message).toContain('Assignee operation failed due to authentication issue');
        expect(authError.message).toContain(errorDetails.message);
        expect(authError.statusCode).toBe(401);
        expect(authError.endpoint).toBe(`/tasks/${taskId}/assignees/${userId}`);
        expect(authError.method).toBe('DELETE');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle network errors without retry', async () => {
      const taskId = 123;
      const userId = 456;

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(taskService.assignUserToTask(taskId, userId))
        .rejects.toThrow('Network error');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle empty token gracefully', async () => {
      taskService = new TaskService(baseUrl, '');
      const taskId = 123;
      const userId = 456;

      const failResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({ message: 'No token provided' }),
        headers: new Headers({ 'content-type': 'application/json' })
      };

      (global.fetch as jest.Mock).mockResolvedValue(failResponse);

      await expect(taskService.assignUserToTask(taskId, userId))
        .rejects.toThrow(AssigneeAuthenticationError);

      // Should still attempt retries with empty token
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});