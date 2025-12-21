/**
 * Provides the global overrides used when ensuring proxy mode is defined.
 */
class EnvInitializerConfig {
  /**
   * Initializes a new Env Initializer Config instance with the provided configuration.
   */
  constructor({ global, serviceRegistry } = {}) {
    this.global = global;
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = EnvInitializerConfig;
