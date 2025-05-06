/**
 * Tests for request utility functions
 */
import { convertParams, buildQueryString } from '../../src/core/request';
import { RequestParams } from '../../src/core/types';

describe('Request Utilities', () => {
  describe('convertParams', () => {
    it('should return undefined for undefined params', () => {
      expect(convertParams(undefined)).toBeUndefined();
    });
    
    it('should convert object to RequestParams type', () => {
      const params = {
        page: 1,
        per_page: 10,
        s: 'test'
      };
      
      const result = convertParams(params);
      expect(result).toEqual(params);
      expect(result).toBe(params); // Reference equality - no cloning
    });
    
    it('should handle empty object', () => {
      const params = {};
      const result = convertParams(params);
      expect(result).toEqual({});
      expect(result).toBe(params);
    });
    
    it('should handle complex nested objects by passing them through', () => {
      const params = {
        filter: { status: 'active' },
        sort: ['name', 'date']
      };
      
      const result = convertParams(params) as unknown as typeof params;
      expect(result).toEqual(params);
      expect(result.filter).toBe(params.filter);
      expect(result.sort).toBe(params.sort);
    });
  });
  
  describe('buildQueryString', () => {
    it('should return empty string for undefined params', () => {
      expect(buildQueryString(undefined)).toBe('');
    });
    
    it('should return empty string for empty params', () => {
      expect(buildQueryString({})).toBe('');
    });
    
    it('should build query string with single parameter', () => {
      const params: RequestParams = {
        page: 1
      };
      
      expect(buildQueryString(params)).toBe('?page=1');
    });
    
    it('should build query string with multiple parameters', () => {
      const params: RequestParams = {
        page: 1,
        per_page: 10,
        s: 'test'
      };
      
      // Check that it contains all parameters - order may vary
      const result = buildQueryString(params);
      expect(result).toContain('?');
      expect(result).toContain('page=1');
      expect(result).toContain('per_page=10');
      expect(result).toContain('s=test');
      expect(result).toMatch(/^\?.*&.*&.*$/); // Contains two ampersands
    });
    
    it('should skip undefined parameters', () => {
      const params: RequestParams = {
        page: 1,
        per_page: undefined,
        s: 'test'
      };
      
      const result = buildQueryString(params);
      expect(result).toContain('page=1');
      expect(result).toContain('s=test');
      expect(result).not.toContain('per_page');
      expect(result).toMatch(/^\?.*&.*$/); // Contains one ampersand
    });
    
    it('should handle boolean parameters', () => {
      const params: RequestParams = {
        is_active: true,
        is_archived: false
      };
      
      const result = buildQueryString(params);
      expect(result).toContain('is_active=true');
      expect(result).toContain('is_archived=false');
    });
    
    it('should handle special characters in parameters', () => {
      const params: RequestParams = {
        s: 'test & search'
      };
      
      const result = buildQueryString(params);
      // The space and ampersand should be properly encoded
      expect(result).toBe('?s=test+%26+search');
    });
    
    it('should handle numeric values of 0', () => {
      const params: RequestParams = {
        value: 0
      };
      
      const result = buildQueryString(params);
      expect(result).toBe('?value=0');
    });
    
    it('should handle empty string values', () => {
      const params: RequestParams = {
        s: ''
      };
      
      const result = buildQueryString(params);
      expect(result).toBe('?s=');
    });
  });
});
