const EntrypointRegistry = require("../registries/entrypoint-registry.js");

/**
 * Provides a base class for entrypoints with registry integration.
 */
class BaseRegisteredEntrypoint {
  /**
   * Stores the provided configuration and tracks whether initialization has run.
   */
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
    this.entrypointRegistry = this._requireEntrypointRegistry();
  }

  /**
   * Entrypoints must override this to perform their setup work.
   */
  run() {
    throw new Error(`${this.constructor.name} must implement run()`);
  }

  /**
   * Registers the entrypoint in the entrypoint registry.
   */
  register(name, metadata, requiredServices) {
    this.entrypointRegistry.register(name, this, metadata, requiredServices);
  }

  /**
   * Resolves the configured `EntrypointRegistry` or fails fast when it is missing.
   */
  _requireEntrypointRegistry() {
    const registry = this.config.entrypointRegistry;
    if (!registry) {
      throw new Error(`EntrypointRegistry required for ${this.constructor.name}`);
    }
    return registry;
  }

  /**
   * Throws if initialization already ran for this entrypoint.
   */
  _ensureNotInitialized() {
    if (this.initialized) {
      throw new Error(`${this.constructor.name} already initialized`);
    }
  }

  /**
   * Marks the entrypoint as initialized.
   */
  _markInitialized() {
    this.initialized = true;
  }

  /**
   * Throws when the entrypoint is used before run() completed.
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error(`${this.constructor.name} not initialized`);
    }
  }
}

module.exports = BaseRegisteredEntrypoint;