/**
 * Configuration for BaseBootstrapApp instances.
 * Provides bootstrap application initialization settings.
 */
class BaseBootstrapAppConfig {
  /**
   * Initializes a new Base Bootstrap App Config instance with the provided configuration.
   */
  constructor({
    enableLogging = true,
    enableNetwork = true,
    enableModuleLoader = true,
    autoInitialize = false,
    helperPaths = {
      logging: './cdn/logging.js',
      network: './cdn/network.js',
      moduleLoader: './entrypoints/module-loader.js'
    },
  } = {}) {
    this.enableLogging = enableLogging;
    this.enableNetwork = enableNetwork;
    this.enableModuleLoader = enableModuleLoader;
    this.autoInitialize = autoInitialize;
    this.helperPaths = helperPaths;
  }
}

module.exports = BaseBootstrapAppConfig;
