/**
 * Supplies dependency overrides for the dynamic modules loader.
 */
class DynamicModulesConfig {
  constructor({ dependencies, serviceRegistry } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = DynamicModulesConfig;
