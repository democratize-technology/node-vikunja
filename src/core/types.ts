/**
 * Core type definitions
 */

/**
 * HTTP Methods supported by the API
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Request parameters type for API requests
 */
export type RequestParams = Record<string, string | number | boolean | string[] | undefined>;

/**
 * Error response from the API
 */
export interface ApiError {
  code: number;
  message: string;
}

/**
 * Options for request configuration
 */
export interface RequestOptions {
  params?: RequestParams;
  headers?: Record<string, string>;
  responseType?: 'json' | 'text' | 'blob';
}
