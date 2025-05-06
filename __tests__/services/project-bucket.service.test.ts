/**
 * Tests for the BucketService
 */
import { ProjectService } from '../../src/services/project.service';
import { Bucket } from '../../src/models/project';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('BucketService', () => {
  let service: ProjectService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';

  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new ProjectService(mockBaseUrl, mockToken);
  });

  describe('updateBucket', () => {
    it('should update a bucket by project ID and bucket ID', async () => {
      const projectId = 123;
      const bucketId = 456;
      const bucketUpdate: Bucket = {
        project_id: projectId,
        title: 'Updated Bucket',
        position: 2,
      };

      const updatedBucket: Bucket = {
        id: bucketId,
        project_id: projectId,
        title: 'Updated Bucket',
        position: 2,
        created: '2025-05-05T12:00:00Z',
        updated: '2025-05-05T12:00:00Z',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(updatedBucket),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.updateBucket(projectId, bucketId, bucketUpdate);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/buckets/${bucketId}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          }),
          body: JSON.stringify(bucketUpdate),
        })
      );

      // Verify response
      expect(result).toEqual(updatedBucket);
    });

    it('should handle errors when updating a bucket', async () => {
      const projectId = 123;
      const bucketId = 456;
      const bucketUpdate: Bucket = {
        project_id: projectId,
        title: 'Updated Bucket',
        position: 2,
      };

      const errorResponse = {
        code: 403,
        message: 'Forbidden - no write access',
      };

      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      try {
        await service.updateBucket(projectId, bucketId, bucketUpdate);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(403);
      }
    });
  });

  describe('deleteBucket', () => {
    it('should delete a bucket by project ID and bucket ID', async () => {
      const projectId = 123;
      const bucketId = 456;
      const successMessage: Message = {
        message: 'Bucket successfully deleted',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(successMessage),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.deleteBucket(projectId, bucketId);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/buckets/${bucketId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );

      // Verify response
      expect(result).toEqual(successMessage);
    });

    it('should handle errors when deleting a bucket', async () => {
      const projectId = 123;
      const bucketId = 456;
      const errorResponse = {
        code: 404,
        message: 'Bucket not found',
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
        await service.deleteBucket(projectId, bucketId);
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
