/**
 * Tests for the TableService
 */
import { TableService } from '../../src/services/table.service';
import { TableUser } from '../../src/models/table';
import { VikunjaError } from '../../src/core/service';

// Mock global fetch
global.fetch = jest.fn();

describe('TableService', () => {
  let service: TableService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new TableService(mockBaseUrl, mockToken);
  });
  
  describe('resetTable', () => {
    it('should reset a table', async () => {
      // Mock response
      const mockUsers: TableUser[] = [
        { id: 1 },
        { id: 2 }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(mockUsers),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const tableName = 'users';
      const result = await service.resetTable(tableName);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/test/${tableName}`,
        expect.objectContaining({
          method: 'PATCH',
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
      try {
        await service.resetTable('invalid_table');
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).response.code).toBe(errorResponse.code);
        expect((error as VikunjaError).statusCode).toBe(500);
      }
    });
  });
});
