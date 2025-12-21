const ControllerRegistry = require("../registries/controller-registry.js");

/**
 * Provides a base class for controllers with registry integration.
 */
class BaseRegisteredController {
  /**
   * Stores the provided configuration and tracks whether initialization has run.
   */
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
    this.controllerRegistry = this._requireControllerRegistry();
  }

  /**
   * Controllers must override this to perform their setup work.
   */
  initialize() {
    throw new Error(`${this.constructor.name} must implement initialize()`);
  }

  /**
   * Registers the controller in the controller registry.
   */
  register(name, metadata, requiredServices) {
    this.controllerRegistry.register(name, this, metadata, requiredServices);
  }

  /**
   * Resolves the configured `ControllerRegistry` or fails fast when it is missing.
   */
  _requireControllerRegistry() {
    const registry = this.config.controllerRegistry;
    if (!registry) {
      throw new Error(`ControllerRegistry required for ${this.constructor.name}`);
    }
    return registry;
  }

  /**
   * Throws if initialization already ran for this controller.
   */
  _ensureNotInitialized() {
    if (this.initialized) {
      throw new Error(`${this.constructor.name} already initialized`);
    }
  }

  /**
   * Marks the controller as initialized.
   */
  _markInitialized() {
    this.initialized = true;
  }

  /**
   * Throws when the controller is used before initialize() completed.
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error(`${this.constructor.name} not initialized`);
    }
  }

  /**
   * Gets the initialization status.
   * @returns True if initialized, false otherwise
   */
  get isInitialized() {
    return this.initialized;
  }

  /**
   * Gets the configuration object.
   * @returns The configuration object
   */
  get configuration() {
    return this.config;
  }
}

module.exports = BaseRegisteredController;
