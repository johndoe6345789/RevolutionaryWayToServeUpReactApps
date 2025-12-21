const BaseFactory = require('../../interfaces/base-factory.js');
const TsxCompilerService = require('../../services/local/tsx-compiler-service.js');
const TsxCompilerServiceConfig = require('../../configs/local/tsx-compiler-service.js');

/**
 * Factory for creating TsxCompilerService instances.
 */
class TsxCompilerServiceFactory extends BaseFactory {
  /**
   * Creates a new TsxCompilerService instance with the given config.
   */
  create(config = new TsxCompilerServiceConfig()) {
    return new TsxCompilerService(config);
  }
}

module.exports = TsxCompilerServiceFactory;
