/**
 * Project service for Vikunja API
 */
import { VikunjaService, VikunjaError, VikunjaAuthenticationError } from '../core/service.js';
import { ErrorResponse } from '../core/errors.js';
import { LinkSharing, GetLinkSharesParams } from '../models/share.js';
import { Message, Pagination, SearchParams } from '../models/common.js';
import {
  Bucket,
  Project,
  ProjectDuplicate,
  ProjectUser,
  TeamProject,
  TeamWithRight,
  UserWithRight,
} from '../models/project.js';
import {
  BackgroundImage,
  UnsplashBackgroundImage,
  BackgroundSearchParams,
} from '../models/background.js';
import { ProjectListParams } from '../models/request.js';
import { convertParams } from '../core/request.js';

/**
 * Handles project operations with the Vikunja API
 */
export class ProjectService extends VikunjaService {
  /**
   * Get all projects the user has access to
   *
   * @param params - Query parameters
   * @returns List of projects
   */
  async getProjects(params?: ProjectListParams): Promise<Project[]> {
    return this.request<Project[]>('/projects', 'GET', undefined, {
      params: convertParams(params),
    });
  }

  /**
   * Create a new project
   *
   * @param project - Project data
   * @returns Created project
   */
  async createProject(project: Project): Promise<Project> {
    return this.request<Project>('/projects', 'PUT', project);
  }

  /**
   * Get a specific project by ID
   *
   * @param projectId - Project ID
   * @returns Project details
   */
  async getProject(projectId: number): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}`, 'GET');
  }

  /**
   * Update a project
   *
   * @param projectId - Project ID
   * @param project - Updated project data
   * @returns Updated project
   */
  async updateProject(projectId: number, project: Project): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}`, 'POST', project);
  }

  /**
   * Delete a project
   *
   * @param projectId - Project ID
   * @returns Success message
   */
  async deleteProject(projectId: number): Promise<Message> {
    return this.request<Message>(`/projects/${projectId}`, 'DELETE');
  }

  /**
   * Get all users with access to a project
   *
   * @param projectId - Project ID
   * @param params - Query parameters
   * @returns List of users with their rights
   */
  async getProjectUsers(
    projectId: number,
    params?: Pagination & SearchParams
  ): Promise<UserWithRight[]> {
    return this.request<UserWithRight[]>(`/projects/${projectId}/users`, 'GET', undefined, {
      params: convertParams(params),
    });
  }

  /**
   * Add a user to a project
   *
   * @param projectId - Project ID
   * @param projectUser - Project user relationship
   * @returns Created project user relationship
   */
  async addUserToProject(projectId: number, projectUser: ProjectUser): Promise<ProjectUser> {
    return this.request<ProjectUser>(`/projects/${projectId}/users`, 'PUT', projectUser);
  }

  /**
   * Update user rights on a project
   *
   * @param projectId - Project ID
   * @param userId - User ID
   * @param right - Access right level
   * @returns Updated project user relationship
   */
  async updateProjectUserRight(
    projectId: number,
    userId: number,
    right: number
  ): Promise<ProjectUser> {
    return this.request<ProjectUser>(`/projects/${projectId}/users/${userId}`, 'POST', { right });
  }

  /**
   * Remove a user from a project
   *
   * @param projectId - Project ID
   * @param userId - User ID
   * @returns Success message
   */
  async removeUserFromProject(projectId: number, userId: number): Promise<Message> {
    return this.request<Message>(`/projects/${projectId}/users/${userId}`, 'DELETE');
  }

  /**
   * Get all teams with access to a project
   *
   * @param projectId - Project ID
   * @param params - Query parameters
   * @returns List of teams with their rights
   */
  async getProjectTeams(
    projectId: number,
    params?: Pagination & SearchParams
  ): Promise<TeamWithRight[]> {
    return this.request<TeamWithRight[]>(`/projects/${projectId}/teams`, 'GET', undefined, {
      params: convertParams(params),
    });
  }

  /**
   * Add a team to a project
   *
   * @param projectId - Project ID
   * @param teamProject - Team project relationship
   * @returns Created team project relationship
   */
  async addTeamToProject(projectId: number, teamProject: TeamProject): Promise<TeamProject> {
    return this.request<TeamProject>(`/projects/${projectId}/teams`, 'PUT', teamProject);
  }

  /**
   * Update team rights on a project
   *
   * @param projectId - Project ID
   * @param teamId - Team ID
   * @param right - Access right level
   * @returns Updated team project relationship
   */
  async updateProjectTeamRight(
    projectId: number,
    teamId: number,
    right: number
  ): Promise<TeamProject> {
    return this.request<TeamProject>(`/projects/${projectId}/teams/${teamId}`, 'POST', { right });
  }

  /**
   * Remove a team from a project
   *
   * @param projectId - Project ID
   * @param teamId - Team ID
   * @returns Success message
   */
  async removeTeamFromProject(projectId: number, teamId: number): Promise<Message> {
    return this.request<Message>(`/projects/${projectId}/teams/${teamId}`, 'DELETE');
  }

  /**
   * Duplicate an existing project
   *
   * @param projectId - Project ID to duplicate
   * @param config - Duplication configuration
   * @returns Duplication result
   */
  async duplicateProject(projectId: number, config: ProjectDuplicate): Promise<ProjectDuplicate> {
    return this.request<ProjectDuplicate>(`/projects/${projectId}/duplicate`, 'PUT', config);
  }

  /**
   * Get a project background image
   *
   * @param projectId - Project ID
   * @returns Background image as a blob
   */
  async getProjectBackground(projectId: number): Promise<Blob> {
    return this.request<Blob>(`/projects/${projectId}/background`, 'GET', undefined, {
      responseType: 'blob',
    });
  }

  /**
   * Delete a project background image
   *
   * @param projectId - Project ID
   * @returns Updated project
   */
  async deleteProjectBackground(projectId: number): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}/background`, 'DELETE');
  }

  /**
   * Set an unsplash photo as project background
   *
   * @param projectId - Project ID
   * @param image - Unsplash image data
   * @returns Updated project
   */
  async setUnsplashBackground(projectId: number, image: BackgroundImage): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}/backgrounds/unsplash`, 'POST', image);
  }

  /**
   * Upload a project background image
   *
   * @param projectId - Project ID
   * @param formData - Form data containing the image file
   * @returns Success message
   */
  async uploadProjectBackground(projectId: number, formData: FormData): Promise<Message> {
    // For FormData, we need to handle it specially to prevent automatic Content-Type header
    const url = this.buildUrl(`/projects/${projectId}/backgrounds/upload`);

    const headers: HeadersInit = {};

    // Add authorization header if token is available
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        let errorResponse: ErrorResponse;
        try {
          errorData = await response.json();
          errorResponse = {
            ...errorData
          };
        } catch {
          errorResponse = {
            message: `API request failed with status ${response.status}`
          };
        }

        const errorMessage = errorResponse.message || `API request failed with status ${response.status}`;
        const endpoint = `/projects/${projectId}/backgrounds/upload`;
        const method = 'PUT';
        
        if (response.status === 401 || response.status === 403) {
          throw new VikunjaAuthenticationError(
            errorMessage,
            endpoint,
            method,
            response.status,
            errorResponse
          );
        } else {
          throw new VikunjaError(
            errorMessage,
            endpoint,
            method,
            response.status,
            errorResponse
          );
        }
      }

      return (await response.json()) as Message;
    } catch (error) {
      // Re-throw VikunjaError
      if (error instanceof VikunjaError) {
        throw error;
      }

      // Handle network errors
      throw new VikunjaError(
        (error as Error).message || 'Network error',
        `/projects/${projectId}/backgrounds/upload`,
        'PUT',
        0,
        { message: (error as Error).message || 'Network error' }
      );
    }
  }

  /**
   * Update an existing bucket
   *
   * @param projectId - Project ID
   * @param bucketId - Bucket ID
   * @param bucket - Updated bucket data
   * @returns Updated bucket
   */
  async updateBucket(projectId: number, bucketId: number, bucket: Bucket): Promise<Bucket> {
    return this.request<Bucket>(`/projects/${projectId}/buckets/${bucketId}`, 'POST', bucket);
  }

  /**
   * Delete a bucket
   *
   * @param projectId - Project ID
   * @param bucketId - Bucket ID
   * @returns Success message
   */
  async deleteBucket(projectId: number, bucketId: number): Promise<Message> {
    return this.request<Message>(`/projects/${projectId}/buckets/${bucketId}`, 'DELETE');
  }

  /**
   * Search for background images from Unsplash
   *
   * @param search - Search term
   * @param page - Page number for pagination (optional)
   * @returns Array of background images
   */
  async searchBackgrounds(search: string, page?: number): Promise<UnsplashBackgroundImage[]> {
    const params: BackgroundSearchParams = {
      s: search,
    };

    if (page !== undefined) {
      params.p = page;
    }

    return this.request<UnsplashBackgroundImage[]>(
      '/backgrounds/unsplash/search',
      'GET',
      undefined,
      {
        params: params as Record<string, string | number | boolean | undefined>,
      }
    );
  }

  /**
   * Get a full-size background image by ID
   *
   * @param imageId - Unsplash image ID
   * @returns Image as a Blob
   */
  async getBackgroundImage(imageId: number): Promise<Blob> {
    return this.request<Blob>(`/backgrounds/unsplash/image/${imageId}`, 'GET', undefined, {
      responseType: 'blob',
    });
  }

  /**
   * Get a thumbnail of a background image by ID
   *
   * @param imageId - Unsplash image ID
   * @returns Thumbnail image as a Blob
   */
  async getBackgroundThumbnail(imageId: number): Promise<Blob> {
    return this.request<Blob>(`/backgrounds/unsplash/image/${imageId}/thumb`, 'GET', undefined, {
      responseType: 'blob',
    });
  }

  /**
   * Get all link shares for a project
   *
   * @param projectId - Project ID
   * @param params - Query parameters
   * @returns List of link shares
   */
  async getLinkShares(projectId: number, params?: GetLinkSharesParams): Promise<LinkSharing[]> {
    return this.request<LinkSharing[]>(`/projects/${projectId}/shares`, 'GET', undefined, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Get a specific link share by ID
   *
   * @param projectId - Project ID
   * @param shareId - Share ID
   * @returns Link share details
   */
  async getLinkShare(projectId: number, shareId: number): Promise<LinkSharing> {
    return this.request<LinkSharing>(`/projects/${projectId}/shares/${shareId}`, 'GET');
  }

  /**
   * Create a new link share for a project
   *
   * @param projectId - Project ID
   * @param share - Link share to create
   * @returns Created link share
   */
  async createLinkShare(projectId: number, share: LinkSharing): Promise<LinkSharing> {
    return this.request<LinkSharing>(`/projects/${projectId}/shares`, 'PUT', share);
  }

  /**
   * Delete a link share
   *
   * @param projectId - Project ID
   * @param shareId - Share ID
   * @returns Success message
   */
  async deleteLinkShare(projectId: number, shareId: number): Promise<Message> {
    return this.request<Message>(`/projects/${projectId}/shares/${shareId}`, 'DELETE');
  }
}
