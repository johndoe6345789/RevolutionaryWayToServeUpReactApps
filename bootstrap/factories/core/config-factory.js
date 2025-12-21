const BaseFactory = require('../../interfaces/base-factory.js');

/**
 * ConfigFactory - Factory for creating configuration instances
 */
class ConfigFactory extends BaseFactory {
  /**
   * Creates a new ConfigFactory instance
   * @param {Object} [config={}] Configuration for the factory
   */
  constructor(config = {}) {
    super(config);
    this._registerDefaultConfigs();
  }

  /**
   * Registers default configuration types with the factory
   */
  _registerDefaultConfigs() {
    // Register common config types here
  }

  /**
   * Creates a config instance based on the provided type and options
   * @param {string} type The config type
   * @param {Object} options The config options
   * @returns {Object} The created config instance
   */
  createConfig(type, options = {}) {
    return this.create(type, options);
  }

  /**
   * Registers a config builder with the factory
   * @param {string} type The config type
   * @param {Function} builder The config builder function
   * @returns {ConfigFactory} The factory instance for chaining
   */
  registerConfig(type, builder) {
    return this.register(type, builder);
  }
}

module.exports = ConfigFactory;