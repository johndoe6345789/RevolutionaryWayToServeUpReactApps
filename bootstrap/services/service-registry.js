/**
 * Track named service instances so other helpers can obtain them without
 * re-importing deeply nested modules.
 */
class ServiceRegistry {
  /**
   * Creates the backing storage for service entries.
   */
  constructor() {
    this._services = new Map();
  }

  /**
   * Registers a named service instance with optional metadata.
   */
  register(name, service, metadata = {}) {
    if (!name) {
      throw new Error("Service name is required");
    }
    if (this._services.has(name)) {
      throw new Error("Service already registered: " + name);
    }
    this._services.set(name, { service, metadata });
  }

  /**
   * Returns the service instance that was registered under the given name.
   */
  getService(name) {
    const entry = this._services.get(name);
    return entry ? entry.service : undefined;
  }

  /**
   * Lists the names of every registered service.
   */
  listServices() {
    return Array.from(this._services.keys());
  }

  /**
   * Returns metadata that was attached to the named service entry.
   */
  getMetadata(name) {
    const entry = this._services.get(name);
    return entry ? entry.metadata : undefined;
  }

  /**
   * Indicates whether a service with the given name already exists in the registry.
   */
  isRegistered(name) {
    return this._services.has(name);
  }
}

module.exports = ServiceRegistry;
