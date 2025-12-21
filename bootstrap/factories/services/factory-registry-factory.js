const BaseFactory = require('../../interfaces/base-factory.js');
const FactoryRegistry = require('../../registries/factory-registry.js');

/**
 * Factory for creating FactoryRegistry instances.
 */
class FactoryRegistryFactory extends BaseFactory {
  /**
   * Creates a new FactoryRegistry instance.
   */
  create() {
    return new FactoryRegistry();
  }
}

module.exports = FactoryRegistryFactory;