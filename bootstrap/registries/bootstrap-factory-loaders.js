/**
 * Registers only the essential factory loaders needed by BootstrapApp.
 * This is a minimal set focused on what's actually used, avoiding unnecessary factory overhead.
 */

const factoryRegistry = require('./factory-registry-instance.js');

/**
 * Registers only the essential factory loaders with the FactoryRegistry.
 * This enables lazy loading of only the factories that BootstrapApp actually uses.
 */
function registerBootstrapFactoryLoaders() {
  // Register LoggingManager factory loader
  factoryRegistry.registerLoader('loggingManager', function() {
    const LoggingManagerFactory = require('../factories/services/logging-manager-factory.js');
    return function(config) { return new LoggingManagerFactory().create(config); };
  }, {}, []);

  // Register Bootstrapper factory loader
  factoryRegistry.registerLoader('bootstrapper', function() {
    const BootstrapperFactory = require('../factories/core/bootstrapper-factory.js');
    return function(config) { return new BootstrapperFactory().create(config); };
  }, {}, []);
}

module.exports = {
  registerBootstrapFactoryLoaders
};
