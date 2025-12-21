/**
 * Comprehensive factory loader registration system.
 * Registers all factory loaders with the FactoryRegistry for complete dependency injection.
 */

const { registerBootstrapFactoryLoaders } = require('./bootstrap-factory-loaders.js');
const { registerCdnFactoryLoaders } = require('./cdn-factory-loaders.js');
const { registerLocalFactoryLoaders } = require('./local-factory-loaders.js');
const { registerServiceFactoryLoaders } = require('./service-factory-loaders.js');
const { registerCoreFactoryLoaders } = require('./core-factory-loaders.js');

/**
 * Registers all factory loaders with the FactoryRegistry.
 * This provides complete factory coverage for the bootstrap system.
 */
function registerAllFactoryLoaders() {
  // Register essential bootstrap factories
  registerBootstrapFactoryLoaders();
  
  // Register CDN service factories
  registerCdnFactoryLoaders();
  
  // Register local compilation factories
  registerLocalFactoryLoaders();
  
  // Register service infrastructure factories
  registerServiceFactoryLoaders();
  
  // Register core component factories
  registerCoreFactoryLoaders();
}

module.exports = {
  registerAllFactoryLoaders
};
