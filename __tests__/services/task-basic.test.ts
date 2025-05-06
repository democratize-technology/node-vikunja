/**
 * Tests for the basic methods in TaskService
 */
import { TaskService } from '../../src/services/task.service';
import { Task } from '../../src/models/task';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskService - Basic Methods', () => {
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
          title: 'Task 1'
        },
        {
          id: 2,
          project_id: projectId,
          title: 'Task 2'
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
    
    it('should fetch tasks with pagination and search params', async () => {
      const projectId = 123;
      const params = {
        page: 2,
        per_page: 10,
        s: 'important'
      };
      const mockTasks: Task[] = [
        {
          id: 1,
          project_id: projectId,
          title: 'Important Task'
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
        `${baseUrl}/projects/${projectId}/tasks?page=2&per_page=10&s=important`,
        expect.anything()
      );
    });
  });
  
  describe('createTask', () => {
    it('should create a new task in a project', async () => {
      const projectId = 123;
      const task: Task = {
        id: 0, // Will be assigned by the API
        project_id: projectId,
        title: 'New Task'
      };
      const createdTask: Task = {
        ...task,
        id: 456
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
      const result = await taskService.createTask(projectId, task);
      
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
          body: JSON.stringify(task)
        })
      );
    });
  });
  
  describe('getTask', () => {
    it('should get a specific task by ID', async () => {
      const taskId = 123;
      const mockTask: Task = {
        id: taskId,
        project_id: 456,
        title: 'Task with details',
        description: 'This is a detailed task'
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
      const task: Task = {
        id: taskId,
        project_id: 456,
        title: 'Updated Task Title',
        description: 'Updated description'
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(task),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.updateTask(taskId, task);
      
      // Verify the result
      expect(result).toEqual(task);
      
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
          body: JSON.stringify(task)
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
      const mockTask: Task = {
        id: taskId,
        project_id: 456,
        title: 'Task',
        done: true,
        done_at: '2025-01-01T12:00:00Z'
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
      const result = await taskService.markTaskDone(taskId);
      
      // Verify the result
      expect(result).toEqual(mockTask);
      
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
      const mockTask: Task = {
        id: taskId,
        project_id: 456,
        title: 'Task',
        done: false
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
      const result = await taskService.markTaskUndone(taskId);
      
      // Verify the result
      expect(result).toEqual(mockTask);
      
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
});
