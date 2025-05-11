/**
 * Common request parameter interfaces
 */
import { Pagination, SearchParams } from './common.js';

/**
 * Parameters for project list requests
 */
export interface ProjectListParams extends Pagination, SearchParams {
  is_archived?: boolean;
}

/**
 * Parameters for notification list requests
 */
export type NotificationListParams = Pagination;

/**
 * Parameters for team list requests
 */
export interface TeamListParams extends Pagination, SearchParams {
  // Additional team filter parameters could be added here
}

/**
 * Parameters for token list requests
 */
export interface TokenListParams extends Pagination, SearchParams {
  // Additional token filter parameters could be added here
}

/**
 * Parameters for user search requests
 */
export type UserSearchParams = SearchParams;

/**
 * Parameters for label list requests
 */
export interface LabelListParams extends Pagination, SearchParams {
  // Additional label filter parameters could be added here
}
