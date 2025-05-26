/**
 * Parameter transformation and validation utilities for Vikunja API
 */

/**
 * API parameter names as expected by Vikunja API
 */
export const API_PARAMS = {
  // Pagination
  PAGE: 'page',
  PER_PAGE: 'per_page',
  
  // Search
  SEARCH: 's',
  
  // Filtering
  FILTER: 'filter',
  FILTER_TIMEZONE: 'filter_timezone',
  FILTER_INCLUDE_NULLS: 'filter_include_nulls',
  
  // Sorting
  SORT_BY: 'sort_by',
  ORDER_BY: 'order_by',
  
  // Expansion
  EXPAND: 'expand',
} as const;

/**
 * Parameter transformation map
 * Maps from our interface names to API parameter names
 */
const PARAM_TRANSFORMATIONS: Record<string, string> = {
  // Fix filter parameter names
  'filter_by': API_PARAMS.FILTER,
  'filter_value': API_PARAMS.FILTER,
  'filter_comparator': API_PARAMS.FILTER,
  'filter_concat': API_PARAMS.FILTER,
  
  // These are already correct, but included for clarity
  'page': API_PARAMS.PAGE,
  'per_page': API_PARAMS.PER_PAGE,
  's': API_PARAMS.SEARCH,
  'sort_by': API_PARAMS.SORT_BY,
  'order_by': API_PARAMS.ORDER_BY,
  'filter_timezone': API_PARAMS.FILTER_TIMEZONE,
  'filter_include_nulls': API_PARAMS.FILTER_INCLUDE_NULLS,
  'expand': API_PARAMS.EXPAND,
};

/**
 * Transform filter parameters into API filter string
 * 
 * @param params - Parameters containing filter_by, filter_value, etc.
 * @returns Transformed parameters with proper filter string
 */
export function transformFilterParams(params: Record<string, unknown>): Record<string, unknown> {
  const transformed = { ...params };
  
  // Check if we have old-style filter parameters
  if (params.filter_by || params.filter_value || params.filter_comparator) {
    // Build filter string from components
    const filters: string[] = [];
    
    if (Array.isArray(params.filter_by)) {
      params.filter_by.forEach((field: string, index: number) => {
        const value = Array.isArray(params.filter_value) ? params.filter_value[index] : params.filter_value;
        const comparator = params.filter_comparator || 'equals';
        filters.push(`${field} ${comparator} ${value}`);
      });
    } else if (params.filter_by) {
      const comparator = params.filter_comparator || 'equals';
      filters.push(`${params.filter_by} ${comparator} ${params.filter_value}`);
    }
    
    if (filters.length > 0) {
      const concat = params.filter_concat || 'and';
      transformed.filter = filters.join(` ${concat} `);
    }
    
    // Remove old parameters
    delete transformed.filter_by;
    delete transformed.filter_value;
    delete transformed.filter_comparator;
    delete transformed.filter_concat;
  }
  
  return transformed;
}

/**
 * Transform parameters to match API expectations
 * 
 * @param endpoint - API endpoint to determine special handling
 * @param params - Input parameters
 * @returns Transformed parameters
 */
export function transformParams(params?: Record<string, unknown>, endpoint?: string): Record<string, string | number | boolean | string[] | undefined> | undefined {
  if (!params) {
    return undefined;
  }
  
  // First transform filter parameters
  const transformed = transformFilterParams(params);
  
  // Then transform any remaining parameter names
  const result: Record<string, string | number | boolean | string[] | undefined> = {};
  
  for (const [key, value] of Object.entries(transformed)) {
    // Special handling for Unsplash endpoints
    if (endpoint?.includes('/backgrounds/unsplash/') && key === 'page') {
      result['p'] = value as string | number | boolean | string[] | undefined;
    } else {
      const apiKey = PARAM_TRANSFORMATIONS[key] || key;
      result[apiKey] = value as string | number | boolean | string[] | undefined;
    }
  }
  
  return result;
}

/**
 * Validate required parameters for an endpoint
 * 
 * @param endpoint - API endpoint
 * @param params - Parameters to validate
 * @param required - List of required parameter names
 * @throws Error if required parameters are missing
 */
export function validateRequiredParams(
  endpoint: string,
  params: Record<string, unknown> | undefined,
  required: string[]
): void {
  if (!required.length) return;
  
  const missing: string[] = [];
  
  for (const param of required) {
    if (!params || params[param] === undefined) {
      missing.push(param);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required parameters for ${endpoint}: ${missing.join(', ')}`
    );
  }
}

/**
 * Get parameter validation rules for common endpoints
 */
export const ENDPOINT_VALIDATIONS: Record<string, { required: string[]; optional: string[] }> = {
  '/tasks/all': {
    required: [],
    optional: ['page', 'per_page', 's', 'sort_by', 'order_by', 'filter', 'filter_timezone', 'filter_include_nulls', 'expand'],
  },
  '/projects/{id}/tasks': {
    required: [],
    optional: ['page', 'per_page', 's', 'sort_by', 'order_by', 'filter', 'filter_timezone', 'filter_include_nulls'],
  },
  '/labels': {
    required: [],
    optional: ['page', 'per_page', 's'],
  },
  '/teams': {
    required: [],
    optional: ['page', 'per_page', 's'],
  },
  '/users': {
    required: [],
    optional: ['s'],
  },
  '/backgrounds/unsplash/search': {
    required: [],
    optional: ['s', 'p'], // Note: Unsplash uses 'p' instead of 'page'
  },
};