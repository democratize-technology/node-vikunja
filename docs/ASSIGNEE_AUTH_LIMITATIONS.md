# Assignee Authentication Limitations

## Overview

The Vikunja API has known authentication issues with certain endpoints, particularly those related to task assignees and labels. Even with valid authentication tokens, these operations may fail with 401 or 403 errors.

## Affected Endpoints

### Assignee Operations
- `PUT /tasks/{id}/assignees` - Assign a user to a task
- `POST /tasks/{id}/assignees/bulk` - Bulk assign users to a task  
- `DELETE /tasks/{id}/assignees/{userId}` - Remove a user from a task

### Label Operations
- `PUT /tasks/{id}/labels` - Add a label to a task
- `POST /tasks/{id}/labels/bulk` - Update all labels on a task
- `DELETE /tasks/{id}/labels/{labelId}` - Remove a label from a task

## Implemented Solution

The node-vikunja client library implements automatic retry logic for these endpoints:

1. **Initial Request**: Uses standard `Authorization: Bearer {token}` header
2. **First Retry**: On 401/403 error, retries with `X-API-Token: {token}` header
3. **Second Retry**: If still failing, retries with lowercase `authorization: Bearer {token}` header
4. **Final Error**: If all attempts fail, throws a specific error:
   - `AssigneeAuthenticationError` for assignee operations
   - `LabelAuthenticationError` for label operations

## Error Handling

When these authentication errors occur, the error message will indicate:
- The operation failed due to an authentication issue
- This may occur even with valid tokens
- The original error message from the API

Example:
```javascript
try {
  await client.tasks.assignUserToTask(taskId, userId);
} catch (error) {
  if (error.name === 'AssigneeAuthenticationError') {
    console.log('Known authentication issue with assignee operation');
    // Handle accordingly
  }
}
```

## Testing

To test assignee operations with a real Vikunja API:

```bash
# Build the library first
npm run build

# Run the test script with your API token
VIKUNJA_API_TOKEN=your_token node test-assignee-auth.js

# Optionally specify a different API URL
VIKUNJA_API_URL=https://your-instance.com/api/v1 VIKUNJA_API_TOKEN=your_token node test-assignee-auth.js
```

## Recommendations

1. **Error Handling**: Always implement proper error handling for assignee and label operations
2. **User Feedback**: Inform users that authentication errors may occur intermittently
3. **Retry Strategy**: The library handles retries automatically, but you may want to implement application-level retries for critical operations
4. **Monitoring**: Log these specific authentication errors separately for monitoring purposes

## API Status

This is a known issue with the Vikunja API and may be resolved in future versions. The retry logic implemented in this library is a workaround to provide better reliability for production applications.