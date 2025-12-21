/**
 * Registers CDN-related factory loaders with the FactoryRegistry.
 * These factories handle network services, logging, and CDN provider management.
 */

const factoryRegistry = require('./factory-registry-instance.js');

/**
 * Registers CDN service factory loaders with the FactoryRegistry.
 * This enables lazy loading of CDN-specific services.
 */
function registerCdnFactoryLoaders() {
  // Register LoggingService factory loader
  factoryRegistry.registerLoader('loggingService', function() {
    const LoggingServiceFactory = require('../factories/cdn/logging-service-factory.js');
    return function(config) { return new LoggingServiceFactory().create(config); };
  }, { required: ['logEndpoint', 'logClient'] }, ['logEndpoint', 'logClient']);

  // Register NetworkProbeService factory loader
  factoryRegistry.registerLoader('networkProbeService', function() {
    const NetworkProbeServiceFactory = require('../factories/cdn/network-probe-service-factory.js');
    return function(config) { return new NetworkProbeServiceFactory().create(config); };
  }, { required: [] }, []);

  // Register NetworkProviderService factory loader
  factoryRegistry.registerLoader('networkProviderService', function() {
    const NetworkProviderServiceFactory = require('../factories/cdn/network-provider-service-factory.js');
    return function(config) { return new NetworkProviderServiceFactory().create(config); };
  }, { required: [] }, []);
}

module.exports = {
  registerCdnFactoryLoaders
};
