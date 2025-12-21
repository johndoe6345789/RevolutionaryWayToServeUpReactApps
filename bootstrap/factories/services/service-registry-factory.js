const BaseFactory = require('../base-factory.js');
const ServiceRegistry = require('../../registries/service-registry.js');

/**
 * Factory for creating ServiceRegistry instances.
 */
class ServiceRegistryFactory extends BaseFactory {
  /**
   * Creates a new ServiceRegistry instance.
   */
  create() {
    return new ServiceRegistry();
  }
}

module.exports = ServiceRegistryFactory;