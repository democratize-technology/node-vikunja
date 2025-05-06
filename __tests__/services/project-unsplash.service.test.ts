/**
 * Tests for the UnsplashService
 */
import { ProjectService } from '../../src/services/project.service';
import { UnsplashBackgroundImage } from '../../src/models/background';
import { VikunjaError } from '../../src/core/service';

// Mock global fetch
global.fetch = jest.fn();

describe('UnsplashService', () => {
  let service: ProjectService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';

  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new ProjectService(mockBaseUrl, mockToken);
  });

  describe('searchBackgrounds', () => {
    it('should search for backgrounds with the provided term', async () => {
      // Mock response
      const mockResults: UnsplashBackgroundImage[] = [
        {
          id: 1,
          title: 'Mountain Landscape',
          creator: 'photographer1',
          url: 'https://example.com/image1.jpg',
          thumbnail_url: 'https://example.com/image1_thumb.jpg',
        },
        {
          id: 2,
          title: 'Ocean View',
          creator: 'photographer2',
          url: 'https://example.com/image2.jpg',
          thumbnail_url: 'https://example.com/image2_thumb.jpg',
        },
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockResults),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.searchBackgrounds('nature');

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/backgrounds/unsplash/search?s=nature`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockResults);
    });

    it('should support pagination when searching backgrounds', async () => {
      // Mock response
      const mockResults: UnsplashBackgroundImage[] = [
        {
          id: 3,
          title: 'Desert Sunset',
          creator: 'photographer3',
          url: 'https://example.com/image3.jpg',
          thumbnail_url: 'https://example.com/image3_thumb.jpg',
        },
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockResults),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service with pagination
      const result = await service.searchBackgrounds('desert', 2);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/backgrounds/unsplash/search?s=desert&p=2`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockResults);
    });

    it('should handle empty search results', async () => {
      // Mock response with empty array
      const mockResults: UnsplashBackgroundImage[] = [];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockResults),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.searchBackgrounds('nonexistentterm');

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/backgrounds/unsplash/search?s=nonexistentterm`,
        expect.anything()
      );

      // Verify response is empty array
      expect(result).toEqual([]);
    });

    it('should handle error responses', async () => {
      // Error response
      const errorResponse = {
        code: 500,
        message: 'Unsplash API service unavailable',
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
        await service.searchBackgrounds('test');
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(500);
      }
    });
  });

  describe('getBackgroundImage', () => {
    it('should get an image by its ID', async () => {
      const imageId = 123;

      // Create a Blob object for the image data
      const mockImageBlob = new Blob(['mock-image-data'], { type: 'image/jpeg' });

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        blob: jest.fn().mockResolvedValue(mockImageBlob),
        headers: new Headers({
          'content-type': 'image/jpeg',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.getBackgroundImage(imageId);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/backgrounds/unsplash/image/${imageId}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response is a Blob with the correct type
      expect(result).toBe(mockImageBlob);
      expect(result.type).toBe('image/jpeg');
    });

    it('should handle errors when fetching an image', async () => {
      const imageId = 999;

      // Error response
      const errorResponse = {
        code: 404,
        message: 'Image not found',
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
        await service.getBackgroundImage(imageId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
  });

  describe('getBackgroundThumbnail', () => {
    it('should get a thumbnail image by its ID', async () => {
      const imageId = 123;

      // Create a Blob object for the thumbnail data
      const mockThumbBlob = new Blob(['mock-thumbnail-data'], { type: 'image/jpeg' });

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        blob: jest.fn().mockResolvedValue(mockThumbBlob),
        headers: new Headers({
          'content-type': 'image/jpeg',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.getBackgroundThumbnail(imageId);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/backgrounds/unsplash/image/${imageId}/thumb`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response is a Blob with the correct type
      expect(result).toBe(mockThumbBlob);
      expect(result.type).toBe('image/jpeg');
    });

    it('should handle errors when fetching a thumbnail', async () => {
      const imageId = 999;

      // Error response
      const errorResponse = {
        code: 404,
        message: 'Thumbnail not found',
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
        await service.getBackgroundThumbnail(imageId);
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
