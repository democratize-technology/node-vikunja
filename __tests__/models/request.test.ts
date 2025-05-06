/**
 * Tests for request parameter interfaces
 */
import {
  ProjectListParams,
  NotificationListParams,
  TeamListParams,
  TokenListParams,
  UserSearchParams,
  LabelListParams
} from '../../src/models/request';

describe('Request Parameter Interfaces', () => {
  describe('LabelListParams', () => {
    it('should allow pagination and search parameters', () => {
      const params: LabelListParams = {
        page: 1,
        per_page: 10,
        s: 'test'
      };
      
      expect(params.page).toBe(1);
      expect(params.per_page).toBe(10);
      expect(params.s).toBe('test');
    });
    
    it('should allow partial parameters', () => {
      const params: LabelListParams = {
        page: 2
      };
      
      expect(params.page).toBe(2);
      expect(params.per_page).toBeUndefined();
      expect(params.s).toBeUndefined();
    });
  });
  
  describe('ProjectListParams', () => {
    it('should allow archive filtering', () => {
      const params: ProjectListParams = {
        page: 1,
        per_page: 10,
        s: 'test',
        is_archived: true
      };
      
      expect(params.page).toBe(1);
      expect(params.per_page).toBe(10);
      expect(params.s).toBe('test');
      expect(params.is_archived).toBe(true);
    });
    
    it('should allow partial parameters', () => {
      const params: ProjectListParams = {
        is_archived: false
      };
      
      expect(params.is_archived).toBe(false);
      expect(params.page).toBeUndefined();
      expect(params.per_page).toBeUndefined();
      expect(params.s).toBeUndefined();
    });
  });
  
  describe('NotificationListParams', () => {
    it('should allow pagination parameters', () => {
      const params: NotificationListParams = {
        page: 1,
        per_page: 10
      };
      
      expect(params.page).toBe(1);
      expect(params.per_page).toBe(10);
    });
    
    it('should allow partial parameters', () => {
      const params: NotificationListParams = {
        per_page: 50
      };
      
      expect(params.per_page).toBe(50);
      expect(params.page).toBeUndefined();
    });
  });
  
  describe('TeamListParams', () => {
    it('should allow pagination and search parameters', () => {
      const params: TeamListParams = {
        page: 1,
        per_page: 10,
        s: 'test'
      };
      
      expect(params.page).toBe(1);
      expect(params.per_page).toBe(10);
      expect(params.s).toBe('test');
    });
  });
  
  describe('TokenListParams', () => {
    it('should allow pagination and search parameters', () => {
      const params: TokenListParams = {
        page: 1,
        per_page: 10,
        s: 'test'
      };
      
      expect(params.page).toBe(1);
      expect(params.per_page).toBe(10);
      expect(params.s).toBe('test');
    });
  });
  
  describe('UserSearchParams', () => {
    it('should allow search parameters', () => {
      const params: UserSearchParams = {
        s: 'test'
      };
      
      expect(params.s).toBe('test');
    });
  });
});
