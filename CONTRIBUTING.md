# Contributing to Float.js

Thank you for your interest in contributing to Float.js. This document provides guidelines and instructions for contributing.

## Development Setup

Prerequisites:
- Node.js 18 or higher
- pnpm 8 or higher

```bash
git clone https://github.com/float-js/float.js.git
cd float.js
pnpm install
pnpm dev
```

## Project Structure

```
float.js/
├── packages/
│   ├── core/           # Main framework package
│   └── create-float/   # Project scaffolding CLI
├── examples/
│   └── basic/          # Example application
└── .github/
    └── workflows/      # CI/CD configuration
```

## Making Changes

1. Create a new branch from `main`
2. Make your changes
3. Write or update tests as needed
4. Ensure all tests pass: `pnpm test`
5. Build packages: `pnpm build`
6. Commit your changes using conventional commits

## Commit Convention

We follow the Conventional Commits specification:

```
type(scope): description

[optional body]
[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(router): add support for dynamic route parameters
fix(build): resolve TypeScript compilation error
docs(readme): update installation instructions
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure CI passes
4. Request review from maintainers
5. Address review feedback
6. Squash commits if requested

## Code Style

- Use TypeScript for all code
- Follow existing code style
- Run `pnpm lint` before committing
- Keep functions small and focused
- Write clear comments for complex logic

## Testing

Run the test suite:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

## Reporting Issues

When reporting issues, please include:
- Float.js version
- Node.js version
- Operating system
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Relevant code samples or logs

## Questions

For questions or discussions, use GitHub Discussions rather than opening issues.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
