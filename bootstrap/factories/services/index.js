// Services factories index
const BaseServiceFactory = require('./base-service-factory.js');
const ServiceRegistryFactory = require('./service-registry-factory.js');
const ControllerRegistryFactory = require('./controller-registry-factory.js');
const FactoryRegistryFactory = require('./factory-registry-factory.js');
const HelperRegistryFactory = require('./helper-registry-factory.js');
const LoggingManagerFactory = require('./logging-manager-factory.js');
const ModuleLoaderServiceFactory = require('./module-loader-service-factory.js');

module.exports = {
  BaseServiceFactory,
  ServiceRegistryFactory,
  ControllerRegistryFactory,
  FactoryRegistryFactory,
  HelperRegistryFactory,
  LoggingManagerFactory,
  ModuleLoaderServiceFactory
};