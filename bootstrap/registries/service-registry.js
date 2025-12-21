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
   * Registers a named service instance with metadata and required services validation.
   */
  register(name, service, metadata, requiredServices) {
    if (!name) {
      throw new Error("Service name is required");
    }

    if (arguments.length !== 4) {
      throw new Error("ServiceRegistry.register requires exactly 4 parameters: (name, service, metadata, requiredServices)");
    }

    if (this._services.has(name)) {
      throw new Error("Service already registered: " + name);
    }

    this._services.set(name, { service, metadata: metadata || {} });

    // Validate that required services are registered
    if (Array.isArray(requiredServices) && requiredServices.length > 0) {
      const missingServices = [];
      for (const serviceName of requiredServices) {
        if (!this._services.has(serviceName)) {
          missingServices.push(serviceName);
        }
      }

      if (missingServices.length > 0) {
        throw new Error(`Required services are not registered: ${missingServices.join(', ')}`);
      }
    }
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

  /**
   * Removes all registered services so the registry can be reused.
   */
  reset() {
    this._services.clear();
  }
}

module.exports = ServiceRegistry;
