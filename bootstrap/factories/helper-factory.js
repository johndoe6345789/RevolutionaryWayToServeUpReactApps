const BaseFactory = require('./base-factory.js');

/**
 * HelperFactory - Factory for creating helper instances
 */
class HelperFactory extends BaseFactory {
  /**
   * Creates a new HelperFactory instance
   * @param {Object} [config={}] Configuration for the factory
   */
  constructor(config = {}) {
    super(config);
    this._registerDefaultHelpers();
  }

  /**
   * Registers default helper types with the factory
   */
  _registerDefaultHelpers() {
    // Register common helper types here
  }

  /**
   * Creates a helper instance based on the provided type and config
   * @param {string} type The helper type
   * @param {Object} config The helper configuration
   * @returns {Object} The created helper instance
   */
  createHelper(type, config = {}) {
    return this.create(type, config);
  }

  /**
   * Registers a helper builder with the factory
   * @param {string} type The helper type
   * @param {Function} builder The helper builder function
   * @returns {HelperFactory} The factory instance for chaining
   */
  registerHelper(type, builder) {
    return this.register(type, builder);
  }
}

module.exports = HelperFactory;