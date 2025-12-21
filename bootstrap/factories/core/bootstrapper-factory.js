const BaseFactory = require('../base-factory.js');
const Bootstrapper = require('../../controllers/bootstrapper.js');

/**
 * Factory for creating Bootstrapper instances.
 */
class BootstrapperFactory extends BaseFactory {
  /**
   * Creates a new Bootstrapper instance with the given config.
   */
  create(config = {}) {
    return new Bootstrapper(config);
  }
}

module.exports = BootstrapperFactory;