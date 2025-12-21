const BaseFactory = require('../base-factory.js');
const BaseController = require('../controllers/base-controller.js');

/**
 * Factory for creating BaseController instances.
 */
class BaseControllerFactory extends BaseFactory {
  /**
   * Creates a new BaseController instance with the given config.
   */
  create(config = {}) {
    return new BaseController(config);
  }
}

module.exports = BaseControllerFactory;