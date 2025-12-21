/**
 * Provides a lifecycle stub that other bootstrap services can extend.
 */
class BaseService {
  /**
   * Stores the service configuration and tracks whether `initialize` has run.
   */
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
  }

  /**
   * Subclasses must override this to perform setup before the service is registered.
   */
  initialize() {
    throw new Error(`${this.constructor.name} must implement initialize()`);
  }

  /**
   * Throws if the service lifecycle already recorded an initialization.
   */
  _ensureNotInitialized() {
    if (this.initialized) {
      throw new Error(`${this.constructor.name} already initialized`);
    }
  }

  /**
   * Records that initialization has completed.
   */
  _markInitialized() {
    this.initialized = true;
  }

  /**
   * Throws when the service is used before `initialize` runs.
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error(`${this.constructor.name} not initialized`);
    }
  }

  /**
   * Resolves the configured `ServiceRegistry` or fails fast when it is missing.
   */
  _requireServiceRegistry() {
    const registry = this.config.serviceRegistry;
    if (!registry) {
      throw new Error(`ServiceRegistry required for ${this.constructor.name}`);
    }
    return registry;
  }

  /**
   * Ensures a namespace exists on the config before returning it.
   */
  _resolveNamespace() {
    const namespace = this.config.namespace;
    if (!namespace) {
      throw new Error(`Namespace required for ${this.constructor.name}`);
    }
    return namespace;
  }
}

module.exports = BaseService;
