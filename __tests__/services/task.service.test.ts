/**
 * Tests for the TaskService
 */
import { TaskService } from '../../src/services/task.service';
import { VikunjaError } from '../../src/core/service';
import { 
  Task, 
  TaskAssignment, 
  TaskComment, 
  TaskRelation, 
  BulkAssignees, 
  LabelTaskBulk,
  RelationKind,
  TaskBulkOperation,
  TaskAttachment
} from '../../src/models/task';
import { Message } from '../../src/models/common';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskService', () => {
  let taskService: TaskService;
  const baseUrl = 'https://vikunja.example.com/api/v1';
  const mockToken = 'mock-token';
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
    
    // Create a new service instance
    taskService = new TaskService(baseUrl, mockToken);
  });
  
  describe('getAllTasks', () => {
    it('should fetch all tasks across all projects', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          project_id: 1,
          title: 'Task 1',
          description: 'Description 1',
          done: false
        },
        {
          id: 2,
          project_id: 2,
          title: 'Task 2',
          description: 'Description 2',
          done: true
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTasks),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getAllTasks();
      
      // Verify the result
      expect(result).toEqual(mockTasks);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/all`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
    
    it('should fetch all tasks with pagination, search, sorting, and filtering parameters', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          project_id: 1,
          title: 'Task Matching Criteria',
          description: 'Description with search term',
          done: false
        }
      ];
      
      const params = {
        page: 1,
        per_page: 10,
        s: 'search term',
        sort_by: 'title',
        order_by: 'asc' as 'asc' | 'desc',
        filter_by: 'done',
        filter_value: 'false',
        filter_comparator: 'equals' as const
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTasks),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getAllTasks(params);
      
      // Verify the result
      expect(result).toEqual(mockTasks);
      
      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/all?page=1&per_page=10&s=search+term&sort_by=title&order_by=asc&filter_by=done&filter_value=false&filter_comparator=equals`,
        expect.anything()
      );
    });
    
    it('should handle multiple filter parameters', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          project_id: 1,
          title: 'Complex Filtered Task',
          done: false,
          priority: 1
        }
      ];
      
      const params = {
        filter_by: ['done', 'priority'],
        filter_value: ['false', '1'],
        filter_comparator: 'equals' as const,
        filter_concat: 'and' as const
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTasks),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getAllTasks(params);
      
      // Verify the result
      expect(result).toEqual(mockTasks);
      
      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/all?filter_by=done%2Cpriority&filter_value=false%2C1&filter_comparator=equals&filter_concat=and`,
        expect.anything()
      );
    });
    
    it('should handle filter_include_nulls parameter', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          project_id: 1,
          title: 'Task with empty due date',
          done: false,
          due_date: ''
        }
      ];
      
      const params = {
        filter_by: 'due_date',
        filter_value: '',
        filter_include_nulls: true
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockTasks),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getAllTasks(params);
      
      // Verify the result
      expect(result).toEqual(mockTasks);
      
      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/all?filter_by=due_date&filter_value=&filter_include_nulls=true`,
        expect.anything()
      );
    });
  });
  
  describe('getTaskAssignees', () => {
    it('should fetch all assignees for a task', async () => {
      const taskId = 123;
      const mockAssignees = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com'
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com'
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockAssignees),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getTaskAssignees(taskId);
      
      // Verify the result
      expect(result).toEqual(mockAssignees);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/assignees`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
    
    it('should fetch assignees with pagination and search params', async () => {
      const taskId = 123;
      const params = {
        page: 2,
        per_page: 10,
        s: 'john'
      };
      const mockAssignees = [
        {
          id: 1,
          username: 'john_doe',
          email: 'john@example.com'
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockAssignees),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getTaskAssignees(taskId, params);
      
      // Verify the result
      expect(result).toEqual(mockAssignees);
      
      // Verify that fetch was called with the correct arguments including query params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/assignees?page=2&per_page=10&s=john`,
        expect.anything()
      );
    });
  });
  
  describe('assignUserToTask', () => {
    it('should assign a user to a task', async () => {
      const taskId = 123;
      const userId = 456;
      const mockAssignment: TaskAssignment = {
        task_id: taskId,
        user_id: userId
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(mockAssignment),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.assignUserToTask(taskId, userId);
      
      // Verify the result
      expect(result).toEqual(mockAssignment);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/assignees`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ user_id: userId })
        })
      );
    });
  });
  
  describe('bulkAssignUsersToTask', () => {
    it('should assign multiple users to a task', async () => {
      const taskId = 123;
      const bulkAssignees: BulkAssignees = {
        user_ids: [1, 2, 3]
      };
      const mockAssignment: TaskAssignment = {
        task_id: taskId,
        user_id: 0  // This might be different in the actual API
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(mockAssignment),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.bulkAssignUsersToTask(taskId, bulkAssignees);
      
      // Verify the result
      expect(result).toEqual(mockAssignment);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/assignees/bulk`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(bulkAssignees)
        })
      );
    });
  });
  
  describe('removeUserFromTask', () => {
    it('should remove a user assignment from a task', async () => {
      const taskId = 123;
      const userId = 456;
      const mockMessage: Message = {
        message: 'User successfully removed from task'
      };
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.removeUserFromTask(taskId, userId);
      
      // Verify the result
      expect(result).toEqual(mockMessage);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/assignees/${userId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });
  
  describe('getTaskComments', () => {
    it('should fetch all comments for a task', async () => {
      const taskId = 123;
      const mockComments: TaskComment[] = [
        {
          id: 1,
          task_id: taskId,
          comment: 'First comment',
          created: '2023-01-01T12:00:00Z',
          created_by: {
            id: 1,
            username: 'user1'
          }
        },
        {
          id: 2,
          task_id: taskId,
          comment: 'Second comment',
          created: '2023-01-02T12:00:00Z',
          created_by: {
            id: 2,
            username: 'user2'
          }
        }
      ];
      
      // Mock the fetch response
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockComments),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.getTaskComments(taskId);
      
      // Verify the result
      expect(result).toEqual(mockComments);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/comments`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });
  
  describe('createTaskComment', () => {
    it('should create a new comment on a task', async () => {
      const taskId = 123;
      const comment: TaskComment = {
        task_id: taskId,
        comment: 'This is a new comment'
      };
      
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue({ ...comment, id: 1 }),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.createTaskComment(taskId, comment);
      
      // Verify the result
      expect(result).toEqual({ ...comment, id: 1 });
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/comments`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(comment)
        })
      );
    });
  });
  
  describe('updateTaskLabels', () => {
    it('should update all labels on a task', async () => {
      const taskId = 123;
      const labelsBulk: LabelTaskBulk = {
        label_ids: [1, 2, 3]
      };
      
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(labelsBulk),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.updateTaskLabels(taskId, labelsBulk);
      
      // Verify the result
      expect(result).toEqual(labelsBulk);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/labels/bulk`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(labelsBulk)
        })
      );
    });
  });
  
  describe('createTaskRelation', () => {
    it('should create a new relation between tasks', async () => {
      const taskId = 123;
      const relation: TaskRelation = {
        task_id: taskId,
        other_task_id: 456,
        relation_kind: RelationKind.SUBTASK
      };
      
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: jest.fn().mockResolvedValue(relation),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.createTaskRelation(taskId, relation);
      
      // Verify the result
      expect(result).toEqual(relation);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/relations`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(relation)
        })
      );
    });
  });
  
  describe('deleteTaskRelation', () => {
    it('should delete a relation between tasks', async () => {
      const taskId = 123;
      const otherTaskId = 456;
      const relationKind = RelationKind.SUBTASK;
      const mockMessage: Message = {
        message: 'Relation successfully deleted'
      };
      
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockMessage),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await taskService.deleteTaskRelation(taskId, relationKind, otherTaskId);
      
      // Verify the result
      expect(result).toEqual(mockMessage);
      
      // Verify that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tasks/${taskId}/relations/${relationKind}/${otherTaskId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });
  
  describe('Error handling', () => {
    it('should handle API errors properly', async () => {
      const taskId = 123;
      const errorResponse = {
        code: 404,
        message: 'Task not found'
      };
      
      // Mock the fetch response with an error
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue(errorResponse),
        headers: new Headers({
          'content-type': 'application/json',
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method and expect it to throw
      try {
        await taskService.getTaskComments(taskId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe(errorResponse.message);
        expect((error as VikunjaError).code).toBe(errorResponse.code);
        expect((error as VikunjaError).status).toBe(404);
      }
    });
    
    it('should handle network errors', async () => {
      const taskId = 123;
      const networkError = new Error('Network error');
      
      // Mock fetch to throw a network error
      (global.fetch as jest.Mock).mockRejectedValue(networkError);
      
      // Call the method and expect it to throw
      try {
        await taskService.getTaskComments(taskId);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(VikunjaError);
        expect((error as VikunjaError).message).toBe('Network error');
        expect((error as VikunjaError).code).toBe(0);
        expect((error as VikunjaError).status).toBe(0);
      }
    });
  });
  
  describe('Task Attachment Operations', () => {
    describe('getTaskAttachments', () => {
      it('should fetch all attachments for a task', async () => {
        const taskId = 123;
        const mockAttachments: TaskAttachment[] = [
          {
            id: 1,
            task_id: taskId,
            file_name: 'document.pdf',
            file_size: 12345,
            created_by: {
              id: 1,
              username: 'user1'
            },
            created: '2025-05-05T10:00:00Z'
          },
          {
            id: 2,
            task_id: taskId,
            file_name: 'image.jpg',
            file_size: 5678,
            created_by: {
              id: 2,
              username: 'user2'
            },
            created: '2025-05-05T11:00:00Z'
          }
        ];
        
        // Mock the fetch response
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: jest.fn().mockResolvedValue(mockAttachments),
          headers: new Headers({
            'content-type': 'application/json',
          })
        };
        
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
        
        // Call the method
        const result = await taskService.getTaskAttachments(taskId);
        
        // Verify the result
        expect(result).toEqual(mockAttachments);
        
        // Verify that fetch was called with the correct arguments
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          `${baseUrl}/tasks/${taskId}/attachments`,
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`,
              'Content-Type': 'application/json'
            })
          })
        );
      });
      
      it('should fetch attachments with pagination', async () => {
        const taskId = 123;
        const params = {
          page: 2,
          per_page: 10
        };
        const mockAttachments: TaskAttachment[] = [
          {
            id: 3,
            task_id: taskId,
            file_name: 'document3.pdf',
            file_size: 12345,
            created_by: {
              id: 1,
              username: 'user1'
            },
            created: '2025-05-05T12:00:00Z'
          }
        ];
        
        // Mock the fetch response
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: jest.fn().mockResolvedValue(mockAttachments),
          headers: new Headers({
            'content-type': 'application/json',
          })
        };
        
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
        
        // Call the method
        const result = await taskService.getTaskAttachments(taskId, params);
        
        // Verify the result
        expect(result).toEqual(mockAttachments);
        
        // Verify that fetch was called with the correct arguments including query params
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          `${baseUrl}/tasks/${taskId}/attachments?page=2&per_page=10`,
          expect.anything()
        );
      });
    });
    
    describe('uploadTaskAttachment', () => {
      it('should upload a file as an attachment to a task', async () => {
        const taskId = 123;
        
        // Create a mock FormData with file
        const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const formData = new FormData();
        formData.append('files', mockFile);
        
        const successMessage: Message = {
          message: 'File successfully uploaded'
        };
        
        // Mock the fetch response
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: jest.fn().mockResolvedValue(successMessage),
          headers: new Headers({
            'content-type': 'application/json',
          })
        };
        
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
        
        // Call the method
        const result = await taskService.uploadTaskAttachment(taskId, formData);
        
        // Verify the result
        expect(result).toEqual(successMessage);
        
        // Verify that fetch was called with the correct arguments
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          `${baseUrl}/tasks/${taskId}/attachments`,
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`
              // Note: Content-Type header should be omitted to let the browser set it with the boundary
            }),
            body: formData
          })
        );
      });
    });
    
    describe('getTaskAttachment', () => {
      it('should get a specific task attachment', async () => {
        const taskId = 123;
        const attachmentId = 456;
        
        // Mock blob for the file content
        const mockBlob = new Blob(['test file content'], { type: 'application/pdf' });
        
        // Mock the fetch response
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          blob: jest.fn().mockResolvedValue(mockBlob),
          headers: new Headers({
            'content-type': 'application/pdf',
            'content-disposition': 'attachment; filename="document.pdf"'
          })
        };
        
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
        
        // Call the method
        const result = await taskService.getTaskAttachment(taskId, attachmentId);
        
        // Verify the result
        expect(result).toEqual(mockBlob);
        
        // Verify that fetch was called with the correct arguments
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          `${baseUrl}/tasks/${taskId}/attachments/${attachmentId}`,
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`
            })
          })
        );
      });
    });
    
    describe('deleteTaskAttachment', () => {
      it('should delete a task attachment', async () => {
        const taskId = 123;
        const attachmentId = 456;
        const successMessage: Message = {
          message: 'Attachment successfully deleted'
        };
        
        // Mock the fetch response
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: jest.fn().mockResolvedValue(successMessage),
          headers: new Headers({
            'content-type': 'application/json',
          })
        };
        
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
        
        // Call the method
        const result = await taskService.deleteTaskAttachment(taskId, attachmentId);
        
        // Verify the result
        expect(result).toEqual(successMessage);
        
        // Verify that fetch was called with the correct arguments
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          `${baseUrl}/tasks/${taskId}/attachments/${attachmentId}`,
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`,
              'Content-Type': 'application/json'
            })
          })
        );
      });
    });
  });
});
