/**
 * Base skeleton class for registered classes.
 * Provides common implementation of IRegisteredBase interface methods.
 */
class BaseRegistered {
  /**
   * Creates a new BaseRegistered instance with optional configuration.
   * @param config - Optional configuration object
   */
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
  }

  /**
   * Initializes the instance before it can be used.
   * @returns This instance for method chaining
   */
  initialize() {
    this._ensureNotInitialized();
    
    try {
      // Perform initialization
      this._performInitialization();
      
      this._markInitialized();
      return this;
      
    } catch (error) {
      throw new Error(`${this.constructor.name} initialization failed: ${error.message}`);
    }
  }

  /**
   * Template method for performing initialization logic.
   * Should be overridden by subclasses.
   * @protected
   */
  _performInitialization() {
    // Base implementation - override in subclasses
    this._log('Performing initialization...');
  }

  /**
   * Ensures the instance has not been initialized yet.
   * @throws Error if already initialized
   * @protected
   */
  _ensureNotInitialized() {
    if (this.initialized) {
      throw new Error(`${this.constructor.name} already initialized`);
    }
  }

  /**
   * Marks the instance as initialized.
   * @protected
   */
  _markInitialized() {
    this.initialized = true;
  }

  /**
   * Ensures the instance has been initialized before use.
   * @throws Error if not initialized
   * @protected
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error(`${this.constructor.name} not initialized`);
    }
  }

  /**
   * Gets the initialization status.
   * @returns True if initialized, false otherwise
   */
  get isInitialized() {
    return this.initialized;
  }

  /**
   * Gets the configuration object.
   * @returns The configuration object
   */
  get configuration() {
    return this.config;
  }

  /**
   * Updates the configuration after initialization.
   * @param newConfig - The new configuration to merge
   * @throws Error if not initialized
   */
  updateConfig(newConfig) {
    this._ensureInitialized();
    
    if (typeof newConfig === 'object' && newConfig !== null) {
      this.config = { ...this.config, ...newConfig };
    } else {
      throw new Error('Configuration must be a valid object');
    }
  }

  /**
   * Resets the instance to its initial state.
   */
  reset() {
    this.initialized = false;
    this._log('Instance reset to initial state');
  }

  /**
   * Gets a configuration value by key.
   * @param key - The configuration key
   * @param defaultValue - Default value if key doesn't exist
   * @returns The configuration value
   */
  getConfigValue(key, defaultValue = undefined) {
    return this.config.hasOwnProperty(key) ? this.config[key] : defaultValue;
  }

  /**
   * Sets a configuration value by key.
   * @param key - The configuration key
   * @param value - The value to set
   */
  setConfigValue(key, value) {
    this.config[key] = value;
  }

  /**
   * Validates the current configuration.
   * @throws Error if configuration is invalid
   * @protected
   */
  _validateConfig() {
    if (typeof this.config !== 'object' || this.config === null) {
      throw new Error('Configuration must be a valid object');
    }
  }

  /**
   * Logs a message for this instance.
   * @param message - The message to log
   * @param data - Optional additional data to log
   * @protected
   */
  _log(message, data) {
    if (this.config && this.config.logger) {
      this.config.logger(message, data);
    } else if (typeof console !== 'undefined' && console.log) {
      console.log(`${this.constructor.name}: ${message}`, data || '');
    }
  }

  /**
   * Gets status information about the instance.
   * @returns Object with instance status details
   */
  getStatus() {
    return {
      initialized: this.initialized,
      className: this.constructor.name,
      configKeys: Object.keys(this.config),
      hasConfig: Object.keys(this.config).length > 0
    };
  }

  /**
   * Creates a clone of this instance.
   * @returns A new instance with the same configuration
   */
  clone() {
    const ClonedClass = this.constructor;
    return new ClonedClass({ ...this.config });
  }

  /**
   * Merges additional configuration into the current configuration.
   * @param additional - Additional configuration to merge
   * @throws Error if not initialized
   */
  mergeConfig(additional) {
    this._ensureInitialized();
    
    if (typeof additional === 'object' && additional !== null) {
      this.config = { ...this.config, ...additional };
    } else {
      throw new Error('Additional configuration must be a valid object');
    }
  }
}

module.exports = BaseRegistered;
