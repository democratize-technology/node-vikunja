# Node-Vikunja

A comprehensive TypeScript wrapper for the Vikunja API, compatible with both Node.js and Deno environments.

## Features

- Complete TypeScript definitions for the Vikunja API
- Support for both Node.js and Deno environments
- Modern ES Modules and CommonJS support
- Comprehensive implementation of all Vikunja API endpoints
- Type-safe, intuitive interface with full IntelliSense support
- Extensive test coverage

## Installation

```bash
npm install node-vikunja
```

## Usage

### Authentication

```typescript
import { VikunjaClient } from 'node-vikunja';

// Initialize the client
const client = new VikunjaClient('https://your-vikunja-instance.com/api/v1');

// Login with username and password
const authToken = await client.login('username', 'password');
console.log(`Token: ${authToken.token}, Expires: ${authToken.expires_at}`);

// Or initialize with an existing token
const client = new VikunjaClient('https://your-vikunja-instance.com/api/v1', 'your-token');
```

### Projects

```typescript
// Get all projects
const projects = await client.projects.getProjects();
console.log(projects);

// Create a new project
const newProject = await client.projects.createProject({
  title: 'My new project',
  description: 'Project description'
});

// Get a specific project
const project = await client.projects.getProject(projectId);
```

### Tasks

```typescript
// Get all tasks in a project
const tasks = await client.tasks.getProjectTasks(projectId);

// Create a new task
const newTask = await client.tasks.createTask(projectId, {
  title: 'My new task',
  description: 'Task description',
  due_date: '2025-12-31T23:59:59Z',
});

// Update a task
await client.tasks.updateTask(taskId, {
  done: true
});
```

### Labels

```typescript
// Get all labels
const labels = await client.labels.getLabels();

// Add a label to a task
await client.tasks.addLabel(taskId, labelId);
```

### Teams

```typescript
// Get all teams
const teams = await client.teams.getTeams();

// Add a team to a project
await client.projects.addTeamToProject(projectId, {
  team_id: teamId,
  right: 2 // Read + write access
});
```

### Deno Usage

```typescript
import { VikunjaClient } from 'https://esm.sh/node-vikunja';

// Initialize the client
const client = new VikunjaClient('https://your-vikunja-instance.com/api/v1', 'your-token');

// Example: Get all projects
const projects = await client.projects.getProjects();
console.log(projects);
```

## API Reference

### Client

- `VikunjaClient` - Main client class that provides access to all services

### Available Services

- `client.auth` - Authentication and user management
- `client.avatar` - User avatar management
- `client.events` - Event logging and retrieval
- `client.filters` - List filter management
- `client.labels` - Label management
- `client.migration` - Data migration tools
- `client.notifications` - User notification management
- `client.projects` - Project management
- `client.shares` - Content sharing
- `client.subscriptions` - User subscriptions
- `client.system` - System information
- `client.tables` - Table view management
- `client.tasks` - Task management
- `client.teams` - Team management
- `client.tokens` - API token management
- `client.users` - User management

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Lint the code
npm run lint
```

## License

MIT - See [LICENSE](./LICENSE) for details.
