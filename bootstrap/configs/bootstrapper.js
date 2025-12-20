/**
 * Bundles the helpers that the bootstrapper needs to drive the runtime.
 */
class BootstrapperConfig {
  constructor({ configLoader, logging, network, moduleLoader }) {
    this.configLoader = configLoader;
    this.logging = logging;
    this.network = network;
    this.moduleLoader = moduleLoader;
  }
}

module.exports = BootstrapperConfig;
