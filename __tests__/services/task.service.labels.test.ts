/**
 * Tests for the TaskService label-related methods
 */
import { Message } from '../../src/models/common';
import { TaskService } from '../../src/services/task.service';
import { TaskLabel, Label } from '../../src/models/label';
import { LabelTaskBulk } from '../../src/models/task';
import { VikunjaError } from '../../src/core/service';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskService - Labels', () => {
  let taskService: TaskService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';

  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();

    // Create a new service instance
    taskService = new TaskService(baseUrl, mockToken);
  });

  describe('updateTaskLabels', () => {
    it('should update all labels on a task', async () => {
      const taskId = 123;
      const labelsBulk: LabelTaskBulk = {
        label_ids: [1, 2, 3],
      };

      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(labelsBulk),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await taskService.updateTaskLabels(taskId, labelsBulk);

      // Verify the result
      expect(result).toEqual(labelsBulk);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/labels/bulk`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(labelsBulk),
        })
      );
    });

    it('should handle 400 error when label IDs are invalid', async () => {
      const taskId = 123;
      const labelsBulk: LabelTaskBulk = {
        label_ids: [-1], // Invalid label ID
      };

      const errorResponse = {
        code: 400,
        message: 'Invalid label IDs provided',
      };

      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      try {
        await taskService.updateTaskLabels(taskId, labelsBulk);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });

    it('should handle 500 error for server errors', async () => {
      const taskId = 123;
      const labelsBulk: LabelTaskBulk = {
        label_ids: [1, 2, 3],
      };

      const errorResponse = {
        code: 500,
        message: 'Internal server error',
      };

      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      try {
        await taskService.updateTaskLabels(taskId, labelsBulk);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
  });

  describe('addLabelToTask', () => {
    it('should add a label to a task', async () => {
      const taskId = 123;
      const labelTask: TaskLabel = {
        task_id: taskId,
        label_id: 456,
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(labelTask),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await taskService.addLabelToTask(taskId, labelTask);

      // Verify the result
      expect(result).toEqual(labelTask);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/labels`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(labelTask),
        })
      );
    });

    it('should handle API errors when adding a label', async () => {
      const taskId = 123;
      const labelTask: TaskLabel = {
        task_id: taskId,
        label_id: 456,
      };
      const errorResponse = {
        code: 400,
        message: 'Invalid label',
      };

      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      try {
        await taskService.addLabelToTask(taskId, labelTask);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });

  describe('removeLabelFromTask', () => {
    it('should remove a label from a task', async () => {
      const taskId = 123;
      const labelId = 456;
      const mockMessage: Message = {
        message: 'Label successfully removed from task',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await taskService.removeLabelFromTask(taskId, labelId);

      // Verify the result
      expect(result).toEqual(mockMessage);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/labels/${labelId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle API errors when removing a label', async () => {
      const taskId = 123;
      const labelId = 456;
      const errorResponse = {
        code: 404,
        message: 'Label not found',
      };

      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      try {
        await taskService.removeLabelFromTask(taskId, labelId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
  });

  describe('getTaskLabels', () => {
    it('should fetch all labels for a task', async () => {
      const taskId = 123;
      const mockLabels: Label[] = [
        {
          id: 1,
          title: 'Important',
          hex_color: '#ff0000',
        },
        {
          id: 2,
          title: 'Urgent',
          hex_color: '#00ff00',
        },
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockLabels),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await taskService.getTaskLabels(taskId);

      // Verify the result
      expect(result).toEqual(mockLabels);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/labels`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should fetch labels with pagination and search params', async () => {
      const taskId = 123;
      const params = {
        page: 2,
        per_page: 10,
        s: 'important',
      };
      const mockLabels: Label[] = [
        {
          id: 1,
          title: 'Important',
          hex_color: '#ff0000',
        },
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockLabels),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await taskService.getTaskLabels(taskId, params);

      // Verify the result
      expect(result).toEqual(mockLabels);

      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/labels?page=2&per_page=10&s=important`,
        expect.anything()
      );
    });

    it('should handle API errors properly', async () => {
      const taskId = 123;
      const errorResponse = {
        code: 404,
        message: 'Task not found',
      };

      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      try {
        await taskService.getTaskLabels(taskId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
  });
});
