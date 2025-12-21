const BaseFactory = require('../base-factory.js');

/**
 * Base factory for creating configuration instances.
 */
class ConfigFactory extends BaseFactory {
  /**
   * Creates a new configuration instance with the given options.
   * @param {Object} options - Configuration options to pass to the constructor
   * @param {Function} ConfigClass - The configuration class to instantiate
   */
  create(options = {}, ConfigClass) {
    if (!ConfigClass) {
      throw new Error("ConfigClass is required for ConfigFactory");
    }
    return new ConfigClass(options);
  }
}

module.exports = ConfigFactory;