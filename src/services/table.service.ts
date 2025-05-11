/**
 * Service for managing database tables in test mode
 * This service implements the {table} domain endpoints
 */
import { VikunjaService } from '../core/service.js';
import { TableUser } from '../models/table.js';

/**
 * Service for managing testing-related operations with database tables
 */
export class TableService extends VikunjaService {
  /**
   * Reset a database table to a defined state (testing purposes only)
   *
   * @param tableName - The name of the table to reset
   * @returns Array of TableUser objects
   */
  async resetTable(tableName: string): Promise<TableUser[]> {
    return this.request<TableUser[]>(`/test/${tableName}`, 'PATCH');
  }
}
