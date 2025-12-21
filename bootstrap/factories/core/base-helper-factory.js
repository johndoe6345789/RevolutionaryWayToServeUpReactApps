const BaseFactory = require('./base-factory.js');
const BaseHelper = require('../helpers/base-helper.js');

/**
 * Factory for creating BaseHelper instances.
 */
class BaseHelperFactory extends BaseFactory {
  /**
   * Creates a new BaseHelper instance with the given config.
   */
  create(config = {}) {
    return new BaseHelper(config);
  }
}

module.exports = BaseHelperFactory;