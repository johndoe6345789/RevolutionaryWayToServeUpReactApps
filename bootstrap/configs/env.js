/**
 * Provides the global overrides used when ensuring proxy mode is defined.
 */
class EnvInitializerConfig {
  constructor({ global } = {}) {
    this.global = global;
  }
}

module.exports = EnvInitializerConfig;
