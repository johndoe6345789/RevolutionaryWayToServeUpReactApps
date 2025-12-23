#!/usr/bin/env node

/**
 * BasePlugin - Foundation for all plugins in the codegen platform
 * Implements the Plugin interface contract from AGENTS.md
 * Enforces strict OO principles and plugin isolation
 */

class BasePlugin {
  constructor(config = {}) {
    // Single constructor parameter - config dataclass
    this.config = {
      name: config.name || 'unnamed-plugin',
      description: config.description || '',
      version: config.version || '1.0.0',
      author: config.author || '',
      category: config.category || 'general',
      commands: config.commands || [],
      dependencies: config.dependencies || [],
      ...config
    };

    // Plugin lifecycle state
    this.initialized = false;
    this.spec = null;
    this.messages = null;

    // Plugin metadata
    this.uuid = this._generateUUID();
    this.id = this.config.name;
    this.search = {
      title: this.config.name,
      summary: this.config.description,
      keywords: this.config.keywords || [],
      tags: this.config.tags || [],
      aliases: this.config.aliases || [],
      domain: this.config.domain || 'codegen',
      capabilities: this.config.capabilities || []
    };
  }

  /**
   * Initialize plugin resources and validate dependencies
   * @returns {Promise<void>}
   */
  async initialize() {
    this._ensureNotInitialized();

    try {
      // Load plugin specification
      await this._loadSpec();

      // Load plugin messages for i18n
      await this._loadMessages();

      // Validate plugin integrity
      this._validatePlugin();

      // Initialize plugin-specific resources
      await this._initializeResources();

      this._markInitialized();

    } catch (error) {
      throw new Error(`Plugin initialization failed: ${error.message}`);
    }
  }

  /**
   * Get the plugin's specification record
   * @returns {Promise<Object>} Plugin specification
   */
  async getSpec() {
    if (!this.spec) {
      await this._loadSpec();
    }
    return this.spec;
  }

  /**
   * Get plugin messages for internationalization
   * @returns {Promise<Object>} Plugin messages
   */
  async getMessages() {
    if (!this.messages) {
      await this._loadMessages();
    }
    return this.messages;
  }

  /**
   * Register this plugin's components with appropriate registries
   * @param {Object} registryManager - Registry manager instance
   * @returns {Promise<void>}
   */
  async register(registryManager) {
    this._ensureInitialized();

    // Register plugin itself
    registryManager.register('plugin', this.id, this);

    // Register spec if available
    if (this.spec) {
      // Determine appropriate registry based on plugin type
      const registryId = this._getRegistryForType(this.config.category);
      registryManager.register(registryId, this.spec.id, this.spec);
    }

    // Plugin-specific registration
    await this._registerComponents(registryManager);
  }

  /**
   * Execute plugin functionality
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution results
   */
  async execute(context) {
    this._ensureInitialized();

    // Single business method - execute plugin functionality
    return await this._executePlugin(context);
  }

  /**
   * Validate plugin integrity
   * @returns {void}
   */
  async validate() {
    this._ensureInitialized();

    const violations = [];

    // Check required fields
    if (!this.config.name) violations.push('Plugin name is required');
    if (!this.config.version) violations.push('Plugin version is required');
    if (!this.spec) violations.push('Plugin specification is required');

    // Check OO compliance
    if (!this.initialize) violations.push('initialize() method must be implemented');
    if (!this.getSpec) violations.push('getSpec() method must be implemented');
    if (!this.register) violations.push('register() method must be implemented');
    if (!this.execute) violations.push('execute() method must be implemented');

    // Check method limits (should only have these 4 public methods + lifecycle)
    const publicMethods = this._getPublicMethods();
    if (publicMethods.length > 7) { // initialize, getSpec, getMessages, register, execute, validate, shutdown
      violations.push(`Plugin has ${publicMethods.length} public methods (max 7 allowed)`);
    }

    if (violations.length > 0) {
      throw new Error(`Plugin validation failed: ${violations.join(', ')}`);
    }

    return true;
  }

  /**
   * Shutdown plugin and cleanup resources
   * @returns {Promise<void>}
   */
  async shutdown() {
    if (this.initialized) {
      await this._cleanupResources();
      this.initialized = false;
    }
  }

  /**
   * Get plugin status
   * @returns {Object} Plugin status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.config.name,
      version: this.config.version,
      category: this.config.category,
      initialized: this.initialized,
      hasSpec: !!this.spec,
      hasMessages: !!this.messages,
      uuid: this.uuid
    };
  }

  /**
   * Load plugin specification from spec.json
   * @returns {Promise<void>}
   */
  async _loadSpec() {
    // This would be implemented by subclasses or loaded from spec.json
    // For base implementation, create a minimal spec
    this.spec = {
      uuid: this.uuid,
      id: this.id,
      type: 'plugin',
      search: this.search,
      version: this.config.version,
      category: this.config.category,
      capabilities: this.config.capabilities
    };
  }

  /**
   * Load plugin messages for i18n
   * @returns {Promise<void>}
   */
  async _loadMessages() {
    // This would be implemented by subclasses or loaded from messages.json
    // For base implementation, provide empty messages
    this.messages = {};
  }

  /**
   * Validate plugin structure and requirements
   * @returns {void}
   */
  _validatePlugin() {
    // Validate UUID format
    if (!this._isValidUUID(this.uuid)) {
      throw new Error('Invalid UUID format');
    }

    // Validate required config fields
    if (!this.config.name || typeof this.config.name !== 'string') {
      throw new Error('Plugin name is required and must be a string');
    }

    // Validate version format (semver)
    if (!this._isValidVersion(this.config.version)) {
      throw new Error('Invalid version format (must be semver)');
    }
  }

  /**
   * Initialize plugin-specific resources
   * @returns {Promise<void>}
   */
  async _initializeResources() {
    // Override in subclasses for specific initialization
  }

  /**
   * Register plugin-specific components
   * @param {Object} registryManager - Registry manager
   * @returns {Promise<void>}
   */
  async _registerComponents(registryManager) {
    // Override in subclasses for specific registration
  }

  /**
   * Execute plugin-specific functionality
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Results
   */
  async _executePlugin(context) {
    // Override in subclasses - this is the single business method
    throw new Error('Plugin execute() method must be implemented by subclass');
  }

  /**
   * Cleanup plugin resources
   * @returns {Promise<void>}
   */
  async _cleanupResources() {
    // Override in subclasses for specific cleanup
  }

  /**
   * Get appropriate registry for plugin type
   * @param {string} type - Plugin type
   * @returns {string} Registry ID
   */
  _getRegistryForType(type) {
    const registryMap = {
      'tool': 'DevWorkflowRegistry',
      'language': 'LanguagesRegistry',
      'template': 'TemplatesRegistry',
      'profile': 'ProfilesRegistry'
    };

    return registryMap[type] || 'DevWorkflowRegistry';
  }

  /**
   * Get public methods of this plugin
   * @returns {Array<string>} Public method names
   */
  _getPublicMethods() {
    const prototype = Object.getPrototypeOf(this);
    const methods = Object.getOwnPropertyNames(prototype);

    return methods.filter(method => {
      // Exclude private methods (starting with _) and constructor
      return !method.startsWith('_') && method !== 'constructor';
    });
  }

  /**
   * Generate a UUID for the plugin
   * @returns {string} UUID v4
   */
  _generateUUID() {
    // Simple UUID v4 implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validate UUID format
   * @param {string} uuid - UUID to validate
   * @returns {boolean} True if valid
   */
  _isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate version format (semver)
   * @param {string} version - Version to validate
   * @returns {boolean} True if valid
   */
  _isValidVersion(version) {
    const semverRegex = /^\d+\.\d+\.\d+(-[\w\.\-]+)?(\+[\w\.\-]+)?$/;
    return semverRegex.test(version);
  }

  /**
   * Ensure plugin is not already initialized
   * @throws {Error} If already initialized
   */
  _ensureNotInitialized() {
    if (this.initialized) {
      throw new Error('Plugin already initialized');
    }
  }

  /**
   * Ensure plugin is initialized
   * @throws {Error} If not initialized
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }
  }

  /**
   * Mark plugin as initialized
   */
  _markInitialized() {
    this.initialized = true;
  }
}

module.exports = BasePlugin;
