/**
 * Tests for core ProjectService operations
 */
import { ProjectService } from '../../src/services/project.service';
import { Project } from '../../src/models/project';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';
import { LinkSharing, SharingType } from '../../src/models/share';

// Mock global fetch
global.fetch = jest.fn();

describe('ProjectService - Core Operations', () => {
  let service: ProjectService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';

  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new ProjectService(mockBaseUrl, mockToken);
  });

  describe('getProjects', () => {
    it('should get all projects', async () => {
      // Mock response
      const mockProjects: Project[] = [
        {
          id: 1,
          title: 'Project 1',
          description: 'Description 1',
        },
        {
          id: 2,
          title: 'Project 2',
          description: 'Description 2',
        },
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockProjects),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.getProjects();

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockProjects);
    });

    it('should get projects with filter parameters', async () => {
      // Mock response
      const mockProjects: Project[] = [
        {
          id: 1,
          title: 'Project 1',
          is_archived: false,
        },
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockProjects),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service with params
      const params = {
        page: 1,
        per_page: 10,
        s: 'project',
        is_archived: false,
        sort_by: 'title',
        order_by: 'asc' as const,
        filter_by: 'title',
        filter_value: 'Project',
        filter_comparator: 'like' as const,
      };

      const result = await service.getProjects(params);

      // Build expected URL with query params
      const expectedUrlWithParams = expect.stringContaining(
        `${mockBaseUrl}/projects?page=1&per_page=10&s=project&is_archived=false&sort_by=title&order_by=asc&filter_by=title&filter_value=Project&filter_comparator=like`
      );

      // Verify request with query params
      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrlWithParams,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockProjects);
    });

    it('should handle error responses', async () => {
      // Error response
      const errorResponse = {
        code: 403,
        message: 'You do not have access to this project',
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
        await service.getProjects();
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(403);
      }
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const newProject: Project = {
        title: 'New Project',
        description: 'Project Description',
      };

      const createdProject: Project = {
        id: 123,
        title: 'New Project',
        description: 'Project Description',
        created: '2025-05-05T12:00:00Z',
        updated: '2025-05-05T12:00:00Z',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(createdProject),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.createProject(newProject);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          }),
          body: JSON.stringify(newProject),
        })
      );

      // Verify response
      expect(result).toEqual(createdProject);
    });

    it('should handle errors when creating a project', async () => {
      const newProject: Project = {
        title: 'New Project',
        description: 'Project Description',
      };

      const errorResponse = {
        code: 400,
        message: 'Invalid project data',
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
        await service.createProject(newProject);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });

  describe('getProject', () => {
    it('should get a project by ID', async () => {
      const projectId = 123;
      const mockProject: Project = {
        id: projectId,
        title: 'Test Project',
        description: 'Project Description',
        created: '2025-05-05T12:00:00Z',
        updated: '2025-05-05T12:00:00Z',
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

      // Call the service
      const result = await service.getProject(projectId);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify response
      expect(result).toEqual(mockProject);
    });

    it('should handle error when getting a project', async () => {
      const projectId = 999;
      const errorResponse = {
        code: 404,
        message: 'Project not found',
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
        await service.getProject(projectId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
  });

  describe('updateProject', () => {
    it('should update a project by ID', async () => {
      const projectId = 123;
      const projectUpdate: Project = {
        title: 'Updated Project',
        description: 'Updated Description',
      };

      const updatedProject: Project = {
        id: projectId,
        title: 'Updated Project',
        description: 'Updated Description',
        created: '2025-05-05T12:00:00Z',
        updated: '2025-05-05T12:00:00Z',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(updatedProject),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the service
      const result = await service.updateProject(projectId, projectUpdate);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          }),
          body: JSON.stringify(projectUpdate),
        })
      );

      // Verify response
      expect(result).toEqual(updatedProject);
    });

    it('should handle errors when updating a project', async () => {
      const projectId = 123;
      const projectUpdate: Project = {
        title: 'Updated Project',
        description: 'Updated Description',
      };

      const errorResponse = {
        code: 403,
        message: 'You do not have sufficient rights to edit this project',
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
        await service.updateProject(projectId, projectUpdate);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(403);
      }
    });
  });

  describe('deleteProject', () => {
    it('should delete a project by ID', async () => {
      const projectId = 123;
      const successMessage: Message = {
        message: 'Project successfully deleted',
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
      const result = await service.deleteProject(projectId);

      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}`,
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

    it('should handle errors when deleting a project', async () => {
      const projectId = 123;
      const errorResponse = {
        code: 404,
        message: 'Project not found',
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
        await service.deleteProject(projectId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
  });

  describe('getLinkShares', () => {
    it('should fetch all link shares for a project', async () => {
      const projectId = 123;
      const mockShares: LinkSharing[] = [
        {
          id: 1,
          project_id: projectId,
          hash: 'abc123',
          right: SharingType.Read,
          label: 'Read-only share',
          password_enabled: false,
          created: '2023-01-01T00:00:00Z',
          expires: null,
          sharing_url: 'https://vikunja.example.com/share/abc123',
        },
        {
          id: 2,
          project_id: projectId,
          hash: 'def456',
          right: SharingType.Write,
          label: 'Editable share',
          password_enabled: true,
          created: '2023-01-02T00:00:00Z',
          expires: '2023-12-31T23:59:59Z',
          sharing_url: 'https://vikunja.example.com/share/def456',
        },
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockShares),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await service.getLinkShares(projectId);

      // Verify the result
      expect(result).toEqual(mockShares);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/shares`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should fetch link shares with pagination and search params', async () => {
      const projectId = 123;
      const params = {
        page: 2,
        per_page: 10,
        s: 'abc',
      };
      const mockShares: LinkSharing[] = [
        {
          id: 1,
          project_id: projectId,
          hash: 'abc123',
          right: SharingType.Read,
          label: 'Read-only share',
          password_enabled: false,
          created: '2023-01-01T00:00:00Z',
          expires: null,
          sharing_url: 'https://vikunja.example.com/share/abc123',
        },
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockShares),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await service.getLinkShares(projectId, params);

      // Verify the result
      expect(result).toEqual(mockShares);

      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/shares?page=2&per_page=10&s=abc`,
        expect.anything()
      );
    });

    it('should handle API errors properly', async () => {
      const projectId = 123;
      const errorResponse = {
        code: 404,
        message: 'Project not found',
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
      await expect(service.getLinkShares(projectId)).rejects.toThrow(VikunjaError);

      try {
        await service.getLinkShares(projectId);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
  });

  describe('getLinkShare', () => {
    it('should fetch a specific link share by ID', async () => {
      const projectId = 123;
      const shareId = 456;
      const mockShare: LinkSharing = {
        id: shareId,
        project_id: projectId,
        hash: 'abc123',
        right: SharingType.Read,
        label: 'Read-only share',
        password_enabled: false,
        created: '2023-01-01T00:00:00Z',
        expires: null,
        sharing_url: 'https://vikunja.example.com/share/abc123',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockShare),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await service.getLinkShare(projectId, shareId);

      // Verify the result
      expect(result).toEqual(mockShare);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/shares/${shareId}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle API errors when getting a specific share', async () => {
      const projectId = 123;
      const shareId = 456;
      const errorResponse = {
        code: 404,
        message: 'Share not found',
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
      await expect(service.getLinkShare(projectId, shareId)).rejects.toThrow(VikunjaError);

      try {
        await service.getLinkShare(projectId, shareId);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
  });

  describe('createLinkShare', () => {
    it('should create a new link share', async () => {
      const projectId = 123;
      const newShare: LinkSharing = {
        project_id: projectId,
        right: SharingType.Read,
        label: 'Read-only share',
        password: 'secret123', // Only sent during creation
      };

      const createdShare: LinkSharing = {
        id: 1,
        project_id: projectId,
        hash: 'abc123',
        right: SharingType.Read,
        label: 'Read-only share',
        password_enabled: true, // Password was set
        created: '2023-01-01T00:00:00Z',
        expires: null,
        sharing_url: 'https://vikunja.example.com/share/abc123',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(createdShare),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await service.createLinkShare(projectId, newShare);

      // Verify the result
      expect(result).toEqual(createdShare);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/shares`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(newShare),
        })
      );
    });

    it('should handle API errors when creating a share', async () => {
      const projectId = 123;
      const newShare: LinkSharing = {
        project_id: projectId,
        right: SharingType.Read,
        label: 'Read-only share',
      };

      const errorResponse = {
        code: 403,
        message: 'You do not have permission to create a share',
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
      await expect(service.createLinkShare(projectId, newShare)).rejects.toThrow(VikunjaError);

      try {
        await service.createLinkShare(projectId, newShare);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(403);
      }
    });
  });

  describe('deleteLinkShare', () => {
    it('should delete a link share', async () => {
      const projectId = 123;
      const shareId = 456;
      const mockMessage: Message = {
        message: 'Share successfully deleted',
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
      const result = await service.deleteLinkShare(projectId, shareId);

      // Verify the result
      expect(result).toEqual(mockMessage);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/shares/${shareId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle API errors when deleting a share', async () => {
      const projectId = 123;
      const shareId = 456;
      const errorResponse = {
        code: 404,
        message: 'Share not found',
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
      await expect(service.deleteLinkShare(projectId, shareId)).rejects.toThrow(VikunjaError);

      try {
        await service.deleteLinkShare(projectId, shareId);
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle network errors', async () => {
      const projectId = 123;
      const networkError = new Error('Network error');

      // Mock fetch to throw a network error
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Call the method and expect it to throw
      try {
        await service.getLinkShares(projectId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network error');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(0);
      }
    });

    it('should handle non-JSON error responses', async () => {
      const projectId = 123;

      // Mock a failed response that doesn't return valid JSON
      const mockErrorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: new Headers({
          'content-type': 'text/plain',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockErrorResponse);

      // Call the method and expect it to throw
      try {
        await service.getLinkShares(projectId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toContain('API request failed with status 500');
        expect((error as VikunjaError).status).toBe(500);
      }
    });

    it('should handle empty successful responses', async () => {
      const projectId = 123;
      const shareId = 456;

      // Mock a 204 No Content response
      const mockEmptyResponse = {
        ok: true,
        status: 204,
        statusText: 'No Content',
        headers: new Headers({
          'content-length': '0',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockEmptyResponse);

      // Call the method
      const result = await service.deleteLinkShare(projectId, shareId);

      // Should return an empty object for 204 responses
      expect(result).toEqual({});
    });
  });
});
