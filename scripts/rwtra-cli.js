#!/usr/bin/env node

/**
 * RWTRA CLI - Revolutionary Way To Serve Up React Apps Command Line Interface
 * Unified tool with plugin system for managing all analysis and generation tools
 */

const fs = require('fs');
const path = require('path');
const PluginRegistry = require('./lib/plugin-registry');
const ConfigManager = require('./lib/config-manager');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

class RWTRACLI {
  constructor() {
    this.pluginRegistry = new PluginRegistry();
    this.configManager = new ConfigManager();
    this.bootstrapPath = path.join(__dirname, '..');
  }

  /**
   * Main entry point for the CLI
   */
  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      this.showHelp();
      return;
    }

    const command = args[0];
    const commandArgs = args.slice(1);

    try {
      // Initialize plugin system
      await this.pluginRegistry.discoverPlugins();
      
      // Route to appropriate handler
      switch (command) {
        case 'help':
        case '--help':
        case '-h':
          this.showHelp();
          break;
          
        case 'version':
        case '--version':
        case '-v':
          this.showVersion();
          break;
          
        case 'plugins':
          await this.handlePluginsCommand(commandArgs);
          break;
          
        case 'analyze':
          await this.handleAnalyzeCommand(commandArgs);
          break;
          
        case 'generate':
          await this.handleGenerateCommand(commandArgs);
          break;
          
        case 'config':
          await this.handleConfigCommand(commandArgs);
          break;
          
        default:
          // Try to find a plugin that handles this command
          await this.executePluginCommand(command, commandArgs);
          break;
      }
    } catch (error) {
      console.error(colorize('❌ Error:', colors.red), error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Shows main help information
   */
  showHelp() {
    console.log(colorize('\n🔗 Revolutionary Way To Serve Up React Apps CLI', colors.cyan));
    console.log(colorize('🛠️  Unified Tool with Plugin System', colors.blue));
    console.log(colorize('=' .repeat(60), colors.white));
    
    console.log(colorize('\n📋 USAGE:', colors.yellow));
    console.log(colorize('   rwtra-cli <command> [options]', colors.white));
    
    console.log(colorize('\n🚀 CORE COMMANDS:', colors.green));
    console.log(colorize('   analyze        Run analysis plugins', colors.white));
    console.log(colorize('   generate       Run generation plugins', colors.white));
    console.log(colorize('   config         Manage configuration', colors.white));
    console.log(colorize('   plugins        Manage plugins', colors.white));
    
    console.log(colorize('\n🔌 PLUGIN COMMANDS:', colors.magenta));
    const plugins = this.pluginRegistry.getPlugins();
    for (const plugin of plugins) {
      console.log(colorize(`   ${plugin.name.padEnd(15)} ${plugin.description}`, colors.white));
    }
    
    console.log(colorize('\n⚙️  OPTIONS:', colors.yellow));
    console.log(colorize('   --help, -h     Show this help message', colors.white));
    console.log(colorize('   --version, -v  Show version information', colors.white));
    console.log(colorize('   --debug        Enable debug output', colors.white));
    
    console.log(colorize('\n📚 EXAMPLES:', colors.cyan));
    console.log(colorize('   rwtra-cli analyze --all', colors.white));
    console.log(colorize('   rwtra-cli dependency-analyze', colors.white));
    console.log(colorize('   rwtra-cli coverage-report --docs', colors.white));
    console.log(colorize('   rwtra-cli plugins list', colors.white));
    
    console.log(colorize('\n🔍 PLUGINS:', colors.blue));
    console.log(colorize('   Use "rwtra-cli plugins list" to see all available plugins', colors.white));
  }

  /**
   * Shows version information
   */
  showVersion() {
    const packageJson = this.loadPackageJson();
    console.log(colorize('🔗 RWTRA CLI', colors.cyan));
    console.log(colorize(`Version: ${packageJson.version || '1.0.0'}`, colors.white));
    console.log(colorize(`Plugins: ${this.pluginRegistry.getPluginCount()}`, colors.green));
  }

  /**
   * Handles plugin-related commands
   */
  async handlePluginsCommand(args) {
    const subCommand = args[0] || 'list';
    
    switch (subCommand) {
      case 'list':
        this.listPlugins();
        break;
        
      case 'info':
        await this.showPluginInfo(args[1]);
        break;
        
      case 'reload':
        await this.reloadPlugins();
        break;
        
      default:
        console.error(colorize(`❌ Unknown plugins command: ${subCommand}`, colors.red));
        console.log(colorize('Available: list, info, reload', colors.yellow));
        process.exit(1);
    }
  }

  /**
   * Handles analysis commands
   */
  async handleAnalyzeCommand(args) {
    const options = this.parseArgs(args);
    
    if (options.all) {
      await this.runAllAnalysisPlugins(options);
    } else {
      console.error(colorize('❌ Please specify analysis type or use --all', colors.red));
      console.log(colorize('Available: --all, --dependency, --interface, --coverage', colors.yellow));
      process.exit(1);
    }
  }

  /**
   * Handles generation commands
   */
  async handleGenerateCommand(args) {
    const options = this.parseArgs(args);
    
    if (options['api-stubs']) {
      await this.executePlugin('api-stubs', options);
    } else if (options.templates) {
      await this.executePlugin('template-generator', options);
    } else {
      console.error(colorize('❌ Please specify generation type', colors.red));
      console.log(colorize('Available: --api-stubs, --templates', colors.yellow));
      process.exit(1);
    }
  }

  /**
   * Handles configuration commands
   */
  async handleConfigCommand(args) {
    const subCommand = args[0] || 'show';
    
    switch (subCommand) {
      case 'show':
        this.configManager.showConfig();
        break;
        
      case 'set':
        if (args.length < 3) {
          console.error(colorize('❌ Usage: config set <key> <value>', colors.red));
          process.exit(1);
        }
        this.configManager.setConfig(args[1], args[2]);
        break;
        
      case 'reset':
        this.configManager.resetConfig();
        break;
        
      default:
        console.error(colorize(`❌ Unknown config command: ${subCommand}`, colors.red));
        console.log(colorize('Available: show, set, reset', colors.yellow));
        process.exit(1);
    }
  }

  /**
   * Lists all available plugins
   */
  listPlugins() {
    console.log(colorize('\n🔌 Available Plugins:', colors.cyan));
    console.log(colorize('=' .repeat(40), colors.white));
    
    const plugins = this.pluginRegistry.getPlugins();
    if (plugins.length === 0) {
      console.log(colorize('No plugins found.', colors.yellow));
      return;
    }
    
    for (const plugin of plugins) {
      const status = plugin.loaded ? colorize('✅', colors.green) : colorize('❌', colors.red);
      console.log(colorize(`${status} ${plugin.name.padEnd(20)} ${plugin.description}`, colors.white));
      console.log(colorize(`    Category: ${plugin.category}`, colors.gray));
      console.log(colorize(`    File: ${plugin.file}`, colors.gray));
      console.log();
    }
  }

  /**
   * Shows detailed information about a specific plugin
   */
  async showPluginInfo(pluginName) {
    const plugin = this.pluginRegistry.getPlugin(pluginName);
    
    if (!plugin) {
      console.error(colorize(`❌ Plugin not found: ${pluginName}`, colors.red));
      process.exit(1);
    }
    
    console.log(colorize(`\n🔌 Plugin: ${plugin.name}`, colors.cyan));
    console.log(colorize('=' .repeat(40), colors.white));
    console.log(colorize(`Description: ${plugin.description}`, colors.white));
    console.log(colorize(`Category: ${plugin.category}`, colors.white));
    console.log(colorize(`Version: ${plugin.version || '1.0.0'}`, colors.white));
    console.log(colorize(`Author: ${plugin.author || 'Unknown'}`, colors.white));
    console.log(colorize(`File: ${plugin.file}`, colors.white));
    console.log(colorize(`Status: ${plugin.loaded ? 'Loaded' : 'Not loaded'}`, colors.white));
    
    if (plugin.commands && plugin.commands.length > 0) {
      console.log(colorize('\n📋 Commands:', colors.yellow));
      for (const cmd of plugin.commands) {
        console.log(colorize(`   ${cmd.name.padEnd(15)} ${cmd.description}`, colors.white));
      }
    }
    
    if (plugin.dependencies && plugin.dependencies.length > 0) {
      console.log(colorize('\n🔗 Dependencies:', colors.magenta));
      for (const dep of plugin.dependencies) {
        console.log(colorize(`   - ${dep}`, colors.white));
      }
    }
  }

  /**
   * Reloads all plugins
   */
  async reloadPlugins() {
    console.log(colorize('🔄 Reloading plugins...', colors.yellow));
    await this.pluginRegistry.discoverPlugins(true);
    console.log(colorize(`✅ Reloaded ${this.pluginRegistry.getPluginCount()} plugins`, colors.green));
  }

  /**
   * Runs all analysis plugins
   */
  async runAllAnalysisPlugins(options) {
    const analysisPlugins = this.pluginRegistry.getPluginsByCategory('analysis');
    
    if (analysisPlugins.length === 0) {
      console.log(colorize('No analysis plugins found.', colors.yellow));
      return;
    }
    
    console.log(colorize(`📊 Running ${analysisPlugins.length} analysis plugins...`, colors.blue));
    
    for (const plugin of analysisPlugins) {
      try {
        console.log(colorize(`\n🔌 Running ${plugin.name}...`, colors.magenta));
        await this.executePlugin(plugin.name, options);
      } catch (error) {
        console.error(colorize(`❌ Plugin ${plugin.name} failed:`, colors.red), error.message);
      }
    }
  }

  /**
   * Executes a specific plugin command
   */
  async executePluginCommand(command, args) {
    const options = this.parseArgs(args);
    await this.executePlugin(command, options);
  }

  /**
   * Executes a plugin with given options
   */
  async executePlugin(pluginName, options = {}) {
    const plugin = this.pluginRegistry.getPlugin(pluginName);
    
    if (!plugin) {
      console.error(colorize(`❌ Plugin not found: ${pluginName}`, colors.red));
      console.log(colorize('Use "rwtra-cli plugins list" to see available plugins', colors.yellow));
      process.exit(1);
    }
    
    if (!plugin.loaded) {
      await this.pluginRegistry.loadPlugin(plugin);
    }
    
    const context = {
      bootstrapPath: this.bootstrapPath,
      config: this.configManager.getConfig(),
      options: options,
      colors: colors
    };
    
    await plugin.execute(context);
  }

  /**
   * Parses command line arguments into options object
   */
  parseArgs(args) {
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const value = args[i + 1];
        
        if (value && !value.startsWith('--')) {
          options[key] = value;
          i++; // Skip the value
        } else {
          options[key] = true;
        }
      }
    }
    
    return options;
  }

  /**
   * Loads package.json for version info
   */
  loadPackageJson() {
    try {
      const packagePath = path.join(__dirname, '..', 'package.json');
      if (fs.existsSync(packagePath)) {
        return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      }
    } catch (error) {
      // Ignore errors
    }
    
    return { version: '1.0.0' };
  }
}

// CLI execution
if (require.main === module) {
  const cli = new RWTRACLI();
  cli.run().catch(error => {
    console.error(colorize('❌ CLI execution failed:', colors.red), error.message);
    process.exit(1);
  });
}

module.exports = RWTRACLI;
