# Contributing to node-vikunja

Thank you for considering contributing to node-vikunja! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers understand your report, reproduce the behavior, and find related reports.

- Use a clear and descriptive title for the issue
- Describe the exact steps to reproduce the problem
- Provide specific examples, like code snippets or configuration files
- Describe the behavior you observed and what you expected to see
- Include version information (Node.js version, library version, etc.)
- Explain which behavior you expected to see instead and why
- Include screenshots or terminal output if applicable

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

- Use a clear and descriptive title for the issue
- Provide a step-by-step description of the suggested enhancement
- Describe the current behavior and how your suggestion would change it
- Explain why this enhancement would be useful
- Include code examples or mock-ups if applicable

### Pull Requests

- Fill in the required template
- Follow the TypeScript styleguide
- Include tests for the changes you've made
- Update documentation if needed
- Link to any related issues or discussions

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/node-vikunja.git`
3. Install dependencies: `npm install`
4. Make your changes
5. Run tests: `npm test`
6. Build the project: `npm run build`

## Project Structure

- `src/`: Source code
  - `core/`: Core functionality and base classes
  - `models/`: TypeScript interfaces and types
  - `services/`: API service implementations
- `__tests__/`: Test files

## Testing

All code changes should be accompanied by tests. Run tests with:

```bash
npm test
```

For test coverage:

```bash
npm test -- --coverage
```

## Building

To build the project:

```bash
npm run build
```

This will output both CommonJS and ES Modules to the `dist/` directory.

## Coding Guidelines

- Use TypeScript
- Follow ESLint and Prettier rules (run `npm run lint` and `npm run format`)
- Document your code with JSDoc comments
- Keep functions small and focused on a single responsibility
- Write unit tests for all functionality

## Git Workflow

1. Create a new branch from `main` with a descriptive name
2. Make your changes in small, logical commits
3. Push your branch and create a pull request
4. Address any review comments

## Versioning

This project follows [Semantic Versioning](https://semver.org/).

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
