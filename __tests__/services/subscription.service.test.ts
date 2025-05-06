/**
 * Tests for the Subscription service
 */
import { SubscriptionService } from '../../src/services/subscription.service';
import { Subscription } from '../../src/models/subscription';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Reset mocks before each test
beforeEach(() => {
  mockFetch.mockReset();
});

describe('SubscriptionService', () => {
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const token = 'test-token';
  let service: SubscriptionService;

  beforeEach(() => {
    service = new SubscriptionService(baseUrl, token);
  });

  describe('subscribe', () => {
    it('should subscribe to a project', async () => {
      // Setup mock response
      const mockResponse: Subscription = {
        id: 1,
        created: '2023-01-01T00:00:00Z',
        updated: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: {
          get: () => null, // Add headers.get method
        },
      });

      // Call the service method
      const result = await service.subscribe('project', 42);

      // Verify the request
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/subscriptions/project/42`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }),
        })
      );

      // Verify the result
      expect(result).toEqual(mockResponse);
    });

    it('should subscribe to a task', async () => {
      // Setup mock response
      const mockResponse: Subscription = {
        id: 1,
        created: '2023-01-01T00:00:00Z',
        updated: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: {
          get: () => null, // Add headers.get method
        },
      });

      // Call the service method
      const result = await service.subscribe('task', 123);

      // Verify the request
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/subscriptions/task/123`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }),
        })
      );

      // Verify the result
      expect(result).toEqual(mockResponse);
    });

    it('should handle error response', async () => {
      // Setup mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          code: 1004,
          message: 'You don\'t have the right to subscribe to this entity',
        }),
        headers: {
          get: () => null, // Add headers.get method
        },
      });

      // Call the service method and expect it to throw
      await expect(service.subscribe('project', 42)).rejects.toThrow(
        'You don\'t have the right to subscribe to this entity'
      );
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from a project', async () => {
      // Setup mock response
      const mockResponse: Subscription = {
        id: 1,
        created: '2023-01-01T00:00:00Z',
        updated: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: {
          get: () => null, // Add headers.get method
        },
      });

      // Call the service method
      const result = await service.unsubscribe('project', 42);

      // Verify the request
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/subscriptions/project/42`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }),
        })
      );

      // Verify the result
      expect(result).toEqual(mockResponse);
    });

    it('should unsubscribe from a task', async () => {
      // Setup mock response
      const mockResponse: Subscription = {
        id: 1,
        created: '2023-01-01T00:00:00Z',
        updated: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: {
          get: () => null, // Add headers.get method
        },
      });

      // Call the service method
      const result = await service.unsubscribe('task', 123);

      // Verify the request
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/subscriptions/task/123`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }),
        })
      );

      // Verify the result
      expect(result).toEqual(mockResponse);
    });

    it('should handle error response', async () => {
      // Setup mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          code: 1005,
          message: 'Subscription not found',
        }),
        headers: {
          get: () => null, // Add headers.get method
        },
      });

      // Call the service method and expect it to throw
      await expect(service.unsubscribe('project', 42)).rejects.toThrow(
        'Subscription not found'
      );
    });

    it('should handle network error', async () => {
      // Setup mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Call the service method and expect it to throw
      await expect(service.unsubscribe('project', 42)).rejects.toThrow(
        'Network error'
      );
    });
  });
});
