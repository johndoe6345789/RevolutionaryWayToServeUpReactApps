const BaseFactory = require('../../interfaces/base-factory.js');
const ServiceRegistry = require('../../registries/service-registry.js');
const ServiceRegistryConfig = require('../../configs/services/service-registry.js');

/**
 * Factory for creating ServiceRegistry instances.
 */
class ServiceRegistryFactory extends BaseFactory {
  /**
   * Creates a new ServiceRegistry instance with the given config.
   */
  create(config = new ServiceRegistryConfig()) {
    return new ServiceRegistry(config);
  }
}

module.exports = ServiceRegistryFactory;
