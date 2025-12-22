const { getStringService } = require('../../string/string-service');

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
    const strings = getStringService();
    throw new Error(strings.getError('this_constructor_name_must_implement_initialize', { constructorName: this.constructor.name }));
  }

  /**
   * Throws if the service lifecycle already recorded an initialization.
   */
  _ensureNotInitialized() {
    if (this.initialized) {
      const strings = getStringService();
      throw new Error(strings.getError('this_constructor_name_already_initialized', { constructorName: this.constructor.name }));
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
      const strings = getStringService();
      throw new Error(strings.getError('this_constructor_name_not_initialized', { constructorName: this.constructor.name }));
    }
  }

  /**
   * Resolves the configured `ServiceRegistry` or fails fast when it is missing.
   */
  _requireServiceRegistry() {
    const registry = this.config.serviceRegistry;
    if (!registry) {
      const strings = getStringService();
      throw new Error(strings.getError('serviceregistry_required_for_this_constructor_n', { constructorName: this.constructor.name }));
    }
    return registry;
  }

  /**
   * Ensures a namespace exists on the config before returning it.
   */
  _resolveNamespace() {
    const namespace = this.config.namespace;
    if (!namespace) {
      const strings = getStringService();
      throw new Error(strings.getError('namespace_required_for_this_constructor_name', { constructorName: this.constructor.name }));
    }
    return namespace;
  }
}

module.exports = BaseService;
