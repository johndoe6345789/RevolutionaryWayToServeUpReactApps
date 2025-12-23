# Bootstrap Folder Removal Documentation

## Overview
The `bootstrap/` directory contains 200+ files of manually written JavaScript/TypeScript code that implements a comprehensive module loading and dependency injection system. This folder will be completely removed and replaced with AGENTS.md-compliant generated code.

## What Bootstrap Does
- **Module Loading**: CDN/local fallback loading system with network probing
- **Dependency Injection**: Factory-based service creation with 16+ factories
- **Plugin Architecture**: Hierarchical aggregates for plugin management
- **Configuration**: JSON-driven application setup
- **TypeScript/SASS Compilation**: Runtime compilation services
- **Registry System**: Service discovery and lifecycle management
- **Controller Pattern**: MVC-style request handling

## Key Components Being Removed

### Core Files
- `bootstrap-app.js`: Main application orchestrator
- `di-container.js`: Dependency injection container
- `demo-nested-aggregates.js`: Demonstration code

### Factory System (16 factories)
```
bootstrap/factories/
├── aggregate-factory.js
├── base-class-factory.js
├── bootstrap-app-factory.js
├── service-factory-loader-factory.js
├── service-initializer-factory.js
└── [12 more factory files]
```

### Service Implementations
```
bootstrap/services/
├── cdn/ (network services)
├── core/ (essential services)
└── local/ (compilation services)
```

### Registry System
```
bootstrap/registries/
├── service-registry.js
├── factory-registry.js
├── controller-registry.js
├── helper-registry.js
└── [8 more registry files]
```

### Aggregate Architecture
```
bootstrap/aggregate/
├── nested-aggregate.js (hierarchical loading)
├── plugin-group-aggregate.js (plugin management)
└── class-registry-aggregate.js (class discovery)
```

## Migration Strategy
**Replaced by**: `specs/bootstrap-system.json` + `codegen/core/bootstrap-generator.js`

The entire bootstrap system will be generated from JSON specifications, reducing 200+ files to 5 JSON files + 1 generator.

## Functional Equivalence
- All module loading capabilities preserved
- DI container replaced with registry injection
- Plugin system enhanced with spec validation
- Configuration system maintained via JSON
- Compilation services generated as needed

## Breaking Changes
- Manual factory creation → Generated dataclasses
- Complex DI patterns → Simple registry injection
- Manual service registration → Spec-driven generation
- Hardcoded configurations → JSON specs

## Benefits After Removal
- 95% code reduction
- Single source of truth
- AGENTS.md compliance
- Self-hosting capability
- Easier maintenance

## Removal Command
```bash
rm -rf bootstrap/
```

## Files Removed: 200+ files (~50KB)
