const BaseFactory = require('../base-factory.js');
const HelperRegistry = require('../../registries/helper-registry.js');

/**
 * Factory for creating HelperRegistry instances.
 */
class HelperRegistryFactory extends BaseFactory {
  /**
   * Creates a new HelperRegistry instance.
   */
  create() {
    return new HelperRegistry();
  }
}

module.exports = HelperRegistryFactory;