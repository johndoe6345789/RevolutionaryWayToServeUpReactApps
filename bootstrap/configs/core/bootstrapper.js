/**
 * Bundles the helpers that the bootstrapper needs to drive the runtime.
 */
class BootstrapperConfig {
  /**
   * Initializes a new Bootstrapper Config instance with the provided configuration.
   */
  constructor({
    configUrl = "config.json",
    fetch: configFetch,
    logging,
    network,
    moduleLoader,
    controllerRegistry,
  } = {}) {
    this.configUrl = configUrl;
    this.fetch = configFetch;
    this.logging = logging;
    this.network = network;
    this.moduleLoader = moduleLoader;
    this.controllerRegistry = controllerRegistry;
  }
}

module.exports = BootstrapperConfig;
