/**
 * Provides the global overrides used when ensuring proxy mode is defined.
 */
class EnvInitializerConfig {
  constructor({ global, serviceRegistry } = {}) {
    this.global = global;
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = EnvInitializerConfig;
