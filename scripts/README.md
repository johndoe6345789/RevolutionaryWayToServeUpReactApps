# RWTRA Plugin System

## Overview

The RWTRA (Revolutionary Way To Serve Up React Apps) CLI provides a unified plugin-based system for managing all analysis, generation, and utility tools for the React bootstrap system.

## Features

- **Plugin Architecture**: Modular system with auto-discovery of plugins
- **Unified Interface**: Single CLI entry point for all tools
- **Dependency Management**: Automatic plugin dependency resolution
- **Configuration**: Global and plugin-specific configuration management
- **Hot Loading**: Plugins can be added without restarting the CLI

## Installation

```bash
# Make the CLI executable
chmod +x scripts/rwtra-cli.js

# Run help
./scripts/rwtra-cli.js --help
```

## Usage

### Basic Commands

```bash
# List all available plugins
./scripts/rwtra-cli.js plugins list

# Get information about a specific plugin
./scripts/rwtra-cli.js plugins info <plugin-name>

# Run a specific plugin
./scripts/rwtra-cli.js <plugin-name> [options]

# Run all analysis plugins
./scripts/rwtra-cli.js analyze --all

# Run dependency analysis
./scripts/rwtra-cli.js dependency-analyzer

# Show configuration
./scripts/rwtra-cli.js config show
```

### Available Plugins

#### Analysis Plugins

- **dependency-analyzer**: Analyzes dependency relationships and detects issues
  - Circular dependencies
  - Missing dependencies  
  - Broken import/export chains
  - Orphaned modules
  - Version conflicts

#### Generation Plugins

- **api-stubs**: Generates API stubs for undocumented modules

#### Utility Plugins

- **coverage-report**: Generates comprehensive coverage reports

## Plugin Development

### Creating a New Plugin

1. Create a new file in `scripts/plugins/` with the `.plugin.js` extension
2. Extend the `BasePlugin` class
3. Implement the required `execute()` method
4. Define plugin metadata in the constructor

### Plugin Template

```javascript
#!/usr/bin/env node

const BasePlugin = require('../lib/base-plugin');

class MyPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'my-plugin',
      description: 'Description of what this plugin does',
      version: '1.0.0',
      author: 'Your Name',
      category: 'analysis|generation|utility',
      commands: [
        {
          name: 'my-command',
          description: 'Description of the command'
        }
      ],
      dependencies: [] // List of required plugins
    });
  }

  /**
   * Main plugin execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Plugin execution results
   */
  async execute(context) {
    await this.initialize(context);
    
    // Your plugin logic here
    this.log('Running my plugin...', 'info');
    
    // Use context.colors for colored output
    console.log(this.colorize('Hello from my plugin!', context.colors.green));
    
    return {
      success: true,
      message: 'Plugin executed successfully'
    };
  }
}

module.exports = MyPlugin;
```

### Plugin Categories

- **analysis**: Tools that analyze code, dependencies, coverage, etc.
- **generation**: Tools that generate code, documentation, stubs, etc.
- **utility**: Helper tools and utilities

### Context Object

The `context` object passed to plugins contains:

```javascript
{
  bootstrapPath: '/path/to/bootstrap',
  config: {
    // Global configuration
  },
  options: {
    // Command line options
  },
  colors: {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  }
}
```

## Configuration

### Global Configuration

Configuration is stored in `scripts/config/global.json`:

```json
{
  "version": "1.0.0",
  "settings": {
    "debug": false,
    "verbose": false,
    "colors": true,
    "bootstrapPath": "/path/to/bootstrap",
    "outputDirectory": "/path/to/output",
    "reportsDirectory": "/path/to/reports"
  },
  "plugins": {
    "autoLoad": true,
    "autoReload": false,
    "timeout": 30000
  }
}
```

### Plugin-Specific Configuration

Each plugin can have its own configuration in `scripts/config/plugins/<plugin-name>.json`:

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "enabled": true,
  "settings": {
    // Plugin-specific settings
  },
  "dependencies": []
}
```

## Migration from Legacy Scripts

The plugin system replaces the following legacy scripts:

### Migrated Plugins

- `dependency-analyzer.js` → `dependency-analyzer.plugin.js`
- `doc_coverage.py` → `doc-coverage.plugin.js` (planned)
- `interface-coverage-tool.js` → `interface-coverage.plugin.js` (planned)
- `factory-coverage-tool.js` → `factory-coverage.plugin.js` (planned)
- `refactoring-tool.js` → `refactoring.plugin.js` (planned)

### Legacy Script Compatibility

Legacy scripts remain available for backward compatibility:

```bash
# Old way (still works)
./scripts/dependency-analyzer.js

# New way (recommended)
./scripts/rwtra-cli.js dependency-analyzer
```

## Examples

### Basic Dependency Analysis

```bash
# Run dependency analysis
./scripts/rwtra-cli.js dependency-analyzer

# Save results to file
./scripts/rwtra-cli.js dependency-analyzer --output --output-dir ./reports
```

### Plugin Information

```bash
# List all plugins
./scripts/rwtra-cli.js plugins list

# Get detailed info about a plugin
./scripts/rwtra-cli.js plugins info dependency-analyzer

# Reload all plugins
./scripts/rwtra-cli.js plugins reload
```

### Configuration Management

```bash
# Show current configuration
./scripts/rwtra-cli.js config show

# Set a configuration value
./scripts/rwtra-cli.js config set debug true

# Reset configuration to defaults
./scripts/rwtra-cli.js config reset
```

## Architecture

### Core Components

1. **BasePlugin**: Abstract class all plugins extend
2. **PluginRegistry**: Manages plugin discovery and loading
3. **ConfigManager**: Handles configuration management
4. **RWTRACLI**: Main CLI interface and command routing

### Plugin Lifecycle

1. **Discovery**: Scan plugins directory for `.plugin.js` files
2. **Loading**: Load and validate plugin classes
3. **Initialization**: Initialize plugin with execution context
4. **Execution**: Run plugin's main logic
5. **Cleanup**: Perform any cleanup operations

### Auto-Discovery

The system automatically discovers plugins by:
1. Scanning `scripts/plugins/` directory
2. Looking for files ending in `.plugin.js`
3. Loading each file as a Node.js module
4. Validating it extends `BasePlugin`
5. Registering with metadata validation

## Error Handling

### Plugin Errors

- Missing dependencies: Plugin won't load if dependencies aren't available
- Invalid plugin class: Files that don't export a valid plugin class
- Runtime errors: Caught and logged with appropriate error codes

### Configuration Errors

- Invalid JSON: Malformed configuration files
- Missing directories: Auto-creation of required directories
- Permission errors: Clear error messages for file access issues

## Contributing

### Adding New Plugins

1. Fork the repository
2. Create your plugin following the template
3. Add tests in `scripts/tests/`
4. Update documentation
5. Submit a pull request

### Testing

```bash
# Run plugin tests
./scripts/rwtra-cli.js test

# Test specific plugin
./scripts/rwtra-cli.js test dependency-analyzer
```

## Troubleshooting

### Common Issues

1. **Plugin not found**: Check file name and location
2. **Permission denied**: Ensure executable permissions
3. **Missing dependencies**: Verify all required plugins are available
4. **Configuration errors**: Check JSON syntax and file permissions

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Enable debug logging
./scripts/rwtra-cli.js --debug dependency-analyzer

# Or set in config
./scripts/rwtra-cli.js config set debug true
```

## Future Enhancements

### Planned Features

- [ ] Plugin hot-reloading
- [ ] Plugin dependency graph visualization
- [ ] Plugin marketplace/community repository
- [ ] Web-based configuration interface
- [ ] Plugin testing framework
- [ ] Performance monitoring
- [ ] Plugin versioning and updates

### Migration Roadmap

1. **Phase 1**: Core analysis plugins (completed)
   - ✅ Dependency Analyzer
   - ✅ Interface Coverage
   - ✅ Factory Coverage

2. **Phase 2**: Documentation and generation plugins
   - 🔄 Documentation Coverage
   - 🔄 API Stubs
   - 🔄 Template Generator

3. **Phase 3**: Advanced features
   - ⏳ Plugin Marketplace
   - ⏳ Web Interface
   - ⏳ Performance Monitoring

## Support

For issues, questions, or contributions:

1. Check existing issues in the repository
2. Create new issues with detailed descriptions
3. Join discussions for questions and ideas
4. Follow contribution guidelines for pull requests

---

*This documentation covers the RWTRA Plugin System as of version 1.0.0*
