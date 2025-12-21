/**
 * Base Plugin Class
 * Abstract base class that all plugins must extend
 */

class BasePlugin {
  constructor(metadata = {}) {
    this.name = metadata.name || 'unknown';
    this.description = metadata.description || 'No description provided';
    this.version = metadata.version || '1.0.0';
    this.author = metadata.author || 'Unknown';
    this.category = metadata.category || 'utility';
    this.dependencies = metadata.dependencies || [];
    this.commands = metadata.commands || [];
    this.file = metadata.file || 'unknown';
    this.loaded = false;
    this.context = null;
  }

  /**
   * Initializes the plugin with execution context
   * @param {Object} context - Execution context containing paths, config, options
   */
  async initialize(context) {
    this.context = context;
    this.loaded = true;
  }

  /**
   * Main execution method that plugins must implement
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Plugin execution results
   */
  async execute(context) {
    throw new Error(`Plugin ${this.name} must implement execute() method`);
  }

  /**
   * Cleanup method called after plugin execution
   */
  async cleanup() {
    // Override in subclasses if cleanup is needed
  }

  /**
   * Validates that the plugin's dependencies are available
   * @param {PluginRegistry} registry - Plugin registry to check against
   * @returns {boolean} - True if all dependencies are satisfied
   */
  validateDependencies(registry) {
    for (const dep of this.dependencies) {
      if (!registry.hasPlugin(dep)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets plugin metadata
   * @returns {Object} - Plugin metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
      category: this.category,
      dependencies: this.dependencies,
      commands: this.commands,
      file: this.file,
      loaded: this.loaded
    };
  }

  /**
   * Logs a message with plugin context
   * @param {string} message - Message to log
   * @param {string} level - Log level (info, warn, error)
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.name}]`;
    
    switch (level) {
      case 'error':
        console.error(`${prefix} ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`);
        break;
      case 'info':
      default:
        console.log(`${prefix} ${message}`);
        break;
    }
  }

  /**
   * Utility method to colorize output (if context provides colors)
   * @param {string} text - Text to colorize
   * @param {string} color - Color name
   * @returns {string} - Colorized text
   */
  colorize(text, color) {
    if (!this.context || !this.context.colors) {
      return text;
    }
    
    const colors = this.context.colors;
    return `${color}${text}${colors.reset}`;
  }
}

module.exports = BasePlugin;
