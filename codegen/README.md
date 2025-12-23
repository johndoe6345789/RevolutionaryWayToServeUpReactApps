# Revolutionary Codegen

A powerful code generation system built with TypeScript and Bun, designed to generate complete application structures, plugins, and tooling.

## Features

- **Plugin-based Architecture**: Extensible system with custom plugins for different code generation needs
- **Type-Safe**: Built with TypeScript for type safety and better developer experience
- **Fast**: Uses Bun runtime for rapid execution
- **Modular**: Clean separation of concerns with aggregator pattern

## Quick Start

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run tests
npm test

# Build the project
npm run build
```

## Architecture

The system follows AGENTS.md principles with:
- Single responsibility per file
- Object-oriented design with proper inheritance
- Plugin system for extensibility
- Dependency injection for testability

## Directory Structure

```
codegen/
├── src/
│   ├── core/           # Core components and interfaces
│   ├── aggregators/    # Aggregation logic
│   ├── plugins/        # Plugin implementations
│   └── entrypoints/    # CLI entry points
├── generated/          # Generated code output
└── dist/              # Built distribution files
```

## Development

See the main project README for detailed development instructions.
