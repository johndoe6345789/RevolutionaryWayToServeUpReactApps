const BaseFactory = require('./base-factory.js');

/**
 * ServiceFactory - Factory for creating service instances
 */
class ServiceFactory extends BaseFactory {
  /**
   * Creates a new ServiceFactory instance
   * @param {Object} [config={}] Configuration for the factory
   */
  constructor(config = {}) {
    super(config);
    this._registerDefaultServices();
  }

  /**
   * Registers default services with the factory
   */
  _registerDefaultServices() {
    // Register common service types here
  }

  /**
   * Creates a service instance based on the provided type and config
   * @param {string} type The service type
   * @param {Object} config The service configuration
   * @returns {Object} The created service instance
   */
  createService(type, config = {}) {
    return this.create(type, config);
  }

  /**
   * Registers a service builder with the factory
   * @param {string} type The service type
   * @param {Function} builder The service builder function
   * @returns {ServiceFactory} The factory instance for chaining
   */
  registerService(type, builder) {
    return this.register(type, builder);
  }
}

module.exports = ServiceFactory;