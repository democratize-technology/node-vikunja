/**
 * Tests for NotificationService
 */
import { NotificationService } from '../../src/services/notification.service';
import { DatabaseNotification } from '../../src/models/misc';
import { Message } from '../../src/models/common';
import { DatabaseNotifications } from '../../src/models/notification';
import { VikunjaError } from '../../src/core/service';

// Mock global fetch
global.fetch = jest.fn();

describe('NotificationService', () => {
  let service: NotificationService;
  const mockBaseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'test-token';
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    service = new NotificationService(mockBaseUrl, mockToken);
  });
  
  describe('getNotifications', () => {
    it('should get user notifications with pagination', async () => {
      // Mock request params
      const params = {
        page: 1,
        per_page: 50
      };
      
      // Mock response
      const mockNotifications: DatabaseNotification[] = [
        {
          id: 1,
          subject: 'Task Assignment',
          message: 'You have been assigned to a new task',
          read: false,
          created: '2025-05-05T10:30:00Z',
          entity_id: 42,
          entity_type: 'task',
          user_id: 123
        },
        {
          id: 2,
          subject: 'Comment',
          message: 'Someone commented on your task',
          read: true,
          created: '2025-05-04T15:20:00Z',
          entity_id: 43,
          entity_type: 'task',
          user_id: 123
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockNotifications),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.getNotifications(params);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/notifications?page=1&per_page=50`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockNotifications);
    });
    
    it('should handle forbidden errors', async () => {
      // Error response
      const errorResponse = {
        code: 403,
        message: 'Forbidden'
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
      await expect(service.getNotifications()).rejects.toThrow(VikunjaError);
      await expect(service.getNotifications()).rejects.toMatchObject({
        message: errorResponse.message,
        code: errorResponse.code,
        status: 403
      });
    });
  });
  
  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      // Mock response
      const successMessage: Message = {
        message: 'All notifications marked as read'
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
      const result = await service.markAllAsRead();
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/notifications`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(successMessage);
    });
    
    it('should handle server errors', async () => {
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
      await expect(service.markAllAsRead()).rejects.toThrow(VikunjaError);
      await expect(service.markAllAsRead()).rejects.toMatchObject({
        message: errorResponse.message,
        code: errorResponse.code,
        status: 500
      });
    });
  });
  
  describe('markNotification', () => {
    it('should mark a notification as read/unread', async () => {
      const notificationId = 789;
      const mockNotifications: DatabaseNotifications = {
        count: 1,
        notifications: [
          {
            id: notificationId,
            name: 'Task updated',
            subject: 'Task #123 was updated',
            message: 'The task was marked as complete',
            read: true
          }
        ]
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockNotifications),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await service.markNotification(notificationId);
      
      // Verify request
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/notifications/${notificationId}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockNotifications);
    });
    
    it('should handle errors when marking a notification', async () => {
      const notificationId = 999;
      const errorResponse = {
        code: 404,
        message: 'Notification not found'
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
      await expect(service.markNotification(notificationId)).rejects.toThrow(VikunjaError);
      await expect(service.markNotification(notificationId)).rejects.toMatchObject({
        message: errorResponse.message,
        code: errorResponse.code,
        status: 404
      });
    });
  });
});
