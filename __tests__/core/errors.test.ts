import {
  VikunjaError,
  VikunjaAuthenticationError,
  VikunjaNotFoundError,
  VikunjaValidationError,
  VikunjaServerError,
  isVikunjaError,
  isVikunjaAuthenticationError,
  isVikunjaNotFoundError,
  isVikunjaValidationError,
  isVikunjaServerError,
  ErrorResponse
} from '../../src/core/errors';

describe('Error Classes', () => {
  const mockResponse: ErrorResponse = {
    code: 1001,
    message: 'Test error message',
    field: 'test_field'
  };

  describe('VikunjaError', () => {
    it('should create a base error with all properties', () => {
      const error = new VikunjaError(
        'Test error',
        '/api/test',
        'POST',
        400,
        mockResponse
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(VikunjaError);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('VikunjaError');
      expect(error.endpoint).toBe('/api/test');
      expect(error.method).toBe('POST');
      expect(error.statusCode).toBe(400);
      expect(error.response).toEqual(mockResponse);
    });

    it('should have a proper stack trace', () => {
      const error = new VikunjaError(
        'Test error',
        '/api/test',
        'GET',
        500,
        mockResponse
      );

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('VikunjaError');
    });
  });

  describe('VikunjaAuthenticationError', () => {
    it('should create an authentication error', () => {
      const error = new VikunjaAuthenticationError(
        'Unauthorized',
        '/api/protected',
        'GET',
        401,
        mockResponse
      );

      expect(error).toBeInstanceOf(VikunjaError);
      expect(error).toBeInstanceOf(VikunjaAuthenticationError);
      expect(error.name).toBe('VikunjaAuthenticationError');
      expect(error.statusCode).toBe(401);
    });

    it('should handle 403 errors', () => {
      const error = new VikunjaAuthenticationError(
        'Forbidden',
        '/api/protected',
        'DELETE',
        403,
        mockResponse
      );

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });
  });

  describe('VikunjaNotFoundError', () => {
    it('should create a not found error', () => {
      const error = new VikunjaNotFoundError(
        'Resource not found',
        '/api/tasks/999',
        'GET',
        404,
        mockResponse
      );

      expect(error).toBeInstanceOf(VikunjaError);
      expect(error).toBeInstanceOf(VikunjaNotFoundError);
      expect(error.name).toBe('VikunjaNotFoundError');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('VikunjaValidationError', () => {
    it('should create a validation error', () => {
      const validationResponse: ErrorResponse = {
        code: 4001,
        message: 'Validation failed',
        errors: {
          title: 'Title is required',
          due_date: 'Invalid date format'
        }
      };

      const error = new VikunjaValidationError(
        'Validation failed',
        '/api/tasks',
        'POST',
        400,
        validationResponse
      );

      expect(error).toBeInstanceOf(VikunjaError);
      expect(error).toBeInstanceOf(VikunjaValidationError);
      expect(error.name).toBe('VikunjaValidationError');
      expect(error.statusCode).toBe(400);
      expect(error.response.errors).toBeDefined();
    });
  });

  describe('VikunjaServerError', () => {
    it('should create a server error', () => {
      const error = new VikunjaServerError(
        'Internal server error',
        '/api/tasks',
        'GET',
        500,
        mockResponse
      );

      expect(error).toBeInstanceOf(VikunjaError);
      expect(error).toBeInstanceOf(VikunjaServerError);
      expect(error.name).toBe('VikunjaServerError');
      expect(error.statusCode).toBe(500);
    });

    it('should handle various 5xx errors', () => {
      const error502 = new VikunjaServerError(
        'Bad Gateway',
        '/api/tasks',
        'GET',
        502,
        mockResponse
      );

      const error503 = new VikunjaServerError(
        'Service Unavailable',
        '/api/tasks',
        'GET',
        503,
        mockResponse
      );

      expect(error502.statusCode).toBe(502);
      expect(error503.statusCode).toBe(503);
    });
  });

  describe('Type Guards', () => {
    const baseError = new VikunjaError('Base', '/api', 'GET', 400, mockResponse);
    const authError = new VikunjaAuthenticationError('Auth', '/api', 'GET', 401, mockResponse);
    const notFoundError = new VikunjaNotFoundError('Not Found', '/api', 'GET', 404, mockResponse);
    const validationError = new VikunjaValidationError('Validation', '/api', 'POST', 400, mockResponse);
    const serverError = new VikunjaServerError('Server', '/api', 'GET', 500, mockResponse);
    const standardError = new Error('Standard error');

    describe('isVikunjaError', () => {
      it('should return true for all Vikunja errors', () => {
        expect(isVikunjaError(baseError)).toBe(true);
        expect(isVikunjaError(authError)).toBe(true);
        expect(isVikunjaError(notFoundError)).toBe(true);
        expect(isVikunjaError(validationError)).toBe(true);
        expect(isVikunjaError(serverError)).toBe(true);
      });

      it('should return false for non-Vikunja errors', () => {
        expect(isVikunjaError(standardError)).toBe(false);
        expect(isVikunjaError(null)).toBe(false);
        expect(isVikunjaError(undefined)).toBe(false);
        expect(isVikunjaError('string')).toBe(false);
        expect(isVikunjaError({})).toBe(false);
      });
    });

    describe('isVikunjaAuthenticationError', () => {
      it('should return true only for authentication errors', () => {
        expect(isVikunjaAuthenticationError(authError)).toBe(true);
        expect(isVikunjaAuthenticationError(baseError)).toBe(false);
        expect(isVikunjaAuthenticationError(notFoundError)).toBe(false);
        expect(isVikunjaAuthenticationError(validationError)).toBe(false);
        expect(isVikunjaAuthenticationError(serverError)).toBe(false);
        expect(isVikunjaAuthenticationError(standardError)).toBe(false);
      });
    });

    describe('isVikunjaNotFoundError', () => {
      it('should return true only for not found errors', () => {
        expect(isVikunjaNotFoundError(notFoundError)).toBe(true);
        expect(isVikunjaNotFoundError(baseError)).toBe(false);
        expect(isVikunjaNotFoundError(authError)).toBe(false);
        expect(isVikunjaNotFoundError(validationError)).toBe(false);
        expect(isVikunjaNotFoundError(serverError)).toBe(false);
        expect(isVikunjaNotFoundError(standardError)).toBe(false);
      });
    });

    describe('isVikunjaValidationError', () => {
      it('should return true only for validation errors', () => {
        expect(isVikunjaValidationError(validationError)).toBe(true);
        expect(isVikunjaValidationError(baseError)).toBe(false);
        expect(isVikunjaValidationError(authError)).toBe(false);
        expect(isVikunjaValidationError(notFoundError)).toBe(false);
        expect(isVikunjaValidationError(serverError)).toBe(false);
        expect(isVikunjaValidationError(standardError)).toBe(false);
      });
    });

    describe('isVikunjaServerError', () => {
      it('should return true only for server errors', () => {
        expect(isVikunjaServerError(serverError)).toBe(true);
        expect(isVikunjaServerError(baseError)).toBe(false);
        expect(isVikunjaServerError(authError)).toBe(false);
        expect(isVikunjaServerError(notFoundError)).toBe(false);
        expect(isVikunjaServerError(validationError)).toBe(false);
        expect(isVikunjaServerError(standardError)).toBe(false);
      });
    });
  });
});