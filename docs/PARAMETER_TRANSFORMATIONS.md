# API Parameter Transformations

This document describes how node-vikunja handles API parameter transformations to ensure compatibility with the Vikunja API.

## Overview

The Vikunja API expects specific parameter names and formats. This library automatically transforms parameters to match API expectations while maintaining backward compatibility.

## Filter Parameters

### Current API Format (Vikunja API v0.21+)

The API expects a single `filter` parameter with a filter query string:

```typescript
{
  filter: "done = false && priority > 5",
  filter_timezone: "America/New_York", 
  filter_include_nulls: true
}
```

### Legacy Format (Backward Compatibility)

For backward compatibility, the library still accepts the old parameter format and automatically transforms it:

```typescript
// Old format (automatically transformed)
{
  filter_by: "done",
  filter_value: "false",
  filter_comparator: "equals",
  filter_concat: "and"
}

// Transforms to:
{
  filter: "done equals false"
}
```

### Array Filters

Multiple filters can be specified using arrays:

```typescript
// Array format
{
  filter_by: ["done", "priority"],
  filter_value: ["false", "5"],
  filter_comparator: "greater",
  filter_concat: "or"
}

// Transforms to:
{
  filter: "done greater false or priority greater 5"
}
```

## Pagination Parameters

### Standard Endpoints

Most endpoints use standard pagination parameters:

```typescript
{
  page: 1,        // Page number (1-based)
  per_page: 50    // Items per page
}
```

### Unsplash Background Search

The Unsplash background search endpoint uses different parameter names:

```typescript
// Input (using standard names)
{
  page: 2,
  s: "mountains"
}

// Automatically transformed for /backgrounds/unsplash/search to:
{
  p: 2,           // 'page' becomes 'p'
  s: "mountains"
}
```

## Search Parameters

Search functionality uses the `s` parameter across all endpoints:

```typescript
{
  s: "search term"
}
```

## Sort Parameters

Sorting supports multiple fields and order directions:

```typescript
{
  sort_by: ["priority", "due_date"],  // Can be string or array
  order_by: "desc"                    // Applied to all sort fields
}
```

## Parameter Validation

The library includes parameter validation to catch common errors:

### Required Parameters

Some endpoints require specific parameters. The library validates these before making API calls:

```typescript
// Example: Creating a task requires certain fields
try {
  await client.tasks.createTask(projectId, { 
    // title is required but missing
  });
} catch (error) {
  // Error: Missing required parameters for /projects/{id}/tasks: title
}
```

### Clear Error Messages

When parameters are invalid, the library provides clear error messages:

```typescript
// Invalid filter syntax
{
  filter: "invalid syntax"
}
// Error: Invalid filter syntax
```

## Migration Guide

### From Legacy Filter Parameters

If you're using the old filter parameter format, you have two options:

1. **Continue using legacy format** - The library will automatically transform them
2. **Migrate to new format** - Recommended for better performance and clarity

```typescript
// Old way (still works)
const tasks = await client.tasks.getAllTasks({
  filter_by: "done",
  filter_value: "false",
  filter_comparator: "equals"
});

// New way (recommended)
const tasks = await client.tasks.getAllTasks({
  filter: "done = false"
});
```

### Filter Query Syntax

The filter parameter supports a rich query syntax. See the [Vikunja Filter Documentation](https://vikunja.io/docs/filters) for full details.

Common examples:
- `done = false` - Incomplete tasks
- `priority >= 5` - High priority tasks  
- `due_date < now` - Overdue tasks
- `assignees.username = 'john'` - Tasks assigned to John
- `labels.title in ['bug', 'feature']` - Tasks with specific labels

## Version Compatibility

### v0.21+ (Current)
- Uses `filter` parameter for filtering
- Full support for filter query syntax
- Maintains backward compatibility with legacy parameters

### Pre-v0.21 (Legacy)
- Used `filter_by`, `filter_value`, `filter_comparator`
- Limited filtering capabilities
- Still supported through automatic transformation

## TypeScript Support

The library provides full TypeScript support with proper types:

```typescript
import { FilterParams, LegacyFilterParams } from 'node-vikunja';

// Modern filter parameters
const modernParams: FilterParams = {
  filter: "done = false",
  filter_timezone: "UTC",
  filter_include_nulls: false
};

// Legacy parameters (deprecated but supported)
const legacyParams: LegacyFilterParams = {
  filter_by: "done",
  filter_value: "false",
  filter_comparator: "equals"
};
```

## Best Practices

1. **Use modern filter syntax** - More powerful and aligned with API
2. **Validate parameters client-side** - Catch errors early
3. **Handle pagination properly** - Check response headers for total count
4. **Use TypeScript** - Leverage type safety for parameters
5. **Check API version** - Ensure compatibility with your Vikunja instance