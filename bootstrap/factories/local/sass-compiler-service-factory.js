const BaseFactory = require('../../interfaces/base-factory.js');
const SassCompilerService = require('../../services/local/sass-compiler-service.js');
const SassCompilerServiceConfig = require('../../configs/local/sass-compiler-service.js');

/**
 * Factory for creating SassCompilerService instances.
 */
class SassCompilerServiceFactory extends BaseFactory {
  /**
   * Creates a new SassCompilerService instance with the given config.
   */
  create(config = new SassCompilerServiceConfig()) {
    return new SassCompilerService(config);
  }
}

module.exports = SassCompilerServiceFactory;
