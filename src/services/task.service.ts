/**
 * Task service for Vikunja API
 */
import { convertParams } from '../core/request.js';
import { VikunjaService, VikunjaError } from '../core/service.js';
import { FilterParams, Message, Pagination, SearchParams, SortParams } from '../models/common.js';
import { TaskLabel, Label, GetTaskLabelsParams } from '../models/label.js';
import {
  Task,
  TaskAssignment,
  TaskBulkOperation,
  TaskRelation,
  TaskComment,
  BulkTask,
  BulkAssignees,
  LabelTaskBulk,
  RelationKind,
  TaskAttachment,
} from '../models/task.js';

/**
 * Parameters for getting tasks
 */
export interface GetTasksParams extends Pagination, SearchParams, FilterParams, SortParams {}

/**
 * Handles task operations with the Vikunja API
 */
export class TaskService extends VikunjaService {
  /**
   * Get all tasks across all projects
   *
   * @param params - Optional parameters for pagination, search, filtering, and sorting
   * @returns List of tasks
   */
  async getAllTasks(params?: GetTasksParams): Promise<Task[]> {
    return this.request<Task[]>('/tasks/all', 'GET', undefined, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Get all tasks in a project
   *
   * @param projectId - Project ID
   * @param params - Query parameters
   * @returns List of tasks
   */
  async getProjectTasks(projectId: number, params?: GetTasksParams): Promise<Task[]> {
    return this.request<Task[]>(`/projects/${projectId}/tasks`, 'GET', undefined, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Create a new task in a project
   *
   * @param projectId - Project ID
   * @param task - Task data
   * @returns Created task
   */
  async createTask(projectId: number, task: Task): Promise<Task> {
    return this.request<Task>(`/projects/${projectId}/tasks`, 'PUT', task);
  }

  /**
   * Get a specific task by ID
   *
   * @param taskId - Task ID
   * @returns Task details
   */
  async getTask(taskId: number): Promise<Task> {
    return this.request<Task>(`/tasks/${taskId}`, 'GET');
  }

  /**
   * Update a task
   *
   * @param taskId - Task ID
   * @param task - Updated task data
   * @returns Updated task
   */
  async updateTask(taskId: number, task: Task): Promise<Task> {
    return this.request<Task>(`/tasks/${taskId}`, 'POST', task);
  }

  /**
   * Delete a task
   *
   * @param taskId - Task ID
   * @returns Success message
   */
  async deleteTask(taskId: number): Promise<Message> {
    return this.request<Message>(`/tasks/${taskId}`, 'DELETE');
  }

  /**
   * Mark a task as done
   *
   * @param taskId - Task ID
   * @returns Updated task
   */
  async markTaskDone(taskId: number): Promise<Task> {
    return this.request<Task>(`/tasks/${taskId}/done`, 'POST');
  }

  /**
   * Mark a task as undone
   *
   * @param taskId - Task ID
   * @returns Updated task
   */
  async markTaskUndone(taskId: number): Promise<Task> {
    return this.request<Task>(`/tasks/${taskId}/undone`, 'POST');
  }

  /**
   * Get all assignees for a task
   *
   * @param taskId - Task ID
   * @param params - Query parameters for pagination and search
   * @returns List of users assigned to the task
   */
  async getTaskAssignees(
    taskId: number,
    params?: { page?: number; per_page?: number; s?: string }
  ): Promise<unknown[]> {
    return this.request<unknown[]>(`/tasks/${taskId}/assignees`, 'GET', undefined, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Add a user as an assignee to a task
   *
   * @param taskId - Task ID
   * @param userId - User ID
   * @returns Task assignment
   */
  async assignUserToTask(taskId: number, userId: number): Promise<TaskAssignment> {
    return this.request<TaskAssignment>(`/tasks/${taskId}/assignees`, 'PUT', { user_id: userId });
  }

  /**
   * Add multiple users as assignees to a task
   *
   * @param taskId - Task ID
   * @param assignees - Bulk assignees data with user IDs
   * @returns Task assignment result
   */
  async bulkAssignUsersToTask(taskId: number, assignees: BulkAssignees): Promise<TaskAssignment> {
    return this.request<TaskAssignment>(`/tasks/${taskId}/assignees/bulk`, 'POST', assignees);
  }

  /**
   * Remove a user assignment from a task
   *
   * @param taskId - Task ID
   * @param userId - User ID
   * @returns Success message
   */
  async removeUserFromTask(taskId: number, userId: number): Promise<Message> {
    return this.request<Message>(`/tasks/${taskId}/assignees/${userId}`, 'DELETE');
  }

  /**
   * Get all comments for a task
   *
   * @param taskId - Task ID
   * @returns List of task comments
   */
  async getTaskComments(taskId: number): Promise<TaskComment[]> {
    return this.request<TaskComment[]>(`/tasks/${taskId}/comments`, 'GET');
  }

  /**
   * Create a new comment on a task
   *
   * @param taskId - Task ID
   * @param comment - Comment data
   * @returns Created task comment
   */
  async createTaskComment(taskId: number, comment: TaskComment): Promise<TaskComment> {
    return this.request<TaskComment>(`/tasks/${taskId}/comments`, 'PUT', comment);
  }

  /**
   * Get a specific task comment
   *
   * @param taskId - Task ID
   * @param commentId - Comment ID
   * @returns Task comment
   */
  async getTaskComment(taskId: number, commentId: number): Promise<TaskComment> {
    return this.request<TaskComment>(`/tasks/${taskId}/comments/${commentId}`, 'GET');
  }

  /**
   * Update a task comment
   *
   * @param taskId - Task ID
   * @param commentId - Comment ID
   * @param comment - Updated comment data
   * @returns Updated task comment
   */
  async updateTaskComment(
    taskId: number,
    commentId: number,
    comment: TaskComment
  ): Promise<TaskComment> {
    return this.request<TaskComment>(`/tasks/${taskId}/comments/${commentId}`, 'POST', comment);
  }

  /**
   * Delete a task comment
   *
   * @param taskId - Task ID
   * @param commentId - Comment ID
   * @returns Success message
   */
  async deleteTaskComment(taskId: number, commentId: number): Promise<Message> {
    return this.request<Message>(`/tasks/${taskId}/comments/${commentId}`, 'DELETE');
  }

  /**
   * Update all labels on a task
   *
   * @param taskId - Task ID
   * @param labels - Bulk label operation data
   * @returns Label update result
   */
  async updateTaskLabels(taskId: number, labels: LabelTaskBulk): Promise<LabelTaskBulk> {
    return this.request<LabelTaskBulk>(`/tasks/${taskId}/labels/bulk`, 'POST', labels);
  }

  /**
   * Create a relation between tasks
   *
   * @param taskId - Task ID
   * @param relation - Relation data
   * @returns Created task relation
   */
  async createTaskRelation(taskId: number, relation: TaskRelation): Promise<TaskRelation> {
    return this.request<TaskRelation>(`/tasks/${taskId}/relations`, 'PUT', relation);
  }

  /**
   * Delete a relation between tasks
   *
   * @param taskId - Task ID
   * @param relationKind - Kind of relation
   * @param otherTaskId - ID of the related task
   * @returns Success message
   */
  async deleteTaskRelation(
    taskId: number,
    relationKind: RelationKind,
    otherTaskId: number
  ): Promise<Message> {
    return this.request<Message>(
      `/tasks/${taskId}/relations/${relationKind}/${otherTaskId}`,
      'DELETE'
    );
  }

  /**
   * Bulk update tasks
   *
   * @param operation - Bulk operation data with task_ids, field, and value
   * @returns Array of updated tasks
   */
  async bulkUpdateTasks(operation: TaskBulkOperation): Promise<Task[]> {
    return this.request<Task[]>('/tasks/bulk', 'POST', operation);
  }

  /**
   * Get all attachments for a task
   *
   * @param taskId - Task ID
   * @param params - Optional pagination params
   * @returns List of task attachments
   */
  async getTaskAttachments(
    taskId: number,
    params?: { page?: number; per_page?: number }
  ): Promise<TaskAttachment[]> {
    return this.request<TaskAttachment[]>(`/tasks/${taskId}/attachments`, 'GET', undefined, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Upload a file as an attachment to a task
   *
   * @param taskId - Task ID
   * @param formData - Form data containing the file(s)
   * @returns Success message
   */
  async uploadTaskAttachment(taskId: number, formData: FormData): Promise<Message> {
    // For FormData, we need to handle it specially to prevent automatic Content-Type header
    const url = this.buildUrl(`/tasks/${taskId}/attachments`);

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
        try {
          errorData = await response.json();
        } catch {
          throw new VikunjaError(
            `API request failed with status ${response.status}`,
            0,
            response.status
          );
        }

        throw new VikunjaError(
          errorData.message || `API request failed with status ${response.status}`,
          errorData.code || 0,
          response.status
        );
      }

      return (await response.json()) as Message;
    } catch (error) {
      // Re-throw VikunjaError
      if (error instanceof VikunjaError) {
        throw error;
      }

      // Handle network errors
      throw new VikunjaError((error as Error).message || 'Network error', 0, 0);
    }
  }

  /**
   * Get a specific task attachment
   *
   * @param taskId - Task ID
   * @param attachmentId - Attachment ID
   * @returns Attachment file as a blob
   */
  async getTaskAttachment(taskId: number, attachmentId: number): Promise<Blob> {
    return this.request<Blob>(`/tasks/${taskId}/attachments/${attachmentId}`, 'GET', undefined, {
      responseType: 'blob',
    });
  }

  /**
   * Delete a task attachment
   *
   * @param taskId - Task ID
   * @param attachmentId - Attachment ID
   * @returns Success message
   */
  async deleteTaskAttachment(taskId: number, attachmentId: number): Promise<Message> {
    return this.request<Message>(`/tasks/${taskId}/attachments/${attachmentId}`, 'DELETE');
  }

  /**
   * Update tasks across multiple projects
   *
   * This method allows you to update or create tasks across multiple projects at once.
   * It takes a bulk task object which is like a normal task but uses an array of
   * project_ids instead of a single project_id.
   *
   * @param bulkTask - The bulk task data with project_ids
   * @returns The result task data
   */
  async updateTasksAcrossProjects(bulkTask: BulkTask): Promise<Task> {
    return this.request<Task>('/tasks/bulk', 'POST', bulkTask);
  }

  /**
   * Get all labels on a task
   *
   * @param taskId - Task ID
   * @param params - Query parameters
   * @returns List of labels
   */
  async getTaskLabels(taskId: number, params?: GetTaskLabelsParams): Promise<Label[]> {
    return this.request<Label[]>(`/tasks/${taskId}/labels`, 'GET', undefined, {
      params: convertParams(params),
    });
  }

  /**
   * Add a label to a task
   *
   * @param taskId - Task ID
   * @param labelTask - Label task data
   * @returns Created task label relation
   */
  async addLabelToTask(taskId: number, labelTask: TaskLabel): Promise<TaskLabel> {
    return this.request<TaskLabel>(`/tasks/${taskId}/labels`, 'PUT', labelTask);
  }

  /**
   * Remove a label from a task
   *
   * @param taskId - Task ID
   * @param labelId - Label ID
   * @returns Success message
   */
  async removeLabelFromTask(taskId: number, labelId: number): Promise<Message> {
    return this.request<Message>(`/tasks/${taskId}/labels/${labelId}`, 'DELETE');
  }
}
