/**
 * Tests for the FilterService
 */
import { FilterService } from '../../src/services/filter.service';
import { SavedFilter } from '../../src/models/filter';
import { VikunjaError } from '../../src/core/service';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('FilterService', () => {
  let service: FilterService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new FilterService(mockBaseUrl, mockToken);
  });
  
  describe('getFilter', () => {
    it('should get a filter by ID', async () => {
      // Mock response
      const mockFilter: SavedFilter = {
        id: 123,
        title: 'My Filter',
        filters: { done: false }
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockFilter),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.getFilter(123);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/filters/123`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockFilter);
    });
    
    it('should handle error responses', async () => {
      // Error response
      const errorResponse = {
        code: 404,
        message: 'Filter not found'
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
        await service.getFilter(999);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(404);
      }
    });
  });

  describe('updateFilter', () => {
    it('should update a filter by ID', async () => {
      const filterId = 123;
      const filterUpdate: SavedFilter = {
        title: 'Updated Filter',
        filters: { priority: 2 }
      };
      
      const updatedFilter: SavedFilter = {
        id: filterId,
        title: 'Updated Filter',
        filters: { priority: 2 }
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(updatedFilter),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.updateFilter(filterId, filterUpdate);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/filters/${filterId}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }),
          body: JSON.stringify(filterUpdate)
        })
      );
      
      // Verify response
      expect(result).toEqual(updatedFilter);
    });
    
    it('should handle errors when updating a filter', async () => {
      const filterId = 123;
      const filterUpdate: SavedFilter = {
        title: 'Updated Filter',
        filters: { priority: 2 }
      };
      
      const errorResponse = {
        code: 403,
        message: 'Forbidden - no write access'
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
        await service.updateFilter(filterId, filterUpdate);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(403);
      }
    });
  });

  describe('createFilter', () => {
    it('should create a new filter', async () => {
      const newFilter: SavedFilter = {
        title: 'New Filter',
        filters: { priority: 1 },
        project_id: 456
      };
      
      const createdFilter: SavedFilter = {
        id: 789,
        title: 'New Filter',
        filters: { priority: 1 },
        project_id: 456,
        created_by_id: 123,
        created: '2025-05-05T12:00:00Z',
        updated: '2025-05-05T12:00:00Z'
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(createdFilter),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.createFilter(newFilter);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/filters`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }),
          body: JSON.stringify(newFilter)
        })
      );
      
      // Verify response
      expect(result).toEqual(createdFilter);
    });
    
    it('should handle errors when creating a filter', async () => {
      const newFilter: SavedFilter = {
        title: 'New Filter',
        filters: { priority: 1 },
        project_id: 456
      };
      
      const errorResponse = {
        code: 400,
        message: 'Invalid filter data'
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
      try {
        await service.createFilter(newFilter);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(400);
      }
    });
  });
  
  describe('deleteFilter', () => {
    it('should delete a filter by ID', async () => {
      const filterId = 123;
      const successMessage: Message = {
        message: 'Filter successfully deleted'
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
      const result = await service.deleteFilter(filterId);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/filters/${filterId}`,
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
    
    it('should handle errors when deleting a filter', async () => {
      const filterId = 123;
      const errorResponse = {
        code: 404,
        message: 'Filter not found'
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
        await service.deleteFilter(filterId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(404);
      }
    });
  });
});
