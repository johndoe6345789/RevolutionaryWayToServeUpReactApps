const BaseFactory = require('../base-factory.js');
const BaseService = require('../../services/base-service.js');

/**
 * Factory for creating BaseService instances.
 */
class BaseServiceFactory extends BaseFactory {
  /**
   * Creates a new BaseService instance with the given config.
   */
  create(config = {}) {
    return new BaseService(config);
  }
}

module.exports = BaseServiceFactory;