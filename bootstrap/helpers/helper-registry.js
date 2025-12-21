/**
 * Tracks reusable helper constructors so they can be shared across services.
 */
class HelperRegistry {
  /**
   * Initializes the registry storage for helper entries.
   */
  constructor() {
    this._helpers = new Map();
  }

  /**
   * Records a helper constructor/instance along with optional metadata.
   */
  register(name, helper, metadata = {}) {
    if (!name) {
      throw new Error("Helper name is required");
    }
    if (this._helpers.has(name)) {
      throw new Error("Helper already registered: " + name);
    }
    this._helpers.set(name, { helper, metadata });
  }

  /**
   * Returns the helper that was registered under the provided name.
   */
  getHelper(name) {
    const entry = this._helpers.get(name);
    return entry ? entry.helper : undefined;
  }

  /**
   * Lists every helper name that has been registered so far.
   */
  listHelpers() {
    return Array.from(this._helpers.keys());
  }

  /**
   * Returns the metadata that was provided when the helper was registered.
   */
  getMetadata(name) {
    const entry = this._helpers.get(name);
    return entry ? entry.metadata : undefined;
  }

  /**
   * Indicates whether a helper with the given name already exists in the registry.
   */
  isRegistered(name) {
    return this._helpers.has(name);
  }
}

module.exports = HelperRegistry;
