const BaseFactory = require('./base-factory.js');
const ServiceFactory = require('./service-factory.js');
const ConfigFactory = require('./config-factory.js');
const HelperFactory = require('./helper-factory.js');

/**
 * GlobalFactory - Main factory instance for the application
 */
class GlobalFactory {
  /**
   * Creates a new GlobalFactory instance
   * @param {Object} [config={}] Configuration for the factory
   */
  constructor(config = {}) {
    // Initialize sub-factories
    this.services = new ServiceFactory(config.serviceConfig || {});
    this.configs = new ConfigFactory(config.configConfig || {});
    this.helpers = new HelperFactory(config.helperConfig || {});

    this._initializeSubFactories();
  }

  /**
   * Initializes the sub-factories with default builders
   */
  _initializeSubFactories() {
    // Add default builders to each sub-factory
  }

  /**
   * Creates an instance based on the category and type
   * @param {string} category The category (service, config, helper)
   * @param {string} type The type within the category
   * @param {...any} args Arguments to pass to the builder
   * @returns {any} The created instance
   */
  create(category, type, ...args) {
    switch (category) {
      case 'service':
        return this.services.createService(type, ...args);
      case 'config':
        return this.configs.createConfig(type, ...args);
      case 'helper':
        return this.helpers.createHelper(type, ...args);
      default:
        throw new Error(`Unknown category: ${category}. Valid categories: service, config, helper`);
    }
  }

  /**
   * Registers a builder for a specific category and type
   * @param {string} category The category (service, config, helper)
   * @param {string} type The type within the category
   * @param {Function} builder The builder function
   * @returns {GlobalFactory} The factory instance for chaining
   */
  register(category, type, builder) {
    switch (category) {
      case 'service':
        this.services.registerService(type, builder);
        break;
      case 'config':
        this.configs.registerConfig(type, builder);
        break;
      case 'helper':
        this.helpers.registerHelper(type, builder);
        break;
      default:
        throw new Error(`Unknown category: ${category}. Valid categories: service, config, helper`);
    }
    return this;
  }

  /**
   * Checks if a type is registered in the specified category
   * @param {string} category The category (service, config, helper)
   * @param {string} type The type within the category
   * @returns {boolean} True if the type is registered
   */
  has(category, type) {
    switch (category) {
      case 'service':
        return this.services.has(type);
      case 'config':
        return this.configs.has(type);
      case 'helper':
        return this.helpers.has(type);
      default:
        throw new Error(`Unknown category: ${category}. Valid categories: service, config, helper`);
    }
  }
}

// Export a singleton instance
const globalFactory = new GlobalFactory();

module.exports = {
  GlobalFactory,
  ServiceFactory,
  ConfigFactory,
  HelperFactory,
  factory: globalFactory
};