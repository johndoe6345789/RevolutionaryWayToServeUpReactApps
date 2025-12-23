# String Service - Enterprise I18n Implementation

A comprehensive, enterprise-grade internationalization (i18n) service built with strict adherence to software engineering best practices.

## Architecture

### Core Components

- **StringService** - Main service class providing i18n functionality
- **StringLoader** - Handles loading and parsing of string data files
- **StringCache** - Caches parsed data for performance optimization
- **StringValidator** - Validates string keys and data structures
- **StringFactory** - Factory pattern implementation for service creation

### Design Principles

- **Single Responsibility** - Each class has one clear purpose
- **Dependency Injection** - Components are loosely coupled
- **Factory Pattern** - Service instantiation through factories
- **Caching Strategy** - Performance optimization with TTL-based eviction
- **Validation Layer** - Comprehensive input validation
- **Type Safety** - Full TypeScript definitions included

## Features

### Internationalization
- Multi-language support with fallback mechanisms
- Parameter interpolation with validation
- Nested key access (dot notation)
- Language switching and management

### Data Access
- Error messages, user messages, labels, console messages
- Configuration values, constants, templates
- Metadata and game data access
- System identifiers

### Performance
- Lazy loading with caching
- Configurable cache size and TTL
- Efficient data structures

### Enterprise Patterns
- Base class inheritance
- Factory pattern implementation
- Comprehensive error handling
- Async/await patterns

## Usage

### Basic Usage

```javascript
const { StringFactory } = require('./string-factory.js');

const factory = new StringFactory();
const service = factory.create();

// Initialize (async)
await service.initialize();

// Get strings
const errorMsg = await service.getError('itemName');
const message = await service.getMessage('success');
const label = await service.getLabel('title');

// With parameters
const greeting = service.interpolate('Hello {name}!', { name: 'World' });
```

### Factory Patterns

```javascript
const factory = new StringFactory();

// Basic service
const service = factory.create();

// Service with custom cache
const cachedService = factory.createWithCache(100, 3600000);

// Service for specific language
const spanishService = factory.createForLanguage('es');

// Service with custom loader
const customService = factory.createWithLoader('/path/to/strings.json');
```

### Configuration

```javascript
const config = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  cache: {
    maxSize: 100,
    ttl: 3600000 // 1 hour
  },
  loader: {
    filePath: './custom-strings.json'
  }
};

const service = factory.createWithConfig(config);
```

## API Reference

### StringService Methods

#### Core Methods
- `initialize()` - Initialize service (lazy loading)
- `get(key, params?, language?)` - Get string by key with interpolation
- `reload()` - Reload data from source

#### Specialized Getters
- `getError(key, params?)` - Get error messages
- `getMessage(key, params?)` - Get user messages
- `getLabel(key, params?)` - Get UI labels
- `getConsole(key, params?)` - Get console messages
- `getSystem(key)` - Get system identifiers

#### Data Access
- `getConfig(key)` - Access configuration values
- `getConstant(key)` - Access constants
- `getTemplate(template)` - Access templates
- `getMetadata(key)` - Access metadata
- `getGameData(type)` - Access game data

#### Language Management
- `setLanguage(language)` - Set current language
- `getCurrentLanguage()` - Get current language
- `getAvailableLanguages()` - Get available languages

#### Utilities
- `interpolate(template, params?)` - Interpolate parameters
- `validateStrings(keys)` - Validate required strings

### StringFactory Methods

- `create()` - Create basic service
- `createWithConfig(config)` - Create with custom config
- `createForLanguage(language)` - Create for specific language
- `createWithCache(maxSize, ttl)` - Create with custom cache
- `createWithLoader(filePath)` - Create with custom loader

## File Structure

```
string/
├── string-service.js          # Main service class
├── string-loader.js           # Data loading component
├── string-cache.js            # Caching component
├── string-validator.js        # Validation component
├── string-factory.js          # Factory implementation
├── string-service.d.ts        # TypeScript definitions
├── strings.json               # String data file
├── demo.js                    # Demonstration script
└── README.md                  # This file
```

## Testing

Comprehensive Jest test suite included:

```bash
# Run all string service tests
cd test-tooling
npm test -- --testPathPattern=string

# Run specific test files
npm test string-loader.test.js
npm test string-cache.test.js
npm test string-validator.test.js
npm test string-service.test.js
npm test string-factory.test.js
npm test integration.test.js
```

## Performance Characteristics

- **Initialization**: Lazy loading, only when first accessed
- **Caching**: TTL-based cache with configurable size limits
- **Memory**: Efficient data structures, automatic cleanup
- **Validation**: Fast key validation with regex patterns
- **Interpolation**: Optimized parameter replacement

## Error Handling

- Comprehensive error messages with context
- Graceful fallbacks for missing data
- Validation warnings for interpolation issues
- Type safety with runtime checks

## Compliance

- **Function Length**: All functions ≤ 20 lines
- **Single Responsibility**: Each class/component has one purpose
- **Type Safety**: Full TypeScript definitions
- **Test Coverage**: 100% Jest test coverage
- **Enterprise Patterns**: Factory, caching, validation layers

## Demo

Run the demonstration script:

```bash
cd string
node demo.js
```

This will showcase all features including string retrieval, parameter interpolation, configuration access, language management, and factory patterns.
