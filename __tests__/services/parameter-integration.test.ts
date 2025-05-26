/**
 * Integration tests for API parameter handling
 */
import { VikunjaClient } from '../../src/client';
import { LegacyFilterParams } from '../../src/models/common';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Headers constructor
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    private headers: Record<string, string> = {};
    
    constructor(init?: HeadersInit) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => {
            this.headers[key] = value;
          });
        } else if (init instanceof Headers) {
          Object.assign(this.headers, (init as any).headers);
        } else {
          Object.assign(this.headers, init);
        }
      }
    }
    
    get(key: string): string | null {
      return this.headers[key] || null;
    }
    
    set(key: string, value: string): void {
      this.headers[key] = value;
    }
  } as any;
}

describe('API Parameter Integration', () => {
  let client: VikunjaClient;
  
  beforeEach(() => {
    jest.clearAllMocks();
    client = new VikunjaClient('https://api.example.com', 'test-token');
    
    // Set up default mock response
    const mockHeaders = new Map();
    mockHeaders.set = jest.fn();
    mockHeaders.get = jest.fn((key: string) => {
      if (key === 'content-length') return '100';
      return null;
    });
    
    // Default mock for all fetch calls
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: mockHeaders,
      json: async () => [],
      text: async () => '',
      blob: async () => new Blob(),
    });
  });
  
  describe('Filter Parameter Transformation', () => {
    it('should transform legacy filter parameters to API filter string', async () => {
      
      // Use legacy filter parameters
      const params = {
        filter_by: 'done',
        filter_value: 'false',
        filter_comparator: 'equals',
        page: 1,
        per_page: 20,
      } as any; // Using 'any' to test backward compatibility
      
      await client.tasks.getAllTasks(params);
      
      // Check that the URL contains all expected parameters
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/tasks/all?');
      expect(url).toContain('filter=done+equals+false');
      expect(url).toContain('page=1');
      expect(url).toContain('per_page=20');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });
    
    it('should handle array filter parameters', async () => {
      
      const params = {
        filter_by: ['done', 'priority'],
        filter_value: ['false', '5'],
        filter_comparator: 'greater',
        filter_concat: 'or',
      } as any;
      
      await client.tasks.getAllTasks(params);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('filter=done+greater+false+or+priority+greater+5'),
        expect.any(Object)
      );
    });
    
    it('should pass through modern filter string unchanged', async () => {
      
      const params = {
        filter: 'done = false && priority > 5',
        filter_timezone: 'America/New_York',
        filter_include_nulls: true,
      };
      
      await client.tasks.getAllTasks(params);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('filter=done+%3D+false+%26%26+priority+%3E+5'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('filter_timezone=America%2FNew_York'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('filter_include_nulls=true'),
        expect.any(Object)
      );
    });
  });
  
  describe('Pagination Parameter Handling', () => {
    it('should use standard pagination for most endpoints', async () => {
      
      await client.tasks.getAllTasks({ page: 2, per_page: 50 });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/tasks/all?page=2&per_page=50',
        expect.any(Object)
      );
    });
    
    it('should transform page to p for Unsplash endpoints', async () => {
      
      await client.projects.searchBackgrounds('mountains', 2);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/backgrounds/unsplash/search?s=mountains&p=2',
        expect.any(Object)
      );
    });
  });
  
  describe('Search Parameter Handling', () => {
    it('should correctly pass search parameter', async () => {
      
      await client.tasks.getAllTasks({ s: 'important task' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/tasks/all?s=important+task',
        expect.any(Object)
      );
    });
  });
  
  describe('Sort Parameter Handling', () => {
    it('should correctly pass sort parameters', async () => {
      
      await client.tasks.getAllTasks({
        sort_by: ['priority', 'due_date'],
        order_by: 'desc',
      });
      
      // Check that array parameters are handled correctly
      const call = mockFetch.mock.calls[0][0] as string;
      expect(call).toContain('sort_by=priority');
      expect(call).toContain('sort_by=due_date');
      expect(call).toContain('order_by=desc');
    });
  });
  
  describe('Combined Parameter Handling', () => {
    it('should handle all parameter types together', async () => {
      
      await client.tasks.getAllTasks({
        page: 1,
        per_page: 30,
        s: 'test',
        sort_by: 'created',
        order_by: 'asc',
        filter: 'done = false',
        filter_timezone: 'UTC',
      });
      
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('page=1');
      expect(url).toContain('per_page=30');
      expect(url).toContain('s=test');
      expect(url).toContain('sort_by=created');
      expect(url).toContain('order_by=asc');
      expect(url).toContain('filter=done+%3D+false');
      expect(url).toContain('filter_timezone=UTC');
    });
  });
  
  describe('Error Messages', () => {
    it('should provide clear error for invalid parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Invalid filter syntax',
        }),
      });
      
      await expect(
        client.tasks.getAllTasks({ filter: 'invalid syntax' })
      ).rejects.toThrow('Invalid filter syntax');
    });
  });
});