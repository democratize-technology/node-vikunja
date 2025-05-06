/**
 * Tests for the BulkService
 */
import { TaskService } from '../../src/services/task.service';
import { BulkTask, Task } from '../../src/models/task';

// Mock global fetch
global.fetch = jest.fn();

describe('BulkService', () => {
  let bulkService: TaskService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';

  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();

    // Create a new service instance
    bulkService = new TaskService(baseUrl, mockToken);
  });

  describe('updateTasksAcrossProjects', () => {
    it('should update tasks across multiple projects', async () => {
      const bulkTask: BulkTask = {
        project_ids: [1, 2, 3],
        title: 'Bulk Task',
        description: 'This is a bulk task',
        priority: 2,
      };

      const mockTask: Task = {
        id: 123,
        project_id: 1,
        title: 'Bulk Task',
        description: 'This is a bulk task',
        priority: 2,
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTask),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await bulkService.updateTasksAcrossProjects(bulkTask);

      // Verify the result
      expect(result).toEqual(mockTask);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/bulk`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(bulkTask),
        })
      );
    });

    it('should handle error responses correctly', async () => {
      const bulkTask: BulkTask = {
        project_ids: [1, 2, 3],
        title: 'Bulk Task',
        description: 'This is a bulk task',
      };

      // Mock an error response
      const errorResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({
          message: 'Invalid bulk task data',
        }),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(errorResponse);

      // Expect the method to throw an error
      await expect(bulkService.updateTasksAcrossProjects(bulkTask)).rejects.toThrow(
        'Invalid bulk task data'
      );

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
