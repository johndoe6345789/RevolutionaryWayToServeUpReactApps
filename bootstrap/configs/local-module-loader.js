/**
 * Supplies overrides needed by the local module loader helpers.
 */
class LocalModuleLoaderConfig {
  constructor({ dependencies } = {}) {
    this.dependencies = dependencies;
  }
}

module.exports = LocalModuleLoaderConfig;
