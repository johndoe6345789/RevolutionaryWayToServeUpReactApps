/**
 * Base Command Class
 * Abstract base class for all CLI commands
 */

class BaseCommand {
  /**
   * Creates a new command instance
   * @param {Object} context - Command context
   * @param {Object} context.pluginRegistry - Plugin registry instance
   * @param {Object} context.languageRegistry - Language registry instance
   * @param {Object} context.configManager - Config manager instance
   * @param {Object} context.colors - Color utilities
   */
  constructor(context) {
    this.pluginRegistry = context.pluginRegistry;
    this.languageRegistry = context.languageRegistry;
    this.configManager = context.configManager;
    this.colors = context.colors;
    this.projectPath = context.projectPath;
  }

  /**
   * Executes the command
   * @param {Array} args - Command arguments
   * @returns {Promise<void>}
   */
  async execute(args) {
    throw new Error('execute method must be implemented by subclass');
  }

  /**
   * Shows command help
   */
  showHelp() {
    console.log(`${this.colors.cyan}Command: ${this.getName()}${this.colors.reset}`);
    console.log(`${this.colors.white}Description: ${this.getDescription()}${this.colors.reset}`);
    console.log(`${this.colors.yellow}Usage: ${this.getUsage()}${this.colors.reset}`);
  }

  /**
   * Gets command name
   * @returns {string} - Command name
   */
  getName() {
    throw new Error('getName method must be implemented by subclass');
  }

  /**
   * Gets command description
   * @returns {string} - Command description
   */
  getDescription() {
    throw new Error('getDescription method must be implemented by subclass');
  }

  /**
   * Gets command usage
   * @returns {string} - Command usage
   */
  getUsage() {
    return `dev-cli ${this.getName()} [options]`;
  }

  /**
   * Validates command arguments
   * @param {Array} args - Command arguments
   * @returns {boolean} - True if valid
   */
  validateArgs(args) {
    return true; // Default implementation
  }

  /**
   * Shows error message
   * @param {string} message - Error message
   */
  showError(message) {
    console.error(`${this.colors.red}❌ Error:${this.colors.reset}`, message);
  }

  /**
   * Shows success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    console.log(`${this.colors.green}✅${this.colors.reset}`, message);
  }

  /**
   * Shows warning message
   * @param {string} message - Warning message
   */
  showWarning(message) {
    console.log(`${this.colors.yellow}⚠️${this.colors.reset}`, message);
  }

  /**
   * Shows info message
   * @param {string} message - Info message
   */
  showInfo(message) {
    console.log(`${this.colors.blue}ℹ️${this.colors.reset}`, message);
  }

  /**
   * Executes a plugin with given options
   * @param {string} pluginName - Plugin name
   * @param {Object} options - Plugin options
   * @returns {Promise<Object>} - Plugin execution results
   */
  async executePlugin(pluginName, options = {}) {
    const plugin = this.pluginRegistry.getPlugin(pluginName);
    
    if (!plugin) {
      this.showError(`Plugin not found: ${pluginName}`);
      console.log(`${this.colors.yellow}Use "dev-cli plugins list" to see available plugins${this.colors.reset}`);
      process.exit(1);
    }
    
    if (!plugin.loaded) {
      await this.pluginRegistry.loadPlugin(plugin);
    }
    
    const context = {
      projectPath: this.projectPath,
      config: this.configManager.getConfig(),
      options: options,
      colors: this.colors,
      languageRegistry: this.languageRegistry
    };
    
    return await plugin.execute(context);
  }
}

module.exports = BaseCommand;
