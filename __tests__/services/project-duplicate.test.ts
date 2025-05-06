/**
 * Tests for duplicateProject functionality in ProjectService
 */
import { ProjectService } from '../../src/services/project.service';
import { ProjectDuplicate } from '../../src/models/project';
import { VikunjaError } from '../../src/core/service';

// Mock global fetch
global.fetch = jest.fn();

describe('ProjectService - duplicateProject', () => {
  let service: ProjectService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new ProjectService(mockBaseUrl, mockToken);
  });
  
  it('should duplicate a project', async () => {
    const projectId = 123;
    const duplicateConfig: ProjectDuplicate = {
      parent_project_id: 456,
      title: 'Duplicated Project',
      include_tasks: true,
      include_teams: true,
      include_labels: true,
      include_buckets: true
    };
    
    const duplicatedProject: ProjectDuplicate = {
      ...duplicateConfig,
      // Additional properties that might be returned
    };
    
    // Mock the fetch response
    const mockResponse = {
      ok: true,
      status: 201,
      statusText: 'Created',
      json: jest.fn().mockResolvedValue(duplicatedProject),
      headers: new Headers({
        'content-type': 'application/json',
      })
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    // Call the service
    const result = await service.duplicateProject(projectId, duplicateConfig);
    
    // Verify request
    expect(global.fetch).toHaveBeenCalledWith(
      `${mockBaseUrl}/projects/${projectId}/duplicate`,
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        }),
        body: JSON.stringify(duplicateConfig)
      })
    );
    
    // Verify response
    expect(result).toEqual(duplicatedProject);
  });
  
  it('should handle errors when duplicating a project', async () => {
    const projectId = 123;
    const duplicateConfig: ProjectDuplicate = {
      parent_project_id: 456,
      title: 'Duplicated Project'
    };
    
    const errorResponse = {
      code: 403,
      message: 'Forbidden - insufficient rights'
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
      await service.duplicateProject(projectId, duplicateConfig);
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(VikunjaError);
      expect((error as VikunjaError).message).toBe(errorResponse.message);
      expect((error as VikunjaError).code).toBe(errorResponse.code);
      expect((error as VikunjaError).status).toBe(403);
    }
  });
});
