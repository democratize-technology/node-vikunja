/**
 * Request utility module for converting typed request parameters to API compatible parameters
 */
import { RequestParams } from './types.js';

/**
 * Convert strongly-typed request parameters to a format compatible with the API request function
 * 
 * @param params - Strongly-typed request parameters
 * @returns API compatible parameters
 */
export function convertParams<T extends object>(params?: T): RequestParams | undefined {
  if (!params) {
    return undefined;
  }
  
  // Cast to API compatible params format
  return params as unknown as RequestParams;
}

/**
 * Build query string from parameters
 * 
 * @param params - Query parameters
 * @returns Query string with parameters
 */
export function buildQueryString(params?: Record<string, string | number | boolean | string[] | undefined>): string {
  if (!params) {
    return '';
  }
  
  const queryParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      // Handle array parameters (like sort_by can be passed multiple times)
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, String(v)));
      } else {
        queryParams.append(key, String(value));
      }
    }
  }
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}
