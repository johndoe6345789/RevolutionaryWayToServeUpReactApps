# Interface Implementation Guide

This document provides comprehensive guidelines for implementing interfaces in the Revolutionary Way To Serve Up React Apps bootstrap system.

## Overview

All classes in the bootstrap system should follow a two-layer architecture:

1. **Interface Layer** - Defines contracts and type signatures
2. **Skeleton Implementation Layer** - Provides default implementations for interfaces
3. **Concrete Implementation Layer** - Extends skeleton classes for specific functionality

This approach ensures:
- **Type Safety**: Interfaces provide compile-time validation
- **Code Reuse**: Skeleton classes implement common interface patterns
- **Consistency**: All concrete implementations follow same patterns
- **Maintainability**: Changes to interfaces automatically propagate

## Architecture Pattern

```
Interface (TypeScript)    Skeleton Class (JavaScript)    Concrete Class (JavaScript)
     IConfig   --->   BaseConfig   --->   DynamicModulesConfig
                   --->   SkeletonConfig   --->   ConfigJsonParser
                   
     IRegistry --->   BaseRegistry  --->   ServiceRegistry
                   --->   SkeletonRegistry  --->   ControllerRegistry
                   
     IGlobalHandler ---> BaseGlobalHandler --->   GlobalRootHandler
                   
     IInitializer --->   BaseInitializer --->   LocalLoaderInitializer
                   
     IRegisteredBase ->  BaseRegistered ->   BaseRegisteredController
                   
     IEnvironment --->   BaseEnvironment --->   ModuleLoaderEnvironment
```

## Interface Hierarchy

### Core Interfaces

#### IConfig
**Purpose**: Base interface for all configuration classes
**Location**: `bootstrap/interfaces/IConfig.d.ts`
**Implemented by**: All `*Config` classes, `ConfigJsonParser`

**Methods**:
- `validate(): void` - Validates configuration
- `merge(additional: Record<string, unknown>): IConfig` - Merges additional configuration
- `toObject(): Record<string, unknown>` - Serializes to plain object

#### IRegistry
**Purpose**: Base interface for all registry classes
**Location**: `bootstrap/interfaces/IRegistry.d.ts`
**Implemented by**: `ServiceRegistry`, `ControllerRegistry`, `FactoryRegistry`, `HelperRegistry`, `EntrypointRegistry`

**Methods**:
- `register(name: string, item: unknown, metadata: Record<string, unknown>, requiredDependencies: string[]): void`
- `get(name: string): unknown`
- `has(name: string): boolean`
- `unregister(name: string): boolean`
- `getAllNames(): string[]`
- `clear(): void`
- `getMetadata(name: string): Record<string, unknown> | undefined`
- `getRequiredDependencies(name: string): string[] | undefined`

#### IGlobalHandler
**Purpose**: Interface for global handler classes
**Location**: `bootstrap/interfaces/IGlobalHandler.d.ts`
**Implemented by**: `GlobalRootHandler`

**Methods**:
- `readonly root: unknown` - Global root object
- `getNamespace(): Record<string, unknown>` - Bootstrap namespace
- `get helpers(): Record<string, unknown>` - Helper registry namespace
- `getDocument(): Document | undefined`
- `getFetch(): ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) | undefined`
- `getLogger(tag?: string): (msg: string, data?: unknown) => void`
- `hasWindow(): boolean`
- `hasDocument(): boolean`

#### IInitializer
**Purpose**: Interface for initializer classes
**Location**: `bootstrap/interfaces/IInitializer.d.ts`
**Implemented by**: `LocalLoaderInitializer`, other service initializers

**Properties**:
- `readonly service: unknown` - Service being initialized
- `readonly config: Record<string, unknown>` - Configuration

**Methods**:
- `run(): void` - Executes initialization lifecycle
- `validateDependencies(): void` - Validates dependencies
- `finalize(): void` - Cleanup steps
- `isInitialized(): boolean` - Initialization status
- `getErrors(): string[]` - Error collection

#### IRegisteredBase
**Purpose**: Interface for registered base classes
**Location**: `bootstrap/interfaces/IRegisteredBase.d.ts`
**Implemented by**: `BaseRegisteredController`, `BaseRegisteredEntrypoint`

**Methods**:
- `initialize(): this` - Initializes the instance
- `get isInitialized(): boolean` - Initialization status
- `get configuration(): Record<string, unknown>` - Configuration access

#### IEnvironment
**Purpose**: Interface for environment classes
**Location**: `bootstrap/interfaces/IEnvironment.d.ts`
**Implemented by**: `ModuleLoaderEnvironment`, other environment managers

**Methods**:
- `getEnvironmentType(): string` - Runtime environment type
- `supportsFeature(feature: string): boolean` - Feature support check
- `getConfig(key: string): unknown` - Environment configuration
- `setConfig(key: string, value: unknown): void` - Set configuration
- `getAllConfig(): Record<string, unknown>` - All configuration
- `validateEnvironment(): boolean` - Environment validation
- `getRuntimeInfo(): Record<string, unknown>` - Runtime information

## Implementation Guidelines

### 1. Configuration Classes

All configuration classes must implement `IConfig`:

```javascript
class MyConfig {
  constructor(options = {}) {
    // Initialize configuration properties
  }

  validate() {
    // Validate configuration structure and values
    if (!this.requiredProperty) {
      throw new Error('requiredProperty is missing');
    }
  }

  merge(additional) {
    // Return new instance with merged properties
    return new MyConfig({
      ...this.toObject(),
      ...additional,
    });
  }

  toObject() {
    // Return plain object representation
    return {
      property1: this.property1,
      property2: this.property2,
    };
  }
}
```

### 2. Registry Classes

All registry classes must implement `IRegistry`:

```javascript
class MyRegistry {
  constructor() {
    this._items = new Map();
  }

  register(name, item, metadata, requiredDependencies) {
    // Validate input
    if (!name) throw new Error('Name required');
    
    // Store with metadata
    this._items.set(name, { item, metadata, requiredDependencies });
    
    // Validate dependencies if provided
    if (requiredDependencies) {
      this._validateDependencies(requiredDependencies);
    }
  }

  get(name) {
    const entry = this._items.get(name);
    return entry ? entry.item : undefined;
  }

  // ... implement other IRegistry methods
}
```

### 3. Global Handler Classes

Global handler classes must implement `IGlobalHandler`:

```javascript
class MyGlobalHandler {
  constructor(root) {
    this._root = root || this._detectGlobal();
  }

  get root() {
    return this._root;
  }

  getNamespace() {
    if (!this._namespace) {
      this._namespace = this._root.__myNamespace || 
        (this._root.__myNamespace = {});
    }
    return this._namespace;
  }

  // ... implement other IGlobalHandler methods
}
```

### 4. Initializer Classes

Initializer classes must implement `IInitializer`:

```javascript
class MyInitializer {
  constructor(service) {
    this.service = service;
    this.config = service.config;
    this._errors = [];
  }

  run() {
    this._errors = [];
    try {
      // Execute initialization steps
      this._validateDependencies();
      this._setupService();
      this._registerService();
    } catch (error) {
      this._errors.push(error.message);
      throw error;
    }
  }

  validateDependencies() {
    // Validate required dependencies
    if (!this.service.requiredDependency) {
      throw new Error('Required dependency missing');
    }
  }

  isInitialized() {
    return this.service && this.service.initialized;
  }

  getErrors() {
    return this._errors || [];
  }

  // ... implement other IInitializer methods
}
```

### 5. Registered Base Classes

Registered base classes must implement `IRegisteredBase`:

```javascript
class MyBaseClass {
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
  }

  initialize() {
    this._ensureNotInitialized();
    
    // Perform initialization
    this._setup();
    
    this._markInitialized();
    return this;
  }

  get isInitialized() {
    return this.initialized;
  }

  get configuration() {
    return this.config;
  }

  // Protected helper methods
  _ensureNotInitialized() {
    if (this.initialized) {
      throw new Error(`${this.constructor.name} already initialized`);
    }
  }

  _markInitialized() {
    this.initialized = true;
  }

  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error(`${this.constructor.name} not initialized`);
    }
  }
}
```

## Class Responsibility Matrix

| Class Type | Interface | Responsibility |
|------------|-----------|----------------|
| Configuration | `IConfig` | Manage configuration data and validation |
| Registry | `IRegistry` | Store and retrieve registered items |
| Global Handler | `IGlobalHandler` | Access global objects and namespaces |
| Initializer | `IInitializer` | Coordinate service initialization |
| Registered Base | `IRegisteredBase` | Provide initialization lifecycle |
| Environment | `IEnvironment` | Manage runtime environment |
| Service | `BaseService` | Provide business logic |
| Factory | `BaseFactory` | Create instances with DI |
| Controller | `BaseController` | Handle application flow |
| Helper | `BaseHelper` | Provide utility functions |

## TypeScript Declaration Files

When updating TypeScript declaration files:

1. Import the interface:
   ```typescript
   import { IConfig } from "../interfaces/IConfig";
   ```

2. Implement the interface:
   ```typescript
   declare class MyConfig implements IConfig {
     // ... properties and methods
   }
   ```

3. Include all interface methods with proper types

## Migration Steps

To convert an existing class to use interfaces:

1. **Identify the appropriate interface** based on class responsibility
2. **Update the JavaScript implementation** to include required methods
3. **Update TypeScript declaration** to implement the interface
4. **Add validation logic** where appropriate
5. **Test the implementation** to ensure compliance
6. **Update documentation** with interface information

## Best Practices

1. **Always validate input** in interface methods
2. **Provide meaningful error messages** for validation failures
3. **Use consistent naming conventions** across implementations
4. **Document edge cases** and error conditions
5. **Maintain backward compatibility** when extending interfaces
6. **Write comprehensive tests** for interface implementations
7. **Use TypeScript** for new development to catch interface violations early

## Testing Interface Compliance

Use these test patterns:

```javascript
// Configuration test
const config = new MyConfig(options);
expect(() => config.validate()).not.toThrow();
const merged = config.merge(additional);
expect(merged.toObject()).toEqual(expected);

// Registry test
const registry = new MyRegistry();
registry.register('test', item, metadata, deps);
expect(registry.get('test')).toBe(item);
expect(registry.has('test')).toBe(true);

// Initializer test
const initializer = new MyInitializer(service);
initializer.run();
expect(initializer.isInitialized()).toBe(true);
expect(initializer.getErrors()).toEqual([]);
```

This guide ensures consistent, type-safe implementation across the entire bootstrap system.
