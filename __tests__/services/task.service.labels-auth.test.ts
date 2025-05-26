/**
 * Tests for task label operations with authentication error handling
 */
import { TaskService } from '../../src/services/task.service';
import { LabelAuthenticationError } from '../../src/core/service';
import { LabelTaskBulk } from '../../src/models/task';
import { TaskLabel } from '../../src/models/label';

// Mock fetch
global.fetch = jest.fn();

describe('TaskService - Label Authentication Error Handling', () => {
  let taskService: TaskService;
  const mockToken = 'test-token';
  const mockBaseUrl = 'https://api.vikunja.test/api/v1';

  beforeEach(() => {
    taskService = new TaskService(mockBaseUrl, mockToken);
    jest.clearAllMocks();
  });

  describe('updateTaskLabels', () => {
    const taskId = 123;
    const labels: LabelTaskBulk = { label_ids: [1, 2, 3] };
    const successResponse: LabelTaskBulk = { label_ids: [1, 2, 3] };

    it('should succeed on first attempt with standard auth', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: async () => successResponse,
      });

      const result = await taskService.updateTaskLabels(taskId, labels);

      expect(result).toEqual(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/tasks/${taskId}/labels/bulk`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(labels),
        })
      );
    });

    it('should retry with X-API-Token header on 401 error', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Unauthorized', code: 401 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: {
            get: jest.fn().mockReturnValue('application/json'),
          },
          json: async () => successResponse,
        });

      const result = await taskService.updateTaskLabels(taskId, labels);

      expect(result).toEqual(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // First attempt with standard auth
      expect((global.fetch as jest.Mock).mock.calls[0][1].headers).toEqual(
        expect.objectContaining({
          'Authorization': `Bearer ${mockToken}`,
        })
      );
      
      // Second attempt with X-API-Token
      expect((global.fetch as jest.Mock).mock.calls[1][1].headers).toEqual(
        expect.objectContaining({
          'X-API-Token': mockToken,
        })
      );
    });

    it('should retry with lowercase authorization header on second failure', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Unauthorized', code: 401 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Unauthorized', code: 401 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: {
            get: jest.fn().mockReturnValue('application/json'),
          },
          json: async () => successResponse,
        });

      const result = await taskService.updateTaskLabels(taskId, labels);

      expect(result).toEqual(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(3);
      
      // Third attempt with lowercase authorization
      expect((global.fetch as jest.Mock).mock.calls[2][1].headers).toEqual(
        expect.objectContaining({
          'authorization': `Bearer ${mockToken}`,
        })
      );
    });

    it('should throw LabelAuthenticationError after all retries fail', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized', code: 401 }),
      });

      await expect(taskService.updateTaskLabels(taskId, labels)).rejects.toThrow(
        LabelAuthenticationError
      );

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw LabelAuthenticationError with proper message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Forbidden', code: 403 }),
      });

      try {
        await taskService.updateTaskLabels(taskId, labels);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(LabelAuthenticationError);
        expect((error as LabelAuthenticationError).message).toContain('authentication issue');
        expect((error as LabelAuthenticationError).message).toContain('may occur even with valid tokens');
        expect((error as LabelAuthenticationError).status).toBe(403);
      }
    });

    it('should not retry on non-authentication errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal Server Error', code: 500 }),
      });

      await expect(taskService.updateTaskLabels(taskId, labels)).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('addLabelToTask', () => {
    const taskId = 123;
    const labelTask: TaskLabel = { task_id: taskId, label_id: 5 };

    it('should retry with alternative auth headers on 401', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Unauthorized', code: 401 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: {
            get: jest.fn().mockReturnValue('application/json'),
          },
          json: async () => labelTask,
        });

      const result = await taskService.addLabelToTask(taskId, labelTask);

      expect(result).toEqual(labelTask);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect((global.fetch as jest.Mock).mock.calls[1][1].headers['X-API-Token']).toBe(mockToken);
    });

    it('should throw LabelAuthenticationError after all retries fail', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Forbidden', code: 403 }),
      });

      await expect(taskService.addLabelToTask(taskId, labelTask)).rejects.toThrow(
        LabelAuthenticationError
      );

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('removeLabelFromTask', () => {
    const taskId = 123;
    const labelId = 5;

    it('should retry with alternative auth headers on 401', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Unauthorized', code: 401 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: {
            get: jest.fn().mockReturnValue('application/json'),
          },
          json: async () => ({ message: 'Success' }),
        });

      const result = await taskService.removeLabelFromTask(taskId, labelId);

      expect(result).toEqual({ message: 'Success' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect((global.fetch as jest.Mock).mock.calls[1][1].headers['X-API-Token']).toBe(mockToken);
    });

    it('should throw LabelAuthenticationError after all retries fail', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized', code: 401 }),
      });

      await expect(taskService.removeLabelFromTask(taskId, labelId)).rejects.toThrow(
        LabelAuthenticationError
      );

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should properly format DELETE request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: async () => ({ message: 'Success' }),
      });

      await taskService.removeLabelFromTask(taskId, labelId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/tasks/${taskId}/labels/${labelId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );
    });
  });

  describe('edge cases', () => {
    it('should handle missing token gracefully', async () => {
      const serviceWithoutToken = new TaskService(mockBaseUrl);
      const taskId = 123;
      const labels: LabelTaskBulk = { label_ids: [1, 2, 3] };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Unauthorized', code: 401 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Unauthorized', code: 401 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Unauthorized', code: 401 }),
        });

      await expect(serviceWithoutToken.updateTaskLabels(taskId, labels)).rejects.toThrow(
        LabelAuthenticationError
      );

      // Should still attempt with empty string for X-API-Token
      expect((global.fetch as jest.Mock).mock.calls[1][1].headers['X-API-Token']).toBe('');
    });

    it('should handle JSON parsing errors in retry logic', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => { throw new Error('JSON parse error'); },
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => { throw new Error('JSON parse error'); },
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => { throw new Error('JSON parse error'); },
        });

      const taskId = 123;
      const labels: LabelTaskBulk = { label_ids: [1, 2, 3] };

      await expect(taskService.updateTaskLabels(taskId, labels)).rejects.toThrow();
      // With JSON parse errors, it will attempt all 3 retries
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});