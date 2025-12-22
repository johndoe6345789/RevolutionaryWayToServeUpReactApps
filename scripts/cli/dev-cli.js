#!/usr/bin/env node

/**
 * DEV CLI - Development Command Line Interface
 * Generic tool with language plugin system for managing analysis and generation tools
 */

const path = require('path');

// Import refactored components
const PluginRegistry = require('../lib/registry/plugin-registry');
const LanguageRegistry = require('../lib/registry/language-registry');
const ConfigManager = require('../lib/config/config-manager');

// Import commands
const HelpCommand = require('./commands/help-command');
const VersionCommand = require('./commands/version-command');
const LanguagesCommand = require('./commands/languages-command');
const PluginsCommand = require('./commands/plugins-command');
const AnalyzeCommand = require('./commands/analyze-command');
const GenerateCommand = require('./commands/generate-command');
const ConfigCommand = require('./commands/config-command');

// Import utilities
const { colors, colorize } = require('./utils/color-utils');
const { parseArgs, showError } = require('./utils/cli-utils');

class DEVCLI {
  constructor() {
    this.pluginRegistry = new PluginRegistry();
    this.languageRegistry = new LanguageRegistry();
    this.configManager = new ConfigManager();
    this.projectPath = process.cwd();
    
    // Command registry
    this.commands = new Map([
      ['help', new HelpCommand(this.createContext())],
      ['version', new VersionCommand(this.createContext())],
      ['languages', new LanguagesCommand(this.createContext())],
      ['plugins', new PluginsCommand(this.createContext())],
      ['analyze', new AnalyzeCommand(this.createContext())],
      ['generate', new GenerateCommand(this.createContext())],
      ['config', new ConfigCommand(this.createContext())]
    ]);
  }

  /**
   * Creates command context
   * @returns {Object} - Command context
   */
  createContext() {
    return {
      pluginRegistry: this.pluginRegistry,
      languageRegistry: this.languageRegistry,
      configManager: this.configManager,
      colors: colors,
      projectPath: this.projectPath
    };
  }

  /**
   * Main entry point for the CLI
   */
  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      await this.showHelp();
      return;
    }

    const command = this.parseCommand(args[0]);
    const commandArgs = args.slice(1);

    try {
      // Initialize systems
      await this.languageRegistry.discoverLanguages();
      await this.pluginRegistry.discoverPlugins();
      
      // Auto-detect project languages
      await this.detectProjectLanguages();
      
      // Route to appropriate handler
      if (this.commands.has(command)) {
        await this.commands.get(command).execute(commandArgs);
      } else {
        // Try to find a plugin that handles this command
        await this.executePluginCommand(command, commandArgs);
      }
      
    } catch (error) {
      showError(error.message, true);
      process.exit(1);
    }
  }

  /**
   * Parses command name (handles aliases)
   * @param {string} command - Raw command
   * @returns {string} - Normalized command name
   */
  parseCommand(command) {
    const aliases = {
      '-h': 'help',
      '--help': 'help',
      'help': 'help',
      '-v': 'version',
      '--version': 'version',
      'version': 'version'
    };
    
    return aliases[command] || command;
  }

  /**
   * Auto-detect project languages
   */
  async detectProjectLanguages() {
    const detectedLanguages = await this.languageRegistry.detectLanguages(this.projectPath);
    
    if (detectedLanguages.length > 0) {
      console.log(colorize(`🔍 Detected project languages: ${detectedLanguages.join(', ')}`, colors.cyan));
      
      // Load language-specific plugins
      for (const language of detectedLanguages) {
        await this.pluginRegistry.loadLanguagePlugins(language);
      }
    } else {
      console.log(colorize('⚠️  No specific languages detected, using generic plugins only', colors.yellow));
    }
  }

  /**
   * Shows main help information
   */
  async showHelp() {
    const helpCommand = this.commands.get('help');
    await helpCommand.execute([]);
  }

  /**
   * Executes a plugin command
   * @param {string} command - Command name
   * @param {Array} args - Command arguments
   */
  async executePluginCommand(command, args) {
    const options = parseArgs(args);
    
    const plugin = this.pluginRegistry.getPlugin(command);
    if (plugin) {
      const context = this.createContext();
      context.options = options;
      await plugin.execute(context);
    } else {
      showError(`Unknown command: ${command}`);
      console.log(colorize('Use "dev-cli help" to see available commands', colors.yellow));
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const cli = new DEVCLI();
  cli.run().catch(error => {
    showError(`CLI execution failed: ${error.message}`, true);
    process.exit(1);
  });
}

module.exports = DEVCLI;
