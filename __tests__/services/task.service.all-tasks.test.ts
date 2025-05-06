/**
 * Tests for the TaskService getAllTasks method
 */
import { TaskService } from '../../src/services/task.service';
import { VikunjaError } from '../../src/core/service';
import { Task } from '../../src/models/task';

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
  
  describe('getAllTasks', () => {
    it('should fetch all tasks without parameters', async () => {
      // Mock tasks response
      const mockTasks: Task[] = [
        {
          id: 1,
          project_id: 1,
          title: 'Task 1',
          description: 'Description 1',
          done: false
        },
        {
          id: 2,
          project_id: 2,
          title: 'Task 2',
          description: 'Description 2',
          done: true
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
      const result = await taskService.getAllTasks();
      
      // Verify the result
      expect(result).toEqual(mockTasks);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/all`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should fetch all tasks with pagination, search, sorting, and filtering parameters', async () => {
      // Mock tasks response
      const mockTasks: Task[] = [
        {
          id: 1,
          project_id: 1,
          title: 'Task Matching Criteria',
          description: 'Description with search term',
          done: false
        }
      ];
      
      const params = {
        page: 1,
        per_page: 10,
        s: 'search term',
        sort_by: 'title',
        order_by: 'asc' as 'asc' | 'desc',
        filter_by: 'done',
        filter_value: 'false',
        filter_comparator: 'equals' as const
      };
      
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
      const result = await taskService.getAllTasks(params);
      
      // Verify the result
      expect(result).toEqual(mockTasks);
      
      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/all?page=1&per_page=10&s=search+term&sort_by=title&order_by=asc&filter_by=done&filter_value=false&filter_comparator=equals`,
        expect.anything()
      );
    });
    
    it('should handle multiple filter parameters', async () => {
      // Mock tasks response
      const mockTasks: Task[] = [
        {
          id: 1,
          project_id: 1,
          title: 'Complex Filtered Task',
          done: false,
          priority: 1
        }
      ];
      
      const params = {
        filter_by: ['done', 'priority'],
        filter_value: ['false', '1'],
        filter_comparator: 'equals' as const,
        filter_concat: 'and' as const
      };
      
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
      const result = await taskService.getAllTasks(params);
      
      // Verify the result
      expect(result).toEqual(mockTasks);
      
      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/all?filter_by=done%2Cpriority&filter_value=false%2C1&filter_comparator=equals&filter_concat=and`,
        expect.anything()
      );
    });
    
    it('should handle filter_include_nulls parameter', async () => {
      // Mock tasks response
      const mockTasks: Task[] = [
        {
          id: 1,
          project_id: 1,
          title: 'Task with empty due date',
          done: false,
          due_date: ''
        }
      ];
      
      const params = {
        filter_by: 'due_date',
        filter_value: '',
        filter_include_nulls: true
      };
      
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
      const result = await taskService.getAllTasks(params);
      
      // Verify the result
      expect(result).toEqual(mockTasks);
      
      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/all?filter_by=due_date&filter_value=&filter_include_nulls=true`,
        expect.anything()
      );
    });

    it('should handle error responses', async () => {
      // Mock error response
      const errorMessage = 'Error getting tasks';
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({ 
          message: errorMessage,
          code: 500
        }),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      await expect(taskService.getAllTasks()).rejects.toThrow(VikunjaError);
      await expect(taskService.getAllTasks()).rejects.toMatchObject({
        message: errorMessage,
        code: 500,
        status: 500
      });
    });
    
    it('should handle network errors', async () => {
      // Mock a network error
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);
      
      // Call the method and expect it to throw
      await expect(taskService.getAllTasks()).rejects.toThrow(VikunjaError);
      await expect(taskService.getAllTasks()).rejects.toMatchObject({
        message: 'Network error',
        code: 0,
        status: 0
      });
    });
    
    it('should handle non-JSON responses', async () => {
      // Mock a response with non-JSON content
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: new Headers({
          'content-type': 'text/html',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      await expect(taskService.getAllTasks()).rejects.toThrow(VikunjaError);
      await expect(taskService.getAllTasks()).rejects.toMatchObject({
        message: `API request failed with status ${mockResponse.status}`,
        code: 0,
        status: 500
      });
    });
  });
});
