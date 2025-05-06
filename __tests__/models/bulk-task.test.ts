/**
 * Tests for the BulkTask model
 */
import { BulkTask } from '../../src/models/task';

describe('BulkTask Model', () => {
  it('should have project_ids property', () => {
    const bulkTask: BulkTask = {
      title: 'Test Bulk Task',
      project_ids: [1, 2, 3],
      description: 'This is a test bulk task'
    };
    
    expect(bulkTask.project_ids).toEqual([1, 2, 3]);
    expect(bulkTask.title).toBe('Test Bulk Task');
    expect(bulkTask.description).toBe('This is a test bulk task');
  });
  
  it('should be assignable to a Task without project_ids', () => {
    const bulkTask: BulkTask = {
      id: 1,
      title: 'Test Bulk Task',
      project_ids: [1, 2, 3],
      description: 'This is a test bulk task'
    };
    
    // Extract all properties except project_ids
    const { project_ids, ...taskProps } = bulkTask;
    
    // taskProps should have all Task properties but not project_ids
    expect(taskProps).toHaveProperty('id');
    expect(taskProps).toHaveProperty('title');
    expect(taskProps).toHaveProperty('description');
    expect(taskProps).not.toHaveProperty('project_ids');
  });
});
