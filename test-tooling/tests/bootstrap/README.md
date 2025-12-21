# Bootstrap Test Organization

This directory contains organized tests for the bootstrap system.

## Directory Structure

### Unit Tests (`unit/`)
Individual component and service tests organized by domain:

- **`core/`** - Core bootstrap functionality tests
  - `base-bootstrap-app.test.ts`
  - Constants, helpers, and other core components

- **`cdn/`** - CDN-related service tests
  - `bootstrap.cdn.comprehensive.test.ts`
  - `bootstrap.cdn.comprehensive.new.test.ts`
  - `bootstrap.cdn.consolidated.test.ts`
  - `bootstrap.cdn.specific.comprehensive.test.ts`
  - `bootstrap.cdn.test.ts`

- **`local/`** - Local development and compilation tests
  - `local-dependency-loader.comprehensive.test.ts`
  - `local-helpers.comprehensive.test.ts`
  - `local-paths.test.ts`
  - `local-require-builder.comprehensive.new.test.ts`
  - `local-require-builder.comprehensive.test.ts`

- **`services/`** - Individual service tests
  - `env-service.comprehensive.test.ts`
  - `framework-renderer.comprehensive.test.ts`
  - `sass-compiler-service.comprehensive.test.ts`
  - `script-list-loader.comprehensive.test.ts`
  - `service-registry-instance.comprehensive.test.ts`
  - `service-registry.consolidated.test.ts`
  - `tsx-compiler-service.simple.test.ts`

- **`controllers/`** - Controller tests
- **`entrypoints/`** - Entrypoint tests  
- **`helpers/`** - Helper utility tests
- **`initializers/`** - Initializer tests
- **`registries/`** - Registry tests

### Integration Tests (`integration/`)
Cross-component and end-to-end tests:

- `base-entrypoint.comprehensive.test.ts`
- `base-helper.consolidated.test.ts`
- `base-service.comprehensive.test.ts`
- `comprehensive-critical-classes.test.ts`
- `comprehensive-unit-tests-for-critical-classes.new.test.ts`
- `global-root-handler.consolidated.test.ts`
- `bootstrap.test.ts`
- `bootstrap.require-default.test.ts`
- `bootstrapper.consolidated.test.ts`

### Legacy Tests (`legacy/`)
Old or disabled test files preserved for reference:

- `bootstrap-app.test.js` (old Jest-based test)
- `bootstrap-app.test.ts.disabled` (disabled test file)

### Test Helpers (`helpers/`)
Shared test utilities and setup files

### Fixtures (`fixtures/`)
Test data and mock objects:
- `mocks/` - Mock objects and services
- `data/` - Test data files

## Test Naming Conventions

- **Unit tests**: `[component-name].test.ts`
- **Integration tests**: `[feature-name].test.ts`
- **Legacy files**: Preserved with original naming

## Import Paths

All tests should import from the actual bootstrap source:
```typescript
import ModuleName from "../../../../bootstrap/[path]/[module].js";
```

## Running Tests

Run unit tests:
```bash
npm test -- unit/
```

Run integration tests:
```bash
npm test -- integration/
```

Run all bootstrap tests:
```bash
npm test -- bootstrap/
```

## Migration Notes

This organization was created to:
- Separate unit and integration tests
- Group tests by functional domain
- Remove duplicate source code copies
- Standardize naming conventions
- Preserve legacy tests for reference
- Improve test discoverability and maintenance
