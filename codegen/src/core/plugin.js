/**
 * Plugin - AGENTS.md compliant plugin base class
 * Implements plugin contract: initialise, getSpec, register
 */

const BaseComponent = require('./base-component');

class Plugin extends BaseComponent {
  /**
   * Constructor with single spec parameter (AGENTS.md requirement)
   * @param {Object} spec - Plugin specification
   */
  constructor(spec) {
    super(spec);
    this.initialised = false;
    this.specCache = null;
  }

  /**
   * Initialise plugin (plugin contract method, ≤10 lines)
   * @returns {Promise<Plugin>} Initialised plugin
   */
  async initialise() {
    await super.initialise();
    this.initialised = true;
    this.log(`Plugin ${this.id} initialised`);
    return this;
  }

  /**
   * Get plugin specification (plugin contract method, ≤10 lines)
   * @returns {Object} Plugin specification
   */
  getSpec() {
    if (!this.specCache) {
      // Load spec from filesystem or embedded data
      this.specCache = this._loadSpec();
    }
    return this.specCache;
  }

  /**
   * Register with registry manager (plugin contract method, ≤10 lines)
   * @param {Object} registryManager - Registry manager instance
   */
  async register(registryManager) {
    if (!this.initialised) {
      await this.initialise();
    }

    const spec = this.getSpec();
    if (spec) {
      registryManager.register(this.id, spec);
      this.log(`Plugin ${this.id} registered`);
    }
  }

  /**
   * Execute plugin (extended from base, ≤10 lines)
   * @param {Object} context - Execution context
   * @returns {Object} Execution result
   */
  async execute(context) {
    if (!this.initialised) {
      await this.initialise();
    }

    return {
      success: true,
      plugin: this.id,
      timestamp: new Date().toISOString(),
      output: {}
    };
  }

  /**
   * Load plugin specification (protected method, ≤10 lines)
   * @returns {Object} Plugin specification
   */
  _loadSpec() {
    // Default implementation - override in subclasses
    return this.spec;
  }

  /**
   * Log plugin message (convenience method, ≤10 lines)
   * @param {string} message - Message to log
   * @param {string} level - Log level
   */
  log(message, level = 'info') {
    const prefix = `[${this.id}]`;
    console.log(`${prefix} ${message}`);
  }
}

module.exports = Plugin;
