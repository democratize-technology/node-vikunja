/**
 * Tests for parameter transformation and validation
 */
import { transformParams, transformFilterParams, validateRequiredParams } from '../../src/core/params';

describe('Parameter Transformation', () => {
  describe('transformFilterParams', () => {
    it('should transform legacy filter parameters to filter string', () => {
      const params = {
        filter_by: 'done',
        filter_value: 'false',
        filter_comparator: 'equals',
      };
      
      const result = transformFilterParams(params);
      
      expect(result).toEqual({
        filter: 'done equals false',
      });
    });
    
    it('should handle array filter parameters', () => {
      const params = {
        filter_by: ['done', 'priority'],
        filter_value: ['false', '5'],
        filter_comparator: 'equals',
        filter_concat: 'and',
      };
      
      const result = transformFilterParams(params);
      
      expect(result).toEqual({
        filter: 'done equals false and priority equals 5',
      });
    });
    
    it('should use default comparator and concat values', () => {
      const params = {
        filter_by: ['done', 'priority'],
        filter_value: ['false', '5'],
      };
      
      const result = transformFilterParams(params);
      
      expect(result).toEqual({
        filter: 'done equals false and priority equals 5',
      });
    });
    
    it('should preserve existing filter parameter', () => {
      const params = {
        filter: 'done = false',
        filter_timezone: 'UTC',
      };
      
      const result = transformFilterParams(params);
      
      expect(result).toEqual({
        filter: 'done = false',
        filter_timezone: 'UTC',
      });
    });
    
    it('should handle empty parameters', () => {
      const result = transformFilterParams({});
      expect(result).toEqual({});
    });
  });
  
  describe('transformParams', () => {
    it('should transform standard parameters correctly', () => {
      const params = {
        page: 1,
        per_page: 20,
        s: 'test',
        sort_by: 'created',
        order_by: 'desc',
      };
      
      const result = transformParams(params);
      
      expect(result).toEqual({
        page: 1,
        per_page: 20,
        s: 'test',
        sort_by: 'created',
        order_by: 'desc',
      });
    });
    
    it('should transform filter parameters', () => {
      const params = {
        filter_by: 'done',
        filter_value: 'false',
        page: 1,
      };
      
      const result = transformParams(params);
      
      expect(result).toEqual({
        filter: 'done equals false',
        page: 1,
      });
    });
    
    it('should handle Unsplash endpoint pagination', () => {
      const params = {
        page: 2,
        s: 'mountains',
      };
      
      const result = transformParams(params, '/backgrounds/unsplash/search');
      
      expect(result).toEqual({
        p: 2,
        s: 'mountains',
      });
    });
    
    it('should not transform page for non-Unsplash endpoints', () => {
      const params = {
        page: 2,
        s: 'test',
      };
      
      const result = transformParams(params, '/tasks/all');
      
      expect(result).toEqual({
        page: 2,
        s: 'test',
      });
    });
    
    it('should return undefined for undefined params', () => {
      const result = transformParams(undefined);
      expect(result).toBeUndefined();
    });
  });
  
  describe('validateRequiredParams', () => {
    it('should pass when all required params are present', () => {
      const params = {
        title: 'Test',
        project_id: 1,
      };
      
      expect(() => {
        validateRequiredParams('/tasks', params, ['title', 'project_id']);
      }).not.toThrow();
    });
    
    it('should throw when required params are missing', () => {
      const params = {
        title: 'Test',
      };
      
      expect(() => {
        validateRequiredParams('/tasks', params, ['title', 'project_id']);
      }).toThrow('Missing required parameters for /tasks: project_id');
    });
    
    it('should throw for multiple missing params', () => {
      const params = {};
      
      expect(() => {
        validateRequiredParams('/tasks', params, ['title', 'project_id']);
      }).toThrow('Missing required parameters for /tasks: title, project_id');
    });
    
    it('should not throw when no params are required', () => {
      expect(() => {
        validateRequiredParams('/tasks', undefined, []);
      }).not.toThrow();
    });
  });
});