/**
 * Model definitions for the Table domain
 */
import { BaseEntity } from './common.js';

/**
 * User model as defined in the Swagger spec for table reset operations
 * Note: In the actual API this might have more properties,
 * but the Swagger shows it as an empty object
 */
export type TableUser = BaseEntity;

/**
 * Response from reset table operation
 */
export interface ResetTableResponse {
  users: TableUser[];
}
