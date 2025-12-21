const BaseFactory = require('../../interfaces/base-factory.js');
const BaseEntryPoint = require('../../interfaces/base-entrypoint.js');

/**
 * Factory for creating BaseEntryPoint instances.
 */
class BaseEntryPointFactory extends BaseFactory {
  /**
   * Creates a new BaseEntryPoint instance with the given options.
   */
  create(options = {}) {
    return new BaseEntryPoint(options);
  }
}

module.exports = BaseEntryPointFactory;