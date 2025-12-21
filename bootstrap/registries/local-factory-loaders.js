/**
 * Registers local compilation factory loaders with the FactoryRegistry.
 * These factories handle local compilation services like SASS and TSX.
 */

const factoryRegistry = require('./factory-registry-instance.js');

/**
 * Registers local service factory loaders with the FactoryRegistry.
 * This enables lazy loading of compilation-specific services.
 */
function registerLocalFactoryLoaders() {
  // Register SassCompilerService factory loader
  factoryRegistry.registerLoader('sassCompilerService', function() {
    const SassCompilerServiceFactory = require('../factories/local/sass-compiler-service-factory.js');
    return function(config) { return new SassCompilerServiceFactory().create(config); };
  }, { required: [] }, []);

  // Register TsxCompilerService factory loader
  factoryRegistry.registerLoader('tsxCompilerService', function() {
    const TsxCompilerServiceFactory = require('../factories/local/tsx-compiler-service-factory.js');
    return function(config) { return new TsxCompilerServiceFactory().create(config); };
  }, { required: [] }, []);
}

module.exports = {
  registerLocalFactoryLoaders
};
