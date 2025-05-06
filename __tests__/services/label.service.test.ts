/**
 * Tests for the LabelService
 */
import { LabelService } from '../../src/services/label.service';
import { VikunjaError } from '../../src/core/service';
import { Label } from '../../src/models/label';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('LabelService', () => {
  let labelService: LabelService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';

  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();

    // Create a new service instance
    labelService = new LabelService(baseUrl, mockToken);
  });

  // New tests for getLabels method - lines 31-33
  describe('getLabels', () => {
    it('should fetch all labels', async () => {
      const mockLabels: Label[] = [
        {
          id: 1,
          title: 'Important',
          hex_color: '#ff0000',
        },
        {
          id: 2,
          title: 'Urgent',
          hex_color: '#00ff00',
        },
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockLabels),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await labelService.getLabels();

      // Verify the result
      expect(result).toEqual(mockLabels);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/labels`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should fetch labels with pagination and search params', async () => {
      const params = {
        page: 2,
        per_page: 10,
        s: 'important',
      };
      const mockLabels: Label[] = [
        {
          id: 1,
          title: 'Important',
          hex_color: '#ff0000',
        },
      ];

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockLabels),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await labelService.getLabels(params);

      // Verify the result
      expect(result).toEqual(mockLabels);

      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/labels?page=2&per_page=10&s=important`,
        expect.anything()
      );
    });

    it('should handle API errors properly', async () => {
      const errorResponse = {
        code: 403,
        message: 'Forbidden - no access to labels',
      };

      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      try {
        await labelService.getLabels();
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(403);
      }
    });
  });

  // New tests for createLabel method - lines 34-41
  describe('createLabel', () => {
    it('should create a new label', async () => {
      const newLabel: Label = {
        title: 'New Label',
        hex_color: '#0000ff',
        description: 'A new label for testing',
      };

      const createdLabel: Label = {
        id: 789,
        title: 'New Label',
        hex_color: '#0000ff',
        description: 'A new label for testing',
      };

      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(createdLabel),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      const result = await labelService.createLabel(newLabel);

      // Verify the result
      expect(result).toEqual(createdLabel);

      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/labels`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(newLabel),
        })
      );
    });

    it('should handle API errors when creating a label', async () => {
      const newLabel: Label = {
        title: '', // Empty title to trigger validation error
        hex_color: '#0000ff',
      };

      const errorResponse = {
        code: 400,
        message: 'Label title cannot be empty',
      };

      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method and expect it to throw
      try {
        await labelService.createLabel(newLabel);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(400);
      }
    });
  });

  describe('Label ID-based operations', () => {
    describe('getLabel', () => {
      it('should get a label by ID', async () => {
        const labelId = 456;
        const mockLabel: Label = {
          id: labelId,
          title: 'Important',
          hex_color: '#ff0000',
          description: 'High priority items',
        };

        // Mock the fetch response
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: jest.fn().mockResolvedValue(mockLabel),
          headers: new Headers({
            'content-type': 'application/json',
          }),
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        // Call the service
        const result = await labelService.getLabel(labelId);

        // Verify request
        expect(global.fetch).toHaveBeenCalledWith(
          `${baseUrl}/labels/${labelId}`,
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              Authorization: `Bearer ${mockToken}`,
              'Content-Type': 'application/json',
            }),
          })
        );

        // Verify response
        expect(result).toEqual(mockLabel);
      });

      it('should handle errors when getting a label', async () => {
        const labelId = 999;
        const errorResponse = {
          code: 404,
          message: 'Label not found',
        };

        // Mock the fetch response with an error
        const mockResponse = {
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: jest.fn().mockResolvedValue(errorResponse),
          headers: new Headers({
            'content-type': 'application/json',
          }),
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        // Call the method and expect it to throw
        try {
          await labelService.getLabel(labelId);
          fail('Expected an error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(VikunjaError);
          expect((error as VikunjaError).message).toBe(errorResponse.message);
          expect((error as VikunjaError).code).toBe(errorResponse.code);
          expect((error as VikunjaError).status).toBe(404);
        }
      });
    });

    describe('updateLabel', () => {
      it('should update a label by ID', async () => {
        const labelId = 456;
        const labelUpdate: Label = {
          title: 'Very Important',
          description: 'Highest priority items',
          hex_color: '#ff0000',
        };

        const updatedLabel: Label = {
          id: labelId,
          title: 'Very Important',
          description: 'Highest priority items',
          hex_color: '#ff0000',
        };

        // Mock the fetch response
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: jest.fn().mockResolvedValue(updatedLabel),
          headers: new Headers({
            'content-type': 'application/json',
          }),
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        // Call the service
        const result = await labelService.updateLabel(labelId, labelUpdate);

        // Verify request
        expect(global.fetch).toHaveBeenCalledWith(
          `${baseUrl}/labels/${labelId}`,
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${mockToken}`,
            }),
            body: JSON.stringify(labelUpdate),
          })
        );

        // Verify response
        expect(result).toEqual(updatedLabel);
      });

      it('should handle errors when updating a label', async () => {
        const labelId = 456;
        const labelUpdate: Label = {
          title: 'Very Important',
          description: 'Highest priority items',
          hex_color: '#ff0000',
        };

        const errorResponse = {
          code: 403,
          message: 'Forbidden - no write access',
        };

        // Mock the fetch response with an error
        const mockResponse = {
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: jest.fn().mockResolvedValue(errorResponse),
          headers: new Headers({
            'content-type': 'application/json',
          }),
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        // Call the method and expect it to throw
        try {
          await labelService.updateLabel(labelId, labelUpdate);
          fail('Expected an error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(VikunjaError);
          expect((error as VikunjaError).message).toBe(errorResponse.message);
          expect((error as VikunjaError).code).toBe(errorResponse.code);
          expect((error as VikunjaError).status).toBe(403);
        }
      });
    });

    describe('deleteLabel', () => {
      it('should delete a label by ID', async () => {
        const labelId = 456;
        const successMessage: Message = {
          message: 'Label successfully deleted',
        };

        // Mock the fetch response
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: jest.fn().mockResolvedValue(successMessage),
          headers: new Headers({
            'content-type': 'application/json',
          }),
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        // Call the service
        const result = await labelService.deleteLabel(labelId);

        // Verify request
        expect(global.fetch).toHaveBeenCalledWith(
          `${baseUrl}/labels/${labelId}`,
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${mockToken}`,
            }),
          })
        );

        // Verify response
        expect(result).toEqual(successMessage);
      });

      it('should handle errors when deleting a label', async () => {
        const labelId = 456;
        const errorResponse = {
          code: 404,
          message: 'Label not found',
        };

        // Mock the fetch response with an error
        const mockResponse = {
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: jest.fn().mockResolvedValue(errorResponse),
          headers: new Headers({
            'content-type': 'application/json',
          }),
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        // Call the method and expect it to throw
        try {
          await labelService.deleteLabel(labelId);
          fail('Expected an error to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(VikunjaError);
          expect((error as VikunjaError).message).toBe(errorResponse.message);
          expect((error as VikunjaError).code).toBe(errorResponse.code);
          expect((error as VikunjaError).status).toBe(404);
        }
      });
    });
  });
});
