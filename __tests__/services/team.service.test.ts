/**
 * Tests for TeamService
 */
import { TeamService } from '../../src/services/team.service';
import { Team } from '../../src/models/misc';
import { VikunjaError } from '../../src/core/service';

// Mock global fetch
global.fetch = jest.fn();

describe('TeamService', () => {
  let service: TeamService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new TeamService(mockBaseUrl, mockToken);
  });
  
  describe('getTeams', () => {
    it('should get teams with pagination and search', async () => {
      // Mock request params
      const params = {
        page: 1,
        per_page: 10,
        s: 'dev'
      };
      
      // Mock response
      const mockTeams: Team[] = [
        {
          id: 1,
          name: 'Development',
          description: 'Development team'
        },
        {
          id: 2,
          name: 'DevOps',
          description: 'DevOps team'
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
      const result = await service.getTeams(params);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/teams?page=1&per_page=10&s=dev`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockTeams);
    });
    
    it('should handle error responses', async () => {
      // Error response
      const errorResponse = {
        code: 500,
        message: 'Internal server error'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      await expect(service.getTeams()).rejects.toThrow(VikunjaError);
      await expect(service.getTeams()).rejects.toMatchObject({
        message: errorResponse.message,
        code: errorResponse.code,
        status: 500
      });
    });
  });
  
  describe('createTeam', () => {
    it('should create a new team', async () => {
      // Mock request and response
      const newTeam: Team = {
        name: 'New Team',
        description: 'A new team'
      };
      
      const createdTeam: Team = {
        id: 3,
        name: 'New Team',
        description: 'A new team',
        created_by: {
          id: 123,
          username: 'testuser'
        },
        created: '2025-05-05T12:00:00Z',
        updated: '2025-05-05T12:00:00Z'
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(createdTeam),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.createTeam(newTeam);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/teams`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }),
          body: JSON.stringify(newTeam)
        })
      );
      
      // Verify response
      expect(result).toEqual(createdTeam);
    });
    
    it('should handle bad request errors', async () => {
      // Mock request
      const newTeam: Team = {
        name: '' // Invalid name
      };
      
      // Error response
      const errorResponse = {
        code: 400,
        message: 'Invalid team data'
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
      await expect(service.createTeam(newTeam)).rejects.toThrow(VikunjaError);
      await expect(service.createTeam(newTeam)).rejects.toMatchObject({
        message: errorResponse.message,
        code: errorResponse.code,
        status: 400
      });
    });
  });
  
  describe('deleteTeam', () => {
    it('should delete a team', async () => {
      // Mock response
      const mockResponse = {
        message: 'The team was successfully deleted.'
      };
      
      // Mock the fetch response
      const mockFetchResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);
      
      // Call the service
      const result = await service.deleteTeam(3);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/teams/3`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle not found errors', async () => {
      // Error response
      const errorResponse = {
        code: 404,
        message: 'Team not found'
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
      await expect(service.deleteTeam(999)).rejects.toThrow(VikunjaError);
      await expect(service.deleteTeam(999)).rejects.toMatchObject({
        message: errorResponse.message,
        code: errorResponse.code,
        status: 404
      });
    });
  });
});
