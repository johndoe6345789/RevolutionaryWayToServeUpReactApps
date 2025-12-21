/**
 * Bundles the helpers that the bootstrapper needs to drive the runtime.
 */
class BootstrapperConfig {
  /**
   * Initializes a new Bootstrapper Config instance with the provided configuration.
   */
  constructor({ configLoader, logging, network, moduleLoader }) {
    this.configLoader = configLoader;
    this.logging = logging;
    this.network = network;
    this.moduleLoader = moduleLoader;
  }
}

module.exports = BootstrapperConfig;
