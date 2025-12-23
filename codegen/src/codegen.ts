#!/usr/bin/env node

/**
 * Revolutionary Codegen - Main Entry Point
 * Spec-driven, plugin-based code generation system per AGENTS.md
 * Replaces bootstrap system with clean, maintainable architecture
 */

const path = require('path');
const BaseCodegen = require('./core/base-codegen');

class RevolutionaryCodegen extends BaseCodegen {
  constructor(options = {}) {
    super({
      outputDir: options.outputDir || './generated',
      verbose: options.verbose || false,
      strictMode: options.strictMode !== false,
      ...options
    });

    this.cliMode = false;
    this.webuiMode = false;
  }

  /**
   * Initialize Revolutionary Codegen system
   * @returns {Promise<RevolutionaryCodegen>} Initialized system
   */
  async initialize() {
    await super.initialize();

    this.log('🚀 Revolutionary Codegen initialized successfully', 'success');
    this.log(`📊 System Status: ${JSON.stringify(this.getStatus(), null, 2)}`, 'info');

    return this;
  }

  /**
   * Execute codegen operations
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Results
   */
  async execute(context = {}) {
    const results = await super.execute(context);

    // Display results in user-friendly format
    this._displayResults(results);

    return results;
  }

  /**
   * Display execution results
   * @param {Object} results - Execution results
   * @returns {void}
   */
  _displayResults(results) {
    console.log('\n🎯 EXECUTION RESULTS');
    console.log('==================');

    if (results.success) {
      console.log(`✅ Success: Generated ${results.stats.filesGenerated} files`);
      console.log(`📁 Output Directory: ${this.options.outputDir}`);
      console.log(`⏱️  Duration: ${results.stats.duration}ms`);

      if (results.generated && results.generated.length > 0) {
        console.log('\n📄 Generated Files:');
        results.generated.slice(0, 10).forEach(file => {
          console.log(`   • ${file}`);
        });
        if (results.generated.length > 10) {
          console.log(`   ... and ${results.generated.length - 10} more files`);
        }
      }
    } else {
      console.log('❌ Execution failed');
      if (results.errors && results.errors.length > 0) {
        console.log('\n🚨 Errors:');
        results.errors.slice(0, 5).forEach(error => {
          console.log(`   • ${error}`);
        });
      }
    }

    if (results.warnings && results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      results.warnings.slice(0, 5).forEach(warning => {
        console.log(`   • ${warning}`);
      });
    }

    console.log('\n🎉 Revolutionary Codegen execution complete!\n');
  }

  /**
   * Run in CLI mode
   * @param {Array<string>} args - Command line arguments
   * @returns {Promise<void>}
   */
  async runCLI(args) {
    this.cliMode = true;

    const command = args[0] || 'help';
    const options = this._parseCLIArgs(args.slice(1));

    try {
      await this.initialize();

      switch (command) {
        case 'generate':
          await this._runGenerate(options);
          break;
        case 'list':
          await this._runList(options);
          break;
        case 'describe':
          await this._runDescribe(options);
          break;
        case 'search':
          await this._runSearch(options);
          break;
        case 'install':
          await this._runInstall(options);
          break;
        case 'status':
          this._runStatus();
          break;
        case 'help':
        default:
          this._displayHelp();
          break;
      }
    } catch (error) {
      this.log(`CLI execution failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  /**
   * Run code generation
   * @param {Object} options - CLI options
   * @returns {Promise<void>}
   */
  async _runGenerate(options) {
    const context = {
      operation: 'generate',
      specPath: options.spec,
      outputDir: options.output || this.options.outputDir,
      language: options.language,
      profile: options.profile,
      template: options.template
    };

    const results = await this.execute(context);

    if (!results.success) {
      process.exit(1);
    }
  }

  /**
   * List available components
   * @param {Object} options - CLI options
   * @returns {Promise<void>}
   */
  async _runList(options) {
    const category = options.category || 'all';

    console.log('\n📋 AVAILABLE COMPONENTS');
    console.log('======================');

    if (category === 'plugins' || category === 'all') {
      console.log('\n🔌 Plugins:');
      const plugins = this.list('plugin');
      plugins.forEach(pluginId => {
        console.log(`   • ${pluginId}`);
      });
    }

    if (category === 'tools' || category === 'all') {
      console.log('\n🛠️  Tools:');
      const tools = this.list('DevWorkflowRegistry');
      tools.forEach(toolId => {
        console.log(`   • ${toolId}`);
      });
    }

    console.log('');
  }

  /**
   * Describe a component
   * @param {Object} options - CLI options
   * @returns {Promise<void>}
   */
  async _runDescribe(options) {
    const componentId = options.component;

    if (!componentId) {
      console.log('❌ Please specify a component to describe');
      console.log('   Usage: codegen describe <component-id>');
      return;
    }

    console.log(`\n📖 COMPONENT DESCRIPTION: ${componentId}`);
    console.log('=====================================');

    // Try to find component in various registries
    let component = this.get('plugin', componentId);

    if (!component) {
      component = this.get('DevWorkflowRegistry', componentId);
    }

    if (component) {
      console.log(`Name: ${component.name || component.title || 'Unknown'}`);
      console.log(`Description: ${component.description || component.summary || 'No description'}`);
      console.log(`Version: ${component.version || 'Unknown'}`);
      console.log(`Category: ${component.category || 'Unknown'}`);

      if (component.search) {
        console.log(`Keywords: ${component.search.keywords?.join(', ') || 'None'}`);
        console.log(`Capabilities: ${component.search.capabilities?.join(', ') || 'None'}`);
      }

      if (component.spec) {
        console.log('\n📋 Tool Specifications:');
        if (component.spec.platforms) {
          console.log(`Platforms: ${Object.keys(component.spec.platforms).filter(p => component.spec.platforms[p]).join(', ')}`);
        }
        if (component.spec.oneLiners) {
          console.log(`One-liners: ${component.spec.oneLiners.length}`);
        }
      }
    } else {
      console.log('❌ Component not found');
    }

    console.log('');
  }

  /**
   * Search for components
   * @param {Object} options - CLI options
   * @returns {Promise<void>}
   */
  async _runSearch(options) {
    const query = options.query;

    if (!query) {
      console.log('❌ Please specify a search query');
      console.log('   Usage: codegen search "query"');
      return;
    }

    console.log(`\n🔍 SEARCH RESULTS for "${query}"`);
    console.log('================================');

    // Simple text search across all components
    const results = [];
    const registries = ['plugin', 'DevWorkflowRegistry'];

    for (const registryId of registries) {
      const components = this.list(registryId);

      for (const componentId of components) {
        const component = this.get(registryId, componentId);

        if (component) {
          const searchableText = [
            component.name,
            component.title,
            component.description,
            component.summary,
            component.search?.keywords?.join(' '),
            component.search?.aliases?.join(' ')
          ].filter(Boolean).join(' ').toLowerCase();

          if (searchableText.includes(query.toLowerCase())) {
            results.push({
              id: componentId,
              name: component.name || component.title,
              description: component.description || component.summary,
              registry: registryId
            });
          }
        }
      }
    }

    if (results.length > 0) {
      results.forEach(result => {
        console.log(`   • ${result.id} - ${result.name}`);
        console.log(`     ${result.description}`);
      });
    } else {
      console.log('   No results found');
    }

    console.log('');
  }

  /**
   * Install a tool
   * @param {Object} options - CLI options
   * @returns {Promise<void>}
   */
  async _runInstall(options) {
    const toolId = options.tool;

    if (!toolId) {
      console.log('❌ Please specify a tool to install');
      console.log('   Usage: codegen install <tool-id>');
      return;
    }

    console.log(`\n📦 INSTALLING TOOL: ${toolId}`);
    console.log('===========================');

    // Find the tool plugin
    const plugin = this.loadedPlugins.get(`plugin.tools.${toolId}`);

    if (!plugin) {
      console.log(`❌ Tool plugin not found: ${toolId}`);
      return;
    }

    try {
      const context = {
        operation: 'install',
        platform: options.platform,
        packageManager: options.packageManager
      };

      const results = await plugin.execute(context);

      if (results.success) {
        console.log('✅ Tool installed successfully');
        console.log(`Platform: ${results.output.platform}`);
        console.log(`Package Manager: ${results.output.packageManager}`);
      } else {
        console.log('❌ Tool installation failed');
        console.log(`Error: ${results.error}`);
      }
    } catch (error) {
      console.log(`❌ Installation error: ${error.message}`);
    }

    console.log('');
  }

  /**
   * Display system status
   * @returns {void}
   */
  _runStatus() {
    const status = this.getStatus();

    console.log('\n📊 SYSTEM STATUS');
    console.log('================');

    console.log(`Initialized: ${status.initialized ? '✅' : '❌'}`);
    console.log(`Plugins Discovered: ${status.plugins.discovered}`);
    console.log(`Plugins Loaded: ${status.plugins.loaded}`);
    console.log(`Registries: ${status.registries.aggregates}`);
    console.log(`Specifications: ${status.registries.specs}`);

    console.log('\n⚙️  Configuration:');
    console.log(`Output Directory: ${status.options.outputDir}`);
    console.log(`Strict Mode: ${status.options.strictMode ? '✅' : '❌'}`);
    console.log(`Verbose: ${status.options.verbose ? '✅' : '❌'}`);

    console.log('');
  }

  /**
   * Parse CLI arguments
   * @param {Array<string>} args - CLI arguments
   * @returns {Object} Parsed options
   */
  _parseCLIArgs(args) {
    const options = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
        options[key] = value;
      } else if (!options.command) {
        options.component = arg;
      }
    }

    return options;
  }

  /**
   * Display CLI help
   * @returns {void}
   */
  _displayHelp() {
    console.log(`
🚀 REVOLUTIONARY CODEGEN - Spec-Driven Code Generation
======================================================

A revolutionary, plugin-based code generation system that creates
complete software projects from JSON specifications.

USAGE:
  node codegen.js [command] [options]

COMMANDS:
  generate      Generate code from specifications
  list          List available components
  describe      Describe a specific component
  search        Search for components
  install       Install a tool
  status        Show system status
  help          Show this help message

GENERATE OPTIONS:
  --spec <file>       Specification file path
  --output <dir>      Output directory (default: ./generated)
  --language <lang>   Target language
  --profile <name>    Profile to use
  --template <name>   Template to use

LIST OPTIONS:
  --category <type>   Filter by category (plugins, tools, all)

DESCRIBE OPTIONS:
  <component-id>      Component to describe

SEARCH OPTIONS:
  <query>             Search query

INSTALL OPTIONS:
  <tool-id>           Tool to install
  --platform <os>    Target platform
  --package-manager <pm> Package manager to use

EXAMPLES:
  # Generate from specification
  node codegen.js generate --spec my-project.json

  # List all tools
  node codegen.js list --category tools

  # Describe a tool
  node codegen.js describe tool.dev.git

  # Search for components
  node codegen.js search "version control"

  # Install Git
  node codegen.js install git

  # Show system status
  node codegen.js status

🎯 FEATURES:
  • Spec-driven code generation
  • Plugin-based architecture
  • Multi-language support
  • Tool orchestration
  • Registry/aggregate system
  • Strict OO principles
  • i18n support

📋 ARCHITECTURE:
  • BaseCodegen: Core orchestration
  • Plugin system: Tool and language providers
  • Registry system: Component discovery
  • Aggregate system: Hierarchical organization
  • Spec validation: JSON schema compliance

For more information, see AGENTS.md specification.
`);
  }
}

// CLI execution
if (require.main === module) {
  const codegen = new RevolutionaryCodegen();
  const args = process.argv.slice(2);

  codegen.runCLI(args).catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = RevolutionaryCodegen;
