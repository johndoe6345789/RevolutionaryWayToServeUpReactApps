# Remaining Directories Documentation

## Test Tooling Directory (`test-tooling/`)

**Purpose**: Comprehensive testing infrastructure for the bootstrap system using Jest with Bun integration.

### Key Components
- **Jest Configuration** (`jest.config.cjs`): Test runner configuration with TypeScript support
- **Babel Configuration** (`babel.config.js`): React/TypeScript transpilation for testing
- **Bun Integration**: `bunfig.toml` and `bun.lock` for fast package management
- **TypeScript Config** (`tsconfig.json`): Type definitions for test environment

### Dependencies
- **Testing Library**: React component testing (@testing-library/react, @testing-library/jest-dom)
- **Material-UI**: Component library testing (@mui/material, @emotion/react)
- **TypeScript**: Type checking in tests (@types/jest, ts-jest)
- **JSDOM**: Browser environment simulation (jest-environment-jsdom)

### Test Scripts
```json
{
  "scripts": {
    "test": "node tests/linkSrcNodeModules.js && jest"
  }
}
```

### Features
- React component testing with Material-UI
- TypeScript test support
- JSDOM browser environment
- Bun package management integration
- Coverage reporting infrastructure

## CI Directory (`ci/`)

**Purpose**: Continuous Integration configuration and scripts.

### Structure
- **Package Configuration**: `package.json` with Bun workspaces
- **Lock File**: `bun.lock` for reproducible builds
- **Workspace Configuration**: Manages `test-tooling` and `e2e` packages

### Workspaces
```json
{
  "workspaces": ["../test-tooling", "../e2e"]
}
```

## Python Directory (`python/`)

**Purpose**: Python utilities and GitHub Actions local testing support.

### Components
- **Poetry Configuration**: `poetry.lock`, `pyproject.toml` for Python dependencies
- **GitHub Actions Local**: Local testing for GitHub Actions workflows

### Purpose
- Python script utilities
- Local CI/CD pipeline testing
- Development workflow automation

## Docs Directory (`docs/`)

**Purpose**: Documentation and compliance reports.

### Key Files
- **Interface Compliance Report**: Documents interface implementation status
- **Interface Implementation Guide**: Development guidelines for interfaces
- **Nested Aggregate Implementation**: Architecture documentation
- **OOP Principles Plugin**: Code quality analysis documentation
- **Workspace Tour**: Project structure overview

### Purpose
- Technical documentation
- Compliance tracking
- Architectural decision records
- Developer onboarding materials

## Coverage Directory (`coverage/`)

**Purpose**: Test coverage reports and analysis.

### Purpose
- Code coverage metrics storage
- Coverage report generation
- Quality assurance tracking
- CI/CD integration for coverage gates

## Server Directory (`server/`)

**Purpose**: Development server for the React application.

### Configuration
- **Package Manager**: npm (package-lock.json)
- **Server Implementation**: `server.js` - Express.js server
- **Build Configuration**: Standard Node.js server setup

### Purpose
- Local development server
- API endpoints for development
- Hot reloading support
- Proxy configuration for development

## String Directory (`string/`)

**Purpose**: String service implementation for internationalization.

### Components
- **String Service**: `string-service.js` - Core string management
- **String Cache**: `string-cache.js` - Performance optimization
- **String Factory**: `string-factory.js` - String service creation
- **String Validator**: `string-validator.js` - Input validation
- **Strings JSON**: `strings.json` - Localized string definitions
- **Service Feedback**: `string-service-feedback.js` - Error handling

### Features
- Internationalization support
- String caching for performance
- Validation and error handling
- Factory pattern implementation
- JSON-based string definitions

## Supporting Files

### Configuration Files
- **bunfig.toml**: Bun configuration for fast package management
- **config.json**: Application configuration
- **tsconfig.json**: TypeScript configuration
- **Dockerfile**: Container build configuration

### Build and Development
- **index.html**: Application entry point
- **styles.scss**: Global styles
- **bootstrap.js/.d.ts**: Bootstrap module exports

### Project Metadata
- **package.json**: Root package configuration
- **LICENSE**: MIT license
- **README.md**: Project documentation

## Migration Impact Analysis

### Directories to Remove
1. **bootstrap/**: 200+ files, 50KB+ - Complete system to be replaced by codegen
2. **revolutionary-codegen/**: Existing codegen to be replaced by AGENTS.md specification
3. **plugins/**: Current plugins to be migrated to new plugin format
4. **test-tooling/**: Jest-based testing to be replaced by Bun testing
5. **ci/**: CI configuration to be integrated into new structure
6. **python/**: Python utilities not needed in new architecture
7. **docs/**: Documentation to be regenerated from codegen
8. **coverage/**: Coverage to be handled by new testing infrastructure
9. **server/**: Server to be replaced by generated WebUI
10. **string/**: String service to be generated by codegen

### Directories to Keep
1. **src/**: React demo app (to be stashed)
2. **e2e/**: End-to-end tests (to be updated for Bun)

### New Directory Structure (AGENTS.md)
```
/
├── codegen/          # New codegen system
│   ├── core/         # Core infrastructure
│   ├── plugins/      # Tool plugins (git, docker, etc.)
│   ├── schemas/      # JSON schemas
│   ├── cli/          # Generated CLI
│   └── webui/        # Generated Next.js WebUI
├── src/              # React demo (stashed)
└── e2e/              # End-to-end tests
```

## Functional Analysis

### Bootstrap System Functions (to be migrated)
1. **Multi-environment module loading** (CDN + local)
2. **Plugin system** with hierarchical aggregates
3. **Factory-based dependency injection** (16 factories)
4. **TypeScript/SASS compilation services**
5. **Service registry and discovery**
6. **Configuration management** (config.json integration)
7. **OOP principles enforcement** (dataclass patterns, initialize/execute)
8. **Comprehensive testing infrastructure**

### Revolutionary Codegen Functions (to be replaced)
1. **Project structure generation**
2. **Business logic class generation**
3. **Template processing and rendering**
4. **Multi-language code generation**
5. **CLI interface with specifications**

### Plugin System Functions (to be migrated)
1. **OOP principles analysis** (SOLID, DRY, KISS, YAGNI)
2. **Code quality assessment**
3. **Test coverage analysis**
4. **Dependency analysis**
5. **Interface compliance checking**

## Conclusion

The current directory structure contains multiple overlapping systems:
- **Bootstrap**: Complete application framework with 200+ files
- **Revolutionary Codegen**: Existing codegen with limited functionality
- **Plugins**: Analysis tools for code quality
- **Testing**: Jest-based test infrastructure
- **Supporting**: Documentation, CI, Python utilities

The migration will consolidate these into a single, spec-driven codegen system per AGENTS.md, reducing complexity while maintaining all functionality through generated code.
