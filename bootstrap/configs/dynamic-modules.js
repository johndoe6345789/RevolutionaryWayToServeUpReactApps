/**
 * Supplies dependency overrides for the dynamic modules loader.
 */
class DynamicModulesConfig {
  constructor({ dependencies } = {}) {
    this.dependencies = dependencies;
  }
}

module.exports = DynamicModulesConfig;
