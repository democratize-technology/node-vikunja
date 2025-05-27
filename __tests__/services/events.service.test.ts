/**
 * Tests for EventsService
 */
import { EventsService } from '../../src/services/events.service';
import { WebhookEvent } from '../../src/models/events';
import { VikunjaError } from '../../src/core/service';

// Mock global fetch
global.fetch = jest.fn();

describe('EventsService', () => {
  let service: EventsService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';

  beforeEach(() => {
    jest.resetAllMocks();
    service = new EventsService(mockBaseUrl, mockToken);
  });

  describe('getWebhookEvents', () => {
    it('should get all webhook events correctly', async () => {
      // Mock response data
      const mockEvents: WebhookEvent[] = [
        'task.create',
        'task.update',
        'task.delete',
        'project.create',
        'project.update',
        'project.delete'
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockEvents),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await service.getWebhookEvents();

      // Verify the response
      expect(result).toEqual(mockEvents);

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/webhooks/events`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('should handle errors correctly', async () => {
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
        await service.getWebhookEvents();
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
