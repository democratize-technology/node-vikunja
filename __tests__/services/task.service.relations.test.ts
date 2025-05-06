/**
 * Tests for the TaskService relation-related methods
 */
import { TaskService } from '../../src/services/task.service';
import { TaskRelation, RelationKind } from '../../src/models/task';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskService - Relations', () => {
  let taskService: TaskService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
    
    // Create a new service instance
    taskService = new TaskService(baseUrl, mockToken);
  });
  
  describe('createTaskRelation', () => {
    it('should create a new relation between tasks', async () => {
      const taskId = 123;
      const relation: TaskRelation = {
        task_id: taskId,
        other_task_id: 456,
        relation_kind: RelationKind.SUBTASK
      };
      
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(relation),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.createTaskRelation(taskId, relation);
      
      // Verify the result
      expect(result).toEqual(relation);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/relations`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(relation)
        })
      );
    });
    
    it('should handle 400 error when relation data is invalid', async () => {
      const taskId = 123;
      const relation: TaskRelation = {
        task_id: taskId,
        other_task_id: taskId, // Same task ID (invalid)
        relation_kind: RelationKind.SUBTASK
      };
      
      const errorResponse = {
        code: 400,
        message: 'Cannot create a relation to the same task'
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
        await taskService.createTaskRelation(taskId, relation);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });
  
  describe('deleteTaskRelation', () => {
    it('should delete a relation between tasks', async () => {
      const taskId = 123;
      const otherTaskId = 456;
      const relationKind = RelationKind.SUBTASK;
      const mockMessage: Message = {
        message: 'Relation successfully deleted'
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
      const result = await taskService.deleteTaskRelation(taskId, relationKind, otherTaskId);
      
      // Verify the result
      expect(result).toEqual(mockMessage);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/relations/${relationKind}/${otherTaskId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
    
    it('should handle 404 error when relation does not exist', async () => {
      const taskId = 123;
      const otherTaskId = 456;
      const relationKind = RelationKind.SUBTASK;
      
      const errorResponse = {
        code: 404,
        message: 'Relation not found'
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
        await taskService.deleteTaskRelation(taskId, relationKind, otherTaskId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
    
    it('should handle all valid relation kinds', async () => {
      const taskId = 123;
      const otherTaskId = 456;
      const mockMessage: Message = {
        message: 'Relation successfully deleted'
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
      
      // Test each relation kind
      for (const kind of Object.values(RelationKind)) {
        // Skip the UNKNOWN relation kind
        if (kind === RelationKind.UNKNOWN) continue;
        
        // Reset mocks
        jest.clearAllMocks();
        
        // Call the method
        const result = await taskService.deleteTaskRelation(taskId, kind, otherTaskId);
        
        // Verify the result
        expect(result).toEqual(mockMessage);
        
        // Verify that fetch was called with the correct arguments
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          `${baseUrl}/tasks/${taskId}/relations/${kind}/${otherTaskId}`,
          expect.anything()
        );
      }
    });
  });
});
