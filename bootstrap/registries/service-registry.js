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

    this._services.set(name, { service, metadata: metadata || {}, requiredServices: requiredServices || [] });

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
   * Retrieves a service instance from the registry by name.
   * @param name - The name of the service to retrieve
   * @returns The registered service or undefined if not found
   */
  get(name) {
    const entry = this._services.get(name);
    return entry ? entry.service : undefined;
  }

  /**
   * Returns a service instance that was registered under the given name.
   * @deprecated Use get() instead for consistency with IRegistry interface
   */
  getService(name) {
    return this.get(name);
  }

  /**
   * Checks if a service is registered with the given name.
   * @param name - The name to check
   * @returns True if the service is registered, false otherwise
   */
  has(name) {
    return this._services.has(name);
  }

  /**
   * Removes a service from the registry.
   * @param name - The name of the service to remove
   * @returns True if the service was removed, false if it wasn't found
   */
  unregister(name) {
    if (this._services.has(name)) {
      this._services.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Gets all registered service names.
   * @returns Array of all registered names
   */
  getAllNames() {
    return Array.from(this._services.keys());
  }

  /**
   * Clears all services from the registry.
   */
  clear() {
    this._services.clear();
  }

  /**
   * Gets metadata for a registered service.
   * @param name - The name of the service
   * @returns The metadata object or undefined if not found
   */
  getMetadata(name) {
    const entry = this._services.get(name);
    return entry ? entry.metadata : undefined;
  }

  /**
   * Gets the required dependencies for a registered service.
   * @param name - The name of the service
   * @returns Array of required dependencies or undefined if not found
   */
  getRequiredDependencies(name) {
    const entry = this._services.get(name);
    return entry ? entry.requiredServices : undefined;
  }

  /**
   * Lists the names of every registered service.
   * @deprecated Use getAllNames() instead for consistency with IRegistry interface
   */
  listServices() {
    return this.getAllNames();
  }

  /**
   * Indicates whether a service with the given name already exists in the registry.
   * @deprecated Use has() instead for consistency with IRegistry interface
   */
  isRegistered(name) {
    return this.has(name);
  }

  /**
   * Removes all registered services so the registry can be reused.
   * @deprecated Use clear() instead for consistency with IRegistry interface
   */
  reset() {
    this.clear();
  }
}

module.exports = ServiceRegistry;
