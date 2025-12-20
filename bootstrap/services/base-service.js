/**
 * Provides a lifecycle stub that other bootstrap services can extend.
 */
class BaseService {
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
  }

  _ensureNotInitialized() {
    if (this.initialized) {
      throw new Error(`${this.constructor.name} already initialized`);
    }
  }

  _markInitialized() {
    this.initialized = true;
  }

  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error(`${this.constructor.name} not initialized`);
    }
  }

  _requireServiceRegistry() {
    const registry = this.config.serviceRegistry;
    if (!registry) {
      throw new Error(`ServiceRegistry required for ${this.constructor.name}`);
    }
    return registry;
  }

  _resolveNamespace() {
    const namespace = this.config.namespace;
    if (!namespace) {
      throw new Error(`Namespace required for ${this.constructor.name}`);
    }
    return namespace;
  }
}

module.exports = BaseService;
