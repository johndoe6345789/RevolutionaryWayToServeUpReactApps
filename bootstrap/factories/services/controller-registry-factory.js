const BaseFactory = require('../base-factory.js');
const ControllerRegistry = require('../../registries/controller-registry.js');

/**
 * Factory for creating ControllerRegistry instances.
 */
class ControllerRegistryFactory extends BaseFactory {
  /**
   * Creates a new ControllerRegistry instance.
   */
  create() {
    return new ControllerRegistry();
  }
}

module.exports = ControllerRegistryFactory;