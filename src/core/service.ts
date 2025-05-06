/**
 * Base service class for all Vikunja API services
 */
import { HttpMethod, ApiError, RequestOptions, RequestParams } from './types';
import { buildQueryString } from './request';

/**
 * Custom error class for Vikunja API errors
 */
export class VikunjaError extends Error {
  public code: number;
  public status: number;

  constructor(message: string, code: number, status: number) {
    super(message);
    this.name = 'VikunjaError';
    this.code = code;
    this.status = status;
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
    const url = this.buildUrl(endpoint, options.params);

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

        try {
          errorData = (await response.json()) as ApiError;
        } catch {
          // If parsing JSON fails, use a generic error message
          throw new VikunjaError(
            `API request failed with status ${response.status}`,
            0,
            response.status
          );
        }

        throw new VikunjaError(
          errorData.message || `API request failed with status ${response.status}`,
          errorData.code || 0,
          response.status
        );
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
      throw new VikunjaError((error as Error).message || 'Network error', 0, 0);
    }
  }
}

// Re-export types
export { HttpMethod, ApiError, RequestOptions, RequestParams };
