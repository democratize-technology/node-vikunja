/**
 * Tests for SystemService
 */
import { SystemService } from '../../src/services/system.service';
import { VikunjaInfo } from '../../src/models/system';
import { VikunjaError } from '../../src/core/service';

// Mock global fetch
global.fetch = jest.fn();

describe('SystemService', () => {
  let service: SystemService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new SystemService(mockBaseUrl);
  });
  
  describe('getInfo', () => {
    it('should get system information', async () => {
      // Mock response
      const mockInfo: VikunjaInfo = {
        version: '0.20.0',
        frontend_url: 'https://vikunja.example.com',
        registration_enabled: true,
        email_reminders_enabled: true
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockInfo),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.getInfo();
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/info`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockInfo);
    });
    
    it('should handle errors', async () => {
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
      await expect(service.getInfo()).rejects.toThrow(VikunjaError);
      await expect(service.getInfo()).rejects.toMatchObject({
        message: errorResponse.message,
        code: errorResponse.code,
        status: 500
      });
    });
  });
});
