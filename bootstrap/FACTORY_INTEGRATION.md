# Factory Pattern Integration

This document describes the factory pattern implementation in the bootstrap system.

## Overview

The bootstrap system now uses an effective factory pattern with proper dependency injection and configuration management.

## Key Changes

### 1. Removed Factory Aggregators
- **Removed**: `factory-manager.js` and `factory-manager-instance.js`
- **Reason**: These were unnecessary aggregation layers that added complexity without value
- **Replacement**: Direct usage of `FactoryRegistry` with lazy loading

### 2. Minimal Factory Registration
- **New**: `bootstrap-factory-loaders.js` - Registers only essential factories
- **Approach**: Entrypoint-based factory registration
- **Benefits**: Reduced overhead, only load what's needed

### 3. Config Integration
- **Updated**: Factories now properly use config dataclasses
- **Examples**:
  - `LoggingManagerFactory` uses `LoggingManagerConfig`
  - `BootstrapperFactory` uses `BootstrapperConfig`
- **Benefits**: Type safety, clear dependency contracts

### 4. BootstrapApp Factory Usage
- **Before**: Direct instantiation (`new LoggingManager(...)`)
- **After**: Factory-based creation (`factoryRegistry.create('loggingManager', config)`)
- **Benefits**: Dependency injection, testability, centralized creation

## Current Factory Structure

### Essential Factories (Used by BootstrapApp)
- `loggingManager` - Creates LoggingManager instances
- `bootstrapper` - Creates Bootstrapper instances

### Factory Registration Pattern
```javascript
// Register factory loaders
registerBootstrapFactoryLoaders();

// Create config object
const config = new LoggingManagerConfig({...});

// Use factory to create instance
const instance = factoryRegistry.create('loggingManager', config);
```

### Config Dataclass Pattern
```javascript
class LoggingManagerConfig {
  constructor({ logClient, serializeForLog, serviceRegistry } = {}) {
    this.logClient = logClient;
    this.serializeForLog = serializeForLog;
    this.serviceRegistry = serviceRegistry;
  }
}
```

## Benefits

1. **Proper Dependency Injection** - Services have dependencies properly injected
2. **Type Safety** - Config classes provide clear contracts
3. **Testability** - Factories can be easily mocked
4. **Maintainability** - Centralized object creation
5. **Performance** - Lazy loading, only create what's needed
6. **Flexibility** - Runtime configuration through factory parameters

## Files Modified

### Removed
- `bootstrap/factories/factory-manager.js`
- `bootstrap/factories/factory-manager-instance.js`
- `bootstrap/registries/register-factory-loaders.js`

### Updated
- `bootstrap/factories/index.js` - Removed FactoryManager exports
- `bootstrap/factories/services/logging-manager-factory.js` - Added config integration
- `bootstrap/factories/core/bootstrapper-factory.js` - Added config integration
- `bootstrap/bootstrap-app.js` - Uses factories instead of direct instantiation

### New
- `bootstrap/registries/bootstrap-factory-loaders.js` - Minimal factory loader registration

## Usage Guidelines

### Creating New Factories
1. Extend `BaseFactory` class
2. Import and use appropriate config dataclass
3. Register factory loader in `bootstrap-factory-loaders.js`
4. Use factory through `factoryRegistry.create(name, config)`

### Testing Factories
- Mock factories by replacing `factoryRegistry.create()`
- Test with different config objects
- Verify dependency injection works correctly

## Migration Notes

This implementation replaces the previous unused factory infrastructure with a focused, effective pattern. The key improvements are:

- **Elimination of redundant aggregation layers**
- **Proper config dataclass integration**
- **Entrypoint-based factory registration**
- **Dependency injection throughout the system**

The result is a cleaner, more maintainable, and properly architected factory system.
