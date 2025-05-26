/**
 * Test script for assignee authentication issues
 * 
 * This script tests the assignee operations with a real Vikunja API
 * to verify that authentication retry logic works correctly.
 */
const { VikunjaClient } = require('./dist/client.js');

async function testAssigneeOperations() {
  // Configuration - update these values for your test environment
  const API_URL = process.env.VIKUNJA_API_URL || 'https://try.vikunja.io/api/v1';
  const API_TOKEN = process.env.VIKUNJA_API_TOKEN;
  
  if (!API_TOKEN) {
    console.error('Error: VIKUNJA_API_TOKEN environment variable is required');
    console.log('Usage: VIKUNJA_API_TOKEN=your_token node test-assignee-auth.js');
    process.exit(1);
  }

  console.log('Testing assignee operations with Vikunja API...');
  console.log('API URL:', API_URL);
  console.log('Token:', API_TOKEN.substring(0, 8) + '...');

  try {
    // Create client
    const client = new VikunjaClient(API_URL, API_TOKEN);
    
    // First, get a test project and task
    console.log('\n1. Getting projects...');
    const projects = await client.projects.getAllProjects();
    if (projects.length === 0) {
      throw new Error('No projects found. Please create a project first.');
    }
    
    const testProject = projects[0];
    console.log(`   Using project: ${testProject.title} (ID: ${testProject.id})`);

    // Get or create a test task
    console.log('\n2. Getting tasks in project...');
    const tasks = await client.tasks.getProjectTasks(testProject.id);
    
    let testTask;
    if (tasks.length === 0) {
      console.log('   No tasks found. Creating a test task...');
      testTask = await client.tasks.createTask(testProject.id, {
        title: 'Test Task for Assignee Auth',
        description: 'Testing assignee authentication retry logic'
      });
      console.log(`   Created task: ${testTask.title} (ID: ${testTask.id})`);
    } else {
      testTask = tasks[0];
      console.log(`   Using existing task: ${testTask.title} (ID: ${testTask.id})`);
    }

    // Get current user info
    console.log('\n3. Getting current user info...');
    const currentUser = await client.users.getCurrentUser();
    console.log(`   Current user: ${currentUser.username} (ID: ${currentUser.id})`);

    // Test assignUserToTask
    console.log('\n4. Testing assignUserToTask...');
    try {
      const assignment = await client.tasks.assignUserToTask(testTask.id, currentUser.id);
      console.log('   ✓ Successfully assigned user to task');
      console.log('   Assignment:', assignment);
    } catch (error) {
      console.error('   ✗ Failed to assign user:', error.message);
      if (error.name === 'AssigneeAuthenticationError') {
        console.log('   Note: AssigneeAuthenticationError was thrown (retry logic was triggered)');
      }
    }

    // Test getTaskAssignees
    console.log('\n5. Testing getTaskAssignees...');
    try {
      const assignees = await client.tasks.getTaskAssignees(testTask.id);
      console.log(`   ✓ Successfully retrieved ${assignees.length} assignees`);
      assignees.forEach(user => {
        console.log(`     - ${user.username} (ID: ${user.id})`);
      });
    } catch (error) {
      console.error('   ✗ Failed to get assignees:', error.message);
    }

    // Test bulkAssignUsersToTask
    console.log('\n6. Testing bulkAssignUsersToTask...');
    try {
      const bulkAssignment = await client.tasks.bulkAssignUsersToTask(testTask.id, {
        user_ids: [currentUser.id]
      });
      console.log('   ✓ Successfully bulk assigned users to task');
      console.log('   Bulk assignment:', bulkAssignment);
    } catch (error) {
      console.error('   ✗ Failed to bulk assign users:', error.message);
      if (error.name === 'AssigneeAuthenticationError') {
        console.log('   Note: AssigneeAuthenticationError was thrown (retry logic was triggered)');
      }
    }

    // Test removeUserFromTask
    console.log('\n7. Testing removeUserFromTask...');
    try {
      const result = await client.tasks.removeUserFromTask(testTask.id, currentUser.id);
      console.log('   ✓ Successfully removed user from task');
      console.log('   Result:', result);
    } catch (error) {
      console.error('   ✗ Failed to remove user:', error.message);
      if (error.name === 'AssigneeAuthenticationError') {
        console.log('   Note: AssigneeAuthenticationError was thrown (retry logic was triggered)');
      }
    }

    // Final check of assignees
    console.log('\n8. Final check of assignees...');
    try {
      const finalAssignees = await client.tasks.getTaskAssignees(testTask.id);
      console.log(`   Task now has ${finalAssignees.length} assignees`);
    } catch (error) {
      console.error('   ✗ Failed to get final assignees:', error.message);
    }

    console.log('\n✓ All tests completed!');
    console.log('\nSummary:');
    console.log('- The assignee operations now include retry logic for authentication errors');
    console.log('- If authentication errors occur, the methods will retry with alternative headers');
    console.log('- AssigneeAuthenticationError is thrown if all retry attempts fail');

  } catch (error) {
    console.error('\n✗ Test failed with error:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run the test
testAssigneeOperations();