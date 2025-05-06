/**
 * Tests for the ProjectService background methods
 */
import { ProjectService } from '../../src/services/project.service';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';
import { Project } from '../../src/models/project';
import { BackgroundImage } from '../../src/models/background';

// Mock global fetch
global.fetch = jest.fn();

describe('ProjectService - Background Operations', () => {
  let projectService: ProjectService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';

  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();

    // Create a new service instance
    projectService = new ProjectService(baseUrl, mockToken);
  });

  describe('getProjectBackground', () => {
    it('should get a project background image', async () => {
      const projectId = 123;

      // Mock blob for the image content
      const mockBlob = new Blob(['image data'], { type: 'image/jpeg' });

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        blob: jest.fn().mockResolvedValue(mockBlob),
        headers: new Headers({
          'content-type': 'image/jpeg',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await projectService.getProjectBackground(projectId);

      // Verify the result
      expect(result).toEqual(mockBlob);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/${projectId}/background`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('should handle 404 when project has no background', async () => {
      const projectId = 123;
      const errorResponse = {
        code: 404,
        message: 'Project has no background',
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
      await expect(projectService.getProjectBackground(projectId)).rejects.toThrow(VikunjaError);
      await expect(projectService.getProjectBackground(projectId)).rejects.toMatchObject({
        message: errorResponse.message,
        code: errorResponse.code,
        status: 404,
      });
    });
  });

  describe('deleteProjectBackground', () => {
    it('should delete a project background', async () => {
      const projectId = 123;
      const mockProject: Project = {
        id: projectId,
        title: 'Test Project',
        description: 'Project description',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockProject),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await projectService.deleteProjectBackground(projectId);

      // Verify the result
      expect(result).toEqual(mockProject);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/${projectId}/background`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('setUnsplashBackground', () => {
    it('should set an unsplash photo as project background', async () => {
      const projectId = 123;
      const backgroundImage: BackgroundImage = {
        photo_id: 'abc123',
      };

      const mockProject: Project = {
        id: projectId,
        title: 'Test Project',
        description: 'Project description',
        background_information: {
          background_image_id: 123,
          background_image_url: 'http://url',
        },
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockProject),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await projectService.setUnsplashBackground(projectId, backgroundImage);

      // Verify the result
      expect(result).toEqual(mockProject);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/${projectId}/backgrounds/unsplash`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          }),
          body: JSON.stringify(backgroundImage),
        })
      );
    });

    it('should handle errors when setting an unsplash background', async () => {
      const projectId = 123;
      const backgroundImage: BackgroundImage = {
        photo_id: 'invalid-id',
      };

      const errorResponse = {
        code: 400,
        message: 'Invalid photo ID',
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
      await expect(
        projectService.setUnsplashBackground(projectId, backgroundImage)
      ).rejects.toThrow(VikunjaError);
      await expect(
        projectService.setUnsplashBackground(projectId, backgroundImage)
      ).rejects.toMatchObject({
        message: errorResponse.message,
        code: errorResponse.code,
        status: 400,
      });
    });
  });

  describe('uploadProjectBackground', () => {
    it('should upload a file as project background', async () => {
      const projectId = 123;

      // Create a mock FormData with file
      const mockFile = new File(['image data'], 'background.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('background', mockFile);

      const successMessage: Message = {
        message: 'Background successfully uploaded',
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

      // Call the method
      const result = await projectService.uploadProjectBackground(projectId, formData);

      // Verify the result
      expect(result).toEqual(successMessage);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/${projectId}/backgrounds/upload`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            // Note: Content-Type header should be omitted for file uploads
          }),
          body: formData,
        })
      );
    });

    it('should handle errors when uploading a background', async () => {
      const projectId = 123;

      // Create a mock FormData with file
      const mockFile = new File(['image data'], 'background.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('background', mockFile);

      const errorResponse = {
        code: 400,
        message: 'Invalid file type',
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
      await expect(projectService.uploadProjectBackground(projectId, formData)).rejects.toThrow(
        VikunjaError
      );
      await expect(
        projectService.uploadProjectBackground(projectId, formData)
      ).rejects.toMatchObject({
        message: errorResponse.message,
        code: errorResponse.code,
        status: 400,
      });
    });
  });
});
