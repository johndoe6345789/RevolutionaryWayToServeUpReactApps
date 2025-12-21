/**
 * Supplies dependency overrides for the dynamic modules loader.
 */
class DynamicModulesConfig {
  /**
   * Initializes a new Dynamic Modules Config instance with the provided configuration.
   */
  constructor({ dependencies, serviceRegistry, namespace } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
  }
}

module.exports = DynamicModulesConfig;
