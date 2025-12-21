const BaseFactory = require('../../interfaces/base-factory.js');
const Bootstrapper = require('../../controllers/bootstrapper.js');
const BootstrapperConfig = require('../../configs/core/bootstrapper.js');

/**
 * Factory for creating Bootstrapper instances.
 */
class BootstrapperFactory extends BaseFactory {
  /**
   * Creates a new Bootstrapper instance with the given config.
   */
  create(config = new BootstrapperConfig()) {
    return new Bootstrapper(config);
  }
}

module.exports = BootstrapperFactory;
