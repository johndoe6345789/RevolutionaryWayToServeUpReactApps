/**
 * Supplies dependency overrides for the dynamic modules loader.
 */
class DynamicModulesConfig {
  constructor({ dependencies, serviceRegistry, namespace } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
  }
}

module.exports = DynamicModulesConfig;
