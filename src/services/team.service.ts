/**
 * Team service for Vikunja API
 */
import { VikunjaService } from '../core/service.js';
import { Team } from '../models/misc.js';
import { TeamListParams } from '../models/request.js';
import { convertParams } from '../core/request.js';

/**
 * Handles team operations with the Vikunja API
 */
export class TeamService extends VikunjaService {
  /**
   * Get all teams with pagination and search
   *
   * @param params - Pagination and search parameters
   * @returns List of teams
   */
  async getTeams(params?: TeamListParams): Promise<Team[]> {
    return this.request<Team[]>('/teams', 'GET', undefined, { params: convertParams(params) });
  }

  /**
   * Create a new team
   *
   * @param team - Team data
   * @returns Created team
   */
  async createTeam(team: Team): Promise<Team> {
    return this.request<Team>('/teams', 'PUT', team);
  }
}
