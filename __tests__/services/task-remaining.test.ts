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
    it('should perform bulk updates on tasks and return updated tasks', async () => {
      const operation: TaskBulkOperation = {
        task_ids: [1, 2, 3],
        field: 'priority',
        value: 5
      };
      
      const mockUpdatedTasks: Task[] = [
        {
          id: 1,
          project_id: 10,
          title: 'Task 1',
          priority: 5
        },
        {
          id: 2,
          project_id: 10,
          title: 'Task 2',
          priority: 5
        },
        {
          id: 3,
          project_id: 11,
          title: 'Task 3',
          priority: 5
        }
      ];
      
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockUpdatedTasks),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.bulkUpdateTasks(operation);
      
      // Verify the result
      expect(result).toEqual(mockUpdatedTasks);
      expect(result).toHaveLength(3);
      expect(result[0].priority).toBe(5);
      expect(result[1].priority).toBe(5);
      expect(result[2].priority).toBe(5);
      
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

    it('should handle bulk update errors', async () => {
      const operation: TaskBulkOperation = {
        task_ids: [1, 2, 3],
        field: 'invalid_field',
        value: 'invalid_value'
      };
      
      const mockErrorResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({
          message: 'Invalid field for bulk update'
        }),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockErrorResponse);
      
      // Expect the method to throw an error
      await expect(taskService.bulkUpdateTasks(operation)).rejects.toThrow(
        'Invalid field for bulk update'
      );
    });

    it('should handle bulk update with different field types', async () => {
      const operations = [
        {
          operation: {
            task_ids: [1, 2],
            field: 'done',
            value: true
          },
          expectedTasks: [
            { id: 1, project_id: 10, title: 'Task 1', done: true },
            { id: 2, project_id: 10, title: 'Task 2', done: true }
          ]
        },
        {
          operation: {
            task_ids: [3, 4],
            field: 'due_date',
            value: '2024-12-31T23:59:59Z'
          },
          expectedTasks: [
            { id: 3, project_id: 11, title: 'Task 3', due_date: '2024-12-31T23:59:59Z' },
            { id: 4, project_id: 11, title: 'Task 4', due_date: '2024-12-31T23:59:59Z' }
          ]
        },
        {
          operation: {
            task_ids: [5],
            field: 'bucket_id',
            value: 42
          },
          expectedTasks: [
            { id: 5, project_id: 12, title: 'Task 5', bucket_id: 42 }
          ]
        }
      ];

      for (const { operation, expectedTasks } of operations) {
        jest.resetAllMocks();
        
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: jest.fn().mockResolvedValue(expectedTasks),
          headers: new Headers({
            'content-type': 'application/json',
          })
        };
        
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
        
        const result = await taskService.bulkUpdateTasks(operation);
        
        expect(result).toEqual(expectedTasks);
        expect(global.fetch).toHaveBeenCalledWith(
          `${baseUrl}/tasks/bulk`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(operation)
          })
        );
      }
    });

    it('should handle empty task_ids array', async () => {
      const operation: TaskBulkOperation = {
        task_ids: [],
        field: 'priority',
        value: 5
      };
      
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue([]),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await taskService.bulkUpdateTasks(operation);
      
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
