/**
 * Tests for the TaskService assignee-related methods
 */
import { TaskService } from '../../src/services/task.service';
import { TaskAssignment, BulkAssignees } from '../../src/models/task';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskService - Assignees', () => {
  let taskService: TaskService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
    
    // Create a new service instance
    taskService = new TaskService(baseUrl, mockToken);
  });
  
  describe('getTaskAssignees', () => {
    it('should fetch all assignees for a task', async () => {
      const taskId = 123;
      const mockAssignees = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com'
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com'
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockAssignees),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getTaskAssignees(taskId);
      
      // Verify the result
      expect(result).toEqual(mockAssignees);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/assignees`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
    
    it('should fetch assignees with pagination and search params', async () => {
      const taskId = 123;
      const params = {
        page: 2,
        per_page: 10,
        s: 'john'
      };
      const mockAssignees = [
        {
          id: 1,
          username: 'john_doe',
          email: 'john@example.com'
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockAssignees),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getTaskAssignees(taskId, params);
      
      // Verify the result
      expect(result).toEqual(mockAssignees);
      
      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/assignees?page=2&per_page=10&s=john`,
        expect.anything()
      );
    });

    it('should handle 500 error for server errors', async () => {
      const taskId = 123;
      
      const errorResponse = {
        code: 500,
        message: 'Internal server error'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await taskService.getTaskAssignees(taskId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
  });
  
  describe('assignUserToTask', () => {
    it('should assign a user to a task', async () => {
      const taskId = 123;
      const userId = 456;
      const mockAssignment: TaskAssignment = {
        task_id: taskId,
        user_id: userId
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(mockAssignment),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.assignUserToTask(taskId, userId);
      
      // Verify the result
      expect(result).toEqual(mockAssignment);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/assignees`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ user_id: userId })
        })
      );
    });
    
    it('should handle 400 error when assignee data is invalid', async () => {
      const taskId = 123;
      const userId = -1; // Invalid user ID
      
      const errorResponse = {
        code: 400,
        message: 'Invalid user ID'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await taskService.assignUserToTask(taskId, userId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });
  
  describe('bulkAssignUsersToTask', () => {
    it('should assign multiple users to a task', async () => {
      const taskId = 123;
      const bulkAssignees: BulkAssignees = {
        user_ids: [1, 2, 3]
      };
      const mockAssignment: TaskAssignment = {
        task_id: taskId,
        user_id: 0 // This might be different in the actual API
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(mockAssignment),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.bulkAssignUsersToTask(taskId, bulkAssignees);
      
      // Verify the result
      expect(result).toEqual(mockAssignment);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/assignees/bulk`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(bulkAssignees)
        })
      );
    });
    
    it('should handle 400 error when bulk assignee data is invalid', async () => {
      const taskId = 123;
      const bulkAssignees: BulkAssignees = {
        user_ids: [-1, -2] // Invalid user IDs
      };
      
      const errorResponse = {
        code: 400,
        message: 'Invalid user IDs'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await taskService.bulkAssignUsersToTask(taskId, bulkAssignees);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });
  
  describe('removeUserFromTask', () => {
    it('should remove a user assignment from a task', async () => {
      const taskId = 123;
      const userId = 456;
      const mockMessage: Message = {
        message: 'User successfully removed from task'
      };
      
      // Mock the fetch response
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
      const result = await taskService.removeUserFromTask(taskId, userId);
      
      // Verify the result
      expect(result).toEqual(mockMessage);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/assignees/${userId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
    
    it('should handle 403 error when user does not have permission', async () => {
      const taskId = 123;
      const userId = 456;
      
      const errorResponse = {
        code: 403,
        message: 'You do not have permission to remove this assignee'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await taskService.removeUserFromTask(taskId, userId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(403);
      }
    });
  });
});
