/**
 * Abstract helper logic so derived helpers can share registry wiring.
 */
class BaseHelper {
  /**
   * Stores the helper configuration and tracks its lifecycle state.
   */
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
  }

  /**
   * Returns the configured helper registry instance.
   */
  _resolveHelperRegistry() {
    const registry = this.config.helperRegistry;
    if (!registry) {
      throw new Error(`HelperRegistry required for ${this.constructor.name}`);
    }
    return registry;
  }

  /**
   * Registers a helper or helper instance if it hasn't been registered yet.
   */
  _registerHelper(name, helperOrInstance, metadata = {}) {
    const registry = this._resolveHelperRegistry();
    if (!registry.isRegistered(name)) {
      registry.register(name, helperOrInstance, metadata);
    }
  }

  /**
   * Extension point for derived helpers to perform their registration work.
   */
  initialize() {
    throw new Error(`${this.constructor.name} must implement initialize()`);
  }
}

module.exports = BaseHelper;
