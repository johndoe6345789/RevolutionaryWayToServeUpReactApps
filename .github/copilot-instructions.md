# Project Overview

This repository contains **RevolutionaryCodegen** - a revolutionary code generation system that creates complete, well-structured projects from JSON specifications. The project is a monorepo with multiple applications:

1. **codegen** - A powerful TypeScript/Bun-based code generation platform with plugin architecture
2. **retro-react-app** - A Next.js React application with retro styling
3. **docs-viewer** - A Next.js documentation viewer with Material UI
4. **e2e** - End-to-end tests using Playwright

## Key Features

- **Plugin-based Architecture**: Extensible system with custom plugins for different code generation needs
- **Type-Safe**: Built with TypeScript for type safety and better developer experience
- **Fast**: Uses Bun runtime for rapid execution
- **Modular**: Clean separation of concerns with aggregator pattern
- **Innovation Features**: Achievement system, easter eggs, progress animations, and gamification
- **Pattern Enforcement**: Two-method classes (initialize/execute), dataclass constructors, base class inheritance

# Technology Stack

## Runtime & Build Tools
- **Bun 1.3.4+** - Primary runtime for TypeScript execution and package management
- **Node.js >=20.0.0** - Alternative runtime support
- **TypeScript 5.x** - Strict type checking enabled across all projects

## Frontend Technologies
- **Next.js 16.1.1** - React framework for server-side rendering (retro-react-app, docs-viewer)
- **React 19.2.3** - Latest React with concurrent features
- **Material UI 7.x** - Component library for UI (@mui/material, @mui/icons-material)
- **Emotion** - CSS-in-JS styling (@emotion/react, @emotion/styled)
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **next-intl** - Internationalization support
- **next-themes** - Theme switching support

## Testing Frameworks
- **Vitest 4.x** - Unit testing framework (codegen, retro-react-app)
- **Playwright** - End-to-end browser testing (e2e tests)
- **Testing Library** - React component testing (@testing-library/react, @testing-library/jest-dom)

## Code Quality Tools
- **ESLint 9.x** - Linting with TypeScript support (@typescript-eslint)
- **Prettier 3.x** - Code formatting
- **TypeScript Compiler** - Type checking with strict mode

# Coding Guidelines

## TypeScript Standards
- **Strict Mode**: All TypeScript projects use strict type checking (noImplicitAny, strictNullChecks, etc.)
- **No Implicit Any**: Always provide explicit types
- **Strict Null Checks**: Handle null/undefined explicitly
- **No Unused Variables**: Remove unused locals and parameters
- **Explicit Return Types**: Functions should have explicit return types for complex logic

## Code Organization
- **Single Responsibility**: Each file should have a single, clear purpose
- **Object-Oriented Design**: Proper use of classes, inheritance, and interfaces
- **Plugin System**: Extend functionality through plugins rather than modifying core code
- **Dependency Injection**: Use DI pattern for testability

## Naming Conventions
- **Files**: kebab-case for filenames (e.g., `user-service.ts`, `doc-navigation.tsx`)
- **Classes**: PascalCase (e.g., `UserService`, `LifecycleBuilder`)
- **Functions/Variables**: camelCase (e.g., `initialize`, `executeOperation`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `MAX_CLASS_SIZE`)
- **Interfaces/Types**: PascalCase with descriptive names (e.g., `DocSection`, `CommandSpec`)

## Pattern Enforcement (Codegen Project)
- **Two-Method Classes**: Business logic classes should follow initialize/execute pattern
- **Dataclass Constructor**: Single parameter with property assignment
- **Base Class Inheritance**: All classes should extend appropriate base classes
- **Size Limits**: Enforce maximum class and method sizes
- **Factory Pattern**: Use dependency injection and factory pattern for object creation

## React/Next.js Conventions
- **Functional Components**: Prefer functional components over class components
- **Hooks**: Use React hooks for state and side effects
- **Server Components**: Leverage Next.js server components where appropriate
- **Client Components**: Mark client-only components with 'use client'
- **TypeScript Props**: Always type component props explicitly

## Testing Practices
- **Test Coverage**: Aim for meaningful test coverage, especially for business logic
- **Unit Tests**: Use Vitest for unit testing with `.test.ts` or `.spec.ts` extensions
- **E2E Tests**: Use Playwright for end-to-end testing with `.spec.ts` extension
- **Test Organization**: Keep tests alongside source files or in dedicated test directories
- **Mock Data**: Use appropriate mocking strategies for external dependencies

## Documentation
- **JSDoc Comments**: Use for public APIs and complex functions
- **README Files**: Each subproject should have its own README
- **Type Documentation**: Let TypeScript types serve as documentation where possible
- **Markdown Docs**: Store documentation in markdown format in docs-viewer/public/docs

# Directory Structure

```
RevolutionaryWayToServeUpReactApps/
├── .github/                    # GitHub configuration, workflows, and Copilot instructions
│   ├── workflows/              # CI/CD workflows (ci.yml, docker-publish.yml, release-zip.yml)
│   ├── dependabot.yml          # Dependency update configuration
│   └── README.md               # GitHub config documentation
├── agents/                     # Agent system documentation
│   ├── agents-details/         # Detailed architecture documentation
│   ├── AGENTS.md               # Agent overview
│   └── README.md               # Agent docs guide
├── codegen/                    # TypeScript/Bun code generation platform
│   ├── src/
│   │   ├── core/               # Core components and interfaces
│   │   ├── aggregators/        # Aggregation logic
│   │   ├── plugins/            # Plugin implementations
│   │   ├── entrypoints/        # CLI entry points
│   │   ├── specs/              # Specification definitions
│   │   └── cli/                # CLI-related code
│   ├── scripts/                # Build and utility scripts
│   ├── generated/              # Generated code output (gitignored)
│   └── dist/                   # Built distribution files (gitignored)
├── retro-react-app/            # Next.js React application
│   ├── src/
│   │   ├── app/                # Next.js app router pages
│   │   └── components/         # React components
│   └── public/                 # Static assets
├── docs-viewer/                # Next.js documentation viewer
│   ├── src/
│   │   ├── app/                # Next.js app router
│   │   ├── components/         # UI components (navigation, markdown viewer)
│   │   ├── lib/                # Documentation catalog and helpers
│   │   └── types/              # TypeScript type definitions
│   ├── public/docs/            # Markdown documentation files
│   └── scripts/                # Utility scripts
├── e2e/                        # Playwright end-to-end tests
│   └── tests/                  # Test specifications
└── scripts/                    # Root-level utility scripts
```

# Build, Test, and Lint Commands

## Root Level
```bash
bun run lint.ts              # Run comprehensive linting across all projects
```

## Codegen Project
```bash
cd codegen
npm install                  # Install dependencies
npm run lint                 # Run linting
npm run lint:fix             # Fix linting issues automatically
npm run type-check           # Run TypeScript type checking
npm run build                # Build the project (runs lint first)
npm test                     # Run unit tests with Vitest
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Generate test coverage report
npm run format               # Format code with Prettier
npm run format:check         # Check code formatting
bun run codegen.js           # Run the code generator
```

## Retro React App
```bash
cd retro-react-app
npm install                  # Install dependencies
npm run dev                  # Start development server (port 3000)
npm run build                # Build for production
npm start                    # Start production server
bunx eslint                  # Run linting
npm test                     # Run Vitest tests
npm run test:ui              # Run tests with UI
npm run test:run             # Run tests once
npm run test:coverage        # Generate test coverage
```

## Docs Viewer
```bash
cd docs-viewer
npm install                  # Install dependencies
npm run dev                  # Start development server (port 3000)
npm run build                # Build for production (runs lint first)
npm start                    # Start production server
npm run lint                 # Run linting
npm run lint:fix             # Fix linting issues
npm run type-check           # Run TypeScript type checking
```

## E2E Tests
```bash
cd e2e
bun install                  # Install dependencies
bun x playwright install     # Install Playwright browsers
bun run test                 # Run Playwright tests
```

# Development Workflow

## Making Changes
1. Create a feature branch from `main`
2. Make focused, minimal changes to accomplish the task
3. Run linters and type checking in affected projects
4. Run relevant tests to ensure nothing breaks
5. Follow the existing code style and patterns
6. Update documentation if needed
7. Create a pull request targeting `main`

## CI/CD Pipeline
- **Lint Job**: Runs linting and format checking across all projects
- **Smoke Test Job**: Runs Playwright smoke tests to verify basic functionality
- All checks must pass before merging to `main`

## Code Review Expectations
- Changes should be minimal and surgical
- Preserve existing functionality unless explicitly changing it
- Add tests for new features or bug fixes
- Update documentation for API changes
- Follow TypeScript strict mode requirements

# Special Considerations

## Monorepo Structure
- Each subproject (`codegen`, `retro-react-app`, `docs-viewer`, `e2e`) has its own `package.json` and dependencies
- Install dependencies in each subproject independently
- CI workflows handle all subprojects

## Generated Files
- The `generated/` directory in codegen contains auto-generated code and is gitignored
- The `dist/` directory contains build output and is gitignored
- Do not manually edit generated files

## Innovation Philosophy
This project embraces a "revolutionary" philosophy that values:
1. **Convention over Configuration**: Sensible defaults
2. **Patterns over Code Duplication**: Reusable templates and generators
3. **Innovation over Features**: Delight users with achievements and easter eggs
4. **Automation over Manual Labor**: Generate boilerplate automatically
5. **Joy over Bureaucracy**: Make development fun and rewarding
6. **Extensibility over Rigidity**: Plugin architecture for customization
7. **Language Agnostic**: Design works with any programming language

## Security
- Never commit secrets or sensitive data
- Validate all user inputs
- Follow security best practices for web applications
- Use dependency scanning (Dependabot is configured)

# Additional Resources

- [Main README](../README.md) - Overall project documentation
- [Codegen README](../codegen/README.md) - Code generation system details
- [Docs Viewer README](../docs-viewer/README.md) - Documentation viewer architecture
- [GitHub Workflows](workflows/README.md) - CI/CD documentation
- [Agents Documentation](../agents/README.md) - Agent system background
