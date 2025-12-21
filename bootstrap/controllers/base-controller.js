/**
 * Provides a lightweight lifecycle guard shared by bootstrap controllers.
 */
class BaseController {
  /**
   * Stores the provided configuration and tracks whether initialization has run.
   */
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
  }

  /**
   * Controllers must override this to perform their setup work.
   */
  initialize() {
    throw new Error(`${this.constructor.name} must implement initialize()`);
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
}

module.exports = BaseController;
