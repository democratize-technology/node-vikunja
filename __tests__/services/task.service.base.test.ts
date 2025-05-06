/**
 * Tests for the base TaskService methods
 */
import { TaskService } from '../../src/services/task.service';
import { VikunjaError } from '../../src/core/service';
import { Task, TaskBulkOperation } from '../../src/models/task';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskService - Base Methods', () => {
  let taskService: TaskService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
    
    // Create a new service instance
    taskService = new TaskService(baseUrl, mockToken);
  });
  
  describe('getProjectTasks', () => {
    it('should fetch all tasks in a project', async () => {
      const projectId = 123;
      const mockTasks: Task[] = [
        {
          id: 1,
          project_id: projectId,
          title: 'Test Task 1'
        },
        {
          id: 2,
          project_id: projectId,
          title: 'Test Task 2'
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTasks),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getProjectTasks(projectId);
      
      // Verify the result
      expect(result).toEqual(mockTasks);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/${projectId}/tasks`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
    
    it('should fetch tasks with query parameters', async () => {
      const projectId = 123;
      const params = {
        page: 2,
        per_page: 10,
        s: 'test',
        sort_by: 'title',
        order_by: 'asc' as const, // Type assertion to match the enum
        filter_by: 'done',
        filter_value: 'false'
      };
      const mockTasks: Task[] = [
        {
          id: 1,
          project_id: projectId,
          title: 'Test Task 1'
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTasks),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getProjectTasks(projectId, params);
      
      // Verify the result
      expect(result).toEqual(mockTasks);
      
      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${baseUrl}/projects/${projectId}/tasks?`),
        expect.anything()
      );
      
      // Check if all query parameters are included in the URL
      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      Object.entries(params).forEach(([key, value]) => {
        expect(url).toContain(`${key}=${value}`);
      });
    });
  });
  
  describe('createTask', () => {
    it('should create a new task in a project', async () => {
      const projectId = 123;
      const newTask: Task = {
        project_id: projectId,
        title: 'New Test Task'
      };
      const createdTask: Task = {
        ...newTask,
        id: 1,
        created: '2023-01-01T12:00:00Z'
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(createdTask),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.createTask(projectId, newTask);
      
      // Verify the result
      expect(result).toEqual(createdTask);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/${projectId}/tasks`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(newTask)
        })
      );
    });
  });
  
  describe('getTask', () => {
    it('should fetch a specific task by ID', async () => {
      const taskId = 123;
      const mockTask: Task = {
        id: taskId,
        project_id: 456,
        title: 'Test Task',
        description: 'Test Description'
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTask),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getTask(taskId);
      
      // Verify the result
      expect(result).toEqual(mockTask);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}`,
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
  
  describe('updateTask', () => {
    it('should update a task', async () => {
      const taskId = 123;
      const updatedTask: Task = {
        id: taskId,
        project_id: 456,
        title: 'Updated Task Title',
        description: 'Updated Description'
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(updatedTask),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.updateTask(taskId, updatedTask);
      
      // Verify the result
      expect(result).toEqual(updatedTask);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(updatedTask)
        })
      );
    });
  });
  
  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const taskId = 123;
      const mockMessage: Message = {
        message: 'Task successfully deleted'
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
      const result = await taskService.deleteTask(taskId);
      
      // Verify the result
      expect(result).toEqual(mockMessage);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}`,
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
  
  describe('markTaskDone', () => {
    it('should mark a task as done', async () => {
      const taskId = 123;
      const updatedTask: Task = {
        id: taskId,
        project_id: 456,
        title: 'Test Task',
        done: true,
        done_at: '2023-01-01T12:00:00Z'
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(updatedTask),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.markTaskDone(taskId);
      
      // Verify the result
      expect(result).toEqual(updatedTask);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/done`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });
  
  describe('markTaskUndone', () => {
    it('should mark a task as undone', async () => {
      const taskId = 123;
      const updatedTask: Task = {
        id: taskId,
        project_id: 456,
        title: 'Test Task',
        done: false,
        done_at: undefined
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(updatedTask),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.markTaskUndone(taskId);
      
      // Verify the result
      expect(result).toEqual(updatedTask);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/undone`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });
  
  describe('bulkUpdateTasks', () => {
    it('should perform a bulk update on tasks', async () => {
      const operation: TaskBulkOperation = {
        task_ids: [1, 2, 3],
        field: 'done',
        value: true
      };
      const mockMessage: Message = {
        message: 'Tasks successfully updated'
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
    
    it('should handle error response during bulk update', async () => {
      const operation: TaskBulkOperation = {
        task_ids: [1, 2, 3],
        field: 'invalid_field', // Invalid field for testing
        value: true
      };
      
      const errorResponse = {
        code: 400,
        message: 'Invalid field name'
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
        await taskService.bulkUpdateTasks(operation);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });
  
  // Additional error handling tests
  describe('Error handling for base methods', () => {
    it('should handle 404 error when task does not exist', async () => {
      const taskId = 9999; // Non-existent task ID
      
      const errorResponse = {
        code: 404,
        message: 'Task not found'
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
        await taskService.getTask(taskId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
    
    it('should handle 400 error when updating task with invalid data', async () => {
      const taskId = 123;
      const invalidTask: Task = {
        id: taskId,
        project_id: -1, // Invalid project ID
        title: '' // Empty title
      };
      
      const errorResponse = {
        code: 400,
        message: 'Invalid task data'
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
        await taskService.updateTask(taskId, invalidTask);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });
});
