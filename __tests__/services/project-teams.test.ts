/**
 * Tests for ProjectService team-related operations
 */
import { ProjectService } from '../../src/services/project.service';
import { TeamProject, TeamWithRight } from '../../src/models/project';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('ProjectService - Team Operations', () => {
  let service: ProjectService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new ProjectService(mockBaseUrl, mockToken);
  });
  
  describe('getProjectTeams', () => {
    it('should get all teams with access to a project', async () => {
      const projectId = 123;
      
      // Mock response
      const mockTeams: TeamWithRight[] = [
        {
          id: 1,
          name: 'Team 1',
          description: 'Team 1 Description',
          right: 0
        },
        {
          id: 2,
          name: 'Team 2',
          description: 'Team 2 Description',
          right: 2
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTeams),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.getProjectTeams(projectId);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/teams`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockTeams);
    });
    
    it('should get project teams with pagination and search', async () => {
      const projectId = 123;
      const params = {
        page: 2,
        per_page: 5,
        s: 'admin'
      };
      
      // Mock response
      const mockTeams: TeamWithRight[] = [
        {
          id: 3,
          name: 'Admin Team',
          description: 'Admin Team Description',
          right: 2
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTeams),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service with params
      const result = await service.getProjectTeams(projectId, params);
      
      // Build expected URL with query params
      const expectedUrlWithParams = expect.stringContaining(
        `${mockBaseUrl}/projects/${projectId}/teams?page=2&per_page=5&s=admin`
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
      expect(result).toEqual(mockTeams);
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
        await service.getProjectTeams(projectId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(404);
      }
    });
  });

  describe('addTeamToProject', () => {
    it('should add a team to a project', async () => {
      const projectId = 123;
      const teamProject: TeamProject = {
        team_id: 456,
        project_id: projectId,
        right: 1 // Write access
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(teamProject),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.addTeamToProject(projectId, teamProject);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/teams`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }),
          body: JSON.stringify(teamProject)
        })
      );
      
      // Verify response
      expect(result).toEqual(teamProject);
    });
    
    it('should handle errors when adding a team to a project', async () => {
      const projectId = 123;
      const teamProject: TeamProject = {
        team_id: 456,
        project_id: projectId,
        right: 1
      };
      
      const errorResponse = {
        code: 403,
        message: 'You do not have sufficient rights to add teams to this project'
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
        await service.addTeamToProject(projectId, teamProject);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(403);
      }
    });
  });
  
  describe('updateProjectTeamRight', () => {
    it('should update team rights on a project', async () => {
      const projectId = 123;
      const teamId = 456;
      const right = 2; // Admin access
      
      const updatedTeamProject: TeamProject = {
        team_id: teamId,
        project_id: projectId,
        right: right
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(updatedTeamProject),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.updateProjectTeamRight(projectId, teamId, right);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/teams/${teamId}`,
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
      expect(result).toEqual(updatedTeamProject);
    });
    
    it('should handle errors when updating team rights', async () => {
      const projectId = 123;
      const teamId = 456;
      const right = 2;
      
      const errorResponse = {
        code: 404,
        message: 'Team not found in project'
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
        await service.updateProjectTeamRight(projectId, teamId, right);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(404);
      }
    });
  });
  
  describe('removeTeamFromProject', () => {
    it('should remove a team from a project', async () => {
      const projectId = 123;
      const teamId = 456;
      
      const successMessage: Message = {
        message: 'Team successfully removed from project'
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
      const result = await service.removeTeamFromProject(projectId, teamId);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projects/${projectId}/teams/${teamId}`,
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
    
    it('should handle errors when removing a team from a project', async () => {
      const projectId = 123;
      const teamId = 456;
      
      const errorResponse = {
        code: 403,
        message: 'You do not have sufficient rights to remove teams from this project'
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
        await service.removeTeamFromProject(projectId, teamId);
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
