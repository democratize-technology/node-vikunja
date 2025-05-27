/**
 * Tests for ProjectService user-related operations
 */
import { ProjectService } from '../../src/services/project.service';
import { ProjectUser } from '../../src/models/project';
import { UserWithRight } from '../../src/models/project';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('ProjectService - User Operations', () => {
  let service: ProjectService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new ProjectService(mockBaseUrl, mockToken);
  });
  
  describe('getProjectUsers', () => {
    it('should get all users with access to a project', async () => {
      const projectId = 123;
      
      // Mock response
      const mockUsers: UserWithRight[] = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          right: 0
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          right: 2
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockUsers),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.getProjectUsers(projectId);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/users`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockUsers);
    });
    
    it('should get project users with pagination and search', async () => {
      const projectId = 123;
      const params = {
        page: 2,
        per_page: 5,
        s: 'admin'
      };
      
      // Mock response
      const mockUsers: UserWithRight[] = [
        {
          id: 3,
          username: 'admin',
          email: 'admin@example.com',
          right: 2
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockUsers),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service with params
      const result = await service.getProjectUsers(projectId, params);
      
      // Build expected URL with query params
      const expectedUrlWithParams = expect.stringContaining(
        `${mockBaseUrl}/projects/${projectId}/users?page=2&per_page=5&s=admin`
      );
      
      // Verify request with query params
      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrlWithParams,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockUsers);
    });
    
    it('should handle error responses', async () => {
      const projectId = 999;
      
      // Error response
      const errorResponse = {
        code: 404,
        message: 'Project not found'
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
        await service.getProjectUsers(projectId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(404);
      }
    });
  });

  describe('addUserToProject', () => {
    it('should add a user to a project', async () => {
      const projectId = 123;
      const projectUser: ProjectUser = {
        user_id: 456,
        project_id: projectId,
        right: 1 // Write access
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(projectUser),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.addUserToProject(projectId, projectUser);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/users`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }),
          body: JSON.stringify(projectUser)
        })
      );
      
      // Verify response
      expect(result).toEqual(projectUser);
    });
    
    it('should handle errors when adding a user to a project', async () => {
      const projectId = 123;
      const projectUser: ProjectUser = {
        user_id: 456,
        project_id: projectId,
        right: 1
      };
      
      const errorResponse = {
        code: 403,
        message: 'You do not have sufficient rights to add users to this project'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await service.addUserToProject(projectId, projectUser);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(403);
      }
    });
  });
  
  describe('updateProjectUserRight', () => {
    it('should update user rights on a project', async () => {
      const projectId = 123;
      const userId = 456;
      const right = 2; // Admin access
      
      const updatedProjectUser: ProjectUser = {
        user_id: userId,
        project_id: projectId,
        right: right
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(updatedProjectUser),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.updateProjectUserRight(projectId, userId, right);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/users/${userId}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }),
          body: JSON.stringify({ right })
        })
      );
      
      // Verify response
      expect(result).toEqual(updatedProjectUser);
    });
    
    it('should handle errors when updating user rights', async () => {
      const projectId = 123;
      const userId = 456;
      const right = 2;
      
      const errorResponse = {
        code: 404,
        message: 'User not found in project'
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
        await service.updateProjectUserRight(projectId, userId, right);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(404);
      }
    });
  });
  
  describe('removeUserFromProject', () => {
    it('should remove a user from a project', async () => {
      const projectId = 123;
      const userId = 456;
      
      const successMessage: Message = {
        message: 'User successfully removed from project'
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(successMessage),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.removeUserFromProject(projectId, userId);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/users/${userId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(successMessage);
    });
    
    it('should handle errors when removing a user from a project', async () => {
      const projectId = 123;
      const userId = 456;
      
      const errorResponse = {
        code: 403,
        message: 'You do not have sufficient rights to remove users from this project'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await service.removeUserFromProject(projectId, userId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(403);
      }
    });
  });
});
