/**
 * Team service for Vikunja API
 */
import { VikunjaService } from '../core/service';
import { Team } from '../models/misc';
import { TeamListParams } from '../models/request';
import { convertParams } from '../core/request';

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
