/**
 * Base service class for all Vikunja API services
 */
import { HttpMethod, ApiError, RequestOptions, RequestParams } from './types.js';
import { buildQueryString } from './request.js';
import { transformParams } from './params.js';
import {
  VikunjaError,
  VikunjaAuthenticationError,
  VikunjaNotFoundError,
  VikunjaValidationError,
  VikunjaServerError,
  ErrorResponse
} from './errors.js';

// Re-export errors for backward compatibility
export {
  VikunjaError,
  VikunjaAuthenticationError,
  VikunjaNotFoundError,
  VikunjaValidationError,
  VikunjaServerError
};

/**
 * Error specific to label authentication failures
 * Label operations may fail with auth errors even with valid tokens
 */
export class LabelAuthenticationError extends VikunjaAuthenticationError {
  constructor(message: string, endpoint: string, method: string, statusCode: number, response: ErrorResponse) {
    super(message, endpoint, method, statusCode, response);
    this.name = 'LabelAuthenticationError';
  }
}

/**
 * Error specific to assignee authentication failures
 * Assignee operations may fail with auth errors even with valid tokens
 */
export class AssigneeAuthenticationError extends VikunjaAuthenticationError {
  constructor(message: string, endpoint: string, method: string, statusCode: number, response: ErrorResponse) {
    super(message, endpoint, method, statusCode, response);
    this.name = 'AssigneeAuthenticationError';
  }
}

/**
 * Base class for all Vikunja service implementations
 */
export abstract class VikunjaService {
  /**
   * Base URL for the Vikunja API
   */
  protected baseUrl: string;

  /**
   * Authentication token
   */
  protected token: string | null;

  /**
   * Create a new service instance
   *
   * @param baseUrl - Base URL for the Vikunja API
   * @param token - Authentication token
   */
  constructor(baseUrl: string, token: string | null = null) {
    // Ensure baseUrl doesn't end with a slash
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.token = token;
  }

  /**
   * Set the authentication token
   *
   * @param token - Authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear the authentication token
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Build a complete URL with query parameters
   *
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns Full URL with query parameters
   */
  protected buildUrl(endpoint: string, params?: RequestParams): string {
    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Build the URL
    const url = `${this.baseUrl}${normalizedEndpoint}`;

    // Add query parameters if provided
    const queryString = buildQueryString(params);

    return url + queryString;
  }

  /**
   * Make an API request
   *
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param body - Request body
   * @param options - Additional request options
   * @returns Response data
   */
  protected async request<T>(
    endpoint: string,
    method: HttpMethod,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    // Transform parameters to match API expectations
    const transformedParams = transformParams(options.params, endpoint);
    const url = this.buildUrl(endpoint, transformedParams);

    // Build headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token is available
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers,
      // Add body if provided (except for GET requests)
      // Don't stringify FormData objects
      body:
        body && method !== 'GET'
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
    };

    try {
      // Make the request
      const response = await fetch(url, requestOptions);

      // Check if the request was successful
      if (!response.ok) {
        let errorData: ApiError;
        let errorResponse: ErrorResponse;

        try {
          errorData = (await response.json()) as ApiError;
          errorResponse = {
            ...errorData
          };
        } catch {
          // If parsing JSON fails, use a generic error message
          errorResponse = {
            message: `API request failed with status ${response.status}`
          };
        }

        // Throw appropriate error based on status code
        const errorMessage = errorResponse.message || `API request failed with status ${response.status}`;
        
        if (response.status === 401 || response.status === 403) {
          throw new VikunjaAuthenticationError(
            errorMessage,
            endpoint,
            method,
            response.status,
            errorResponse
          );
        } else if (response.status === 404) {
          throw new VikunjaNotFoundError(
            errorMessage,
            endpoint,
            method,
            response.status,
            errorResponse
          );
        } else if (response.status === 400) {
          throw new VikunjaValidationError(
            errorMessage,
            endpoint,
            method,
            response.status,
            errorResponse
          );
        } else if (response.status >= 500) {
          throw new VikunjaServerError(
            errorMessage,
            endpoint,
            method,
            response.status,
            errorResponse
          );
        } else {
          throw new VikunjaError(
            errorMessage,
            endpoint,
            method,
            response.status,
            errorResponse
          );
        }
      }

      // Parse response based on responseType option
      const responseType = options.responseType || 'json';

      switch (responseType) {
        case 'text':
          return (await response.text()) as unknown as T;
        case 'blob':
          return (await response.blob()) as unknown as T;
        case 'json':
        default:
          // For empty responses, return empty object
          if (response.status === 204 || response.headers.get('content-length') === '0') {
            return {} as T;
          }
          return (await response.json()) as T;
      }
    } catch (error) {
      // Re-throw VikunjaError
      if (error instanceof VikunjaError) {
        throw error;
      }

      // Handle network errors
      throw new VikunjaError(
        (error as Error).message || 'Network error',
        endpoint,
        method,
        0,
        { message: (error as Error).message || 'Network error' }
      );
    }
  }
}

// Re-export types
export { HttpMethod, ApiError, RequestOptions, RequestParams };
