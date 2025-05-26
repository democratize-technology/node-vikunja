/**
 * Common base interfaces used throughout the API
 */
type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

export interface JSONObject {
  [key: string]: JSONValue | undefined;
}

export type JSONArray = Array<JSONValue>;

/**
 * Basic success message response
 */
export interface Message extends JSONObject {
  message: string;
}

/**
 * Pagination parameters for list endpoints
 */
export interface Pagination {
  page?: number;
  per_page?: number;
}

/**
 * Parameters for search functionality
 */
export interface SearchParams {
  s?: string;
}

/**
 * Parameters for filtering
 */
export interface FilterParams {
  filter?: string;
  filter_timezone?: string;
  filter_include_nulls?: boolean;
}

/**
 * Legacy filter parameters (for backward compatibility)
 * @deprecated Use FilterParams with the 'filter' string instead
 */
export interface LegacyFilterParams {
  filter_by?: string | string[];
  filter_value?: string | string[];
  filter_comparator?:
    | 'equals'
    | 'greater'
    | 'greater_equals'
    | 'less'
    | 'less_equals'
    | 'like'
    | 'in';
  filter_concat?: 'and' | 'or';
  filter_include_nulls?: boolean;
}

/**
 * Parameters for sorting
 */
export interface SortParams {
  sort_by?: string | string[];
  order_by?: 'asc' | 'desc' | string[]; // Can be passed multiple times to match sort_by
}

/**
 * Access right levels
 */
export enum AccessRight {
  ReadOnly = 0,
  ReadWrite = 1,
  Admin = 2,
}

/**
 * Base interface for entities with ID
 */
export interface BaseEntity extends JSONObject {
  id?: number;
}
