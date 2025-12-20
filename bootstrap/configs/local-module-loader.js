/**
 * Supplies overrides needed by the local module loader helpers.
 */
class LocalModuleLoaderConfig {
  constructor({ dependencies, serviceRegistry } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = LocalModuleLoaderConfig;
