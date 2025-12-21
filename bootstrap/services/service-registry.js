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
   * Registers a named service instance with optional metadata and required services validation.
   */
  register(name, service, metadata, requiredServices) {
    if (!name) {
      throw new Error("Service name is required");
    }

    // Handle backward compatibility with different argument lengths
    let finalMetadata = {};
    let finalRequiredServices = [];

    if (arguments.length === 2) {
      // register(name, service)
      finalMetadata = {};
      finalRequiredServices = [];
    } else if (arguments.length === 3) {
      // register(name, service, metadata) - existing usage
      finalMetadata = metadata || {};
      finalRequiredServices = [];
    } else if (arguments.length === 4) {
      // register(name, service, metadata, requiredServices) - new usage
      finalMetadata = metadata || {};
      finalRequiredServices = requiredServices || [];
    } else {
      // Default case
      finalMetadata = {};
      finalRequiredServices = [];
    }

    if (this._services.has(name)) {
      throw new Error("Service already registered: " + name);
    }

    this._services.set(name, { service, metadata: finalMetadata });

    // Validate that required services are registered
    if (Array.isArray(finalRequiredServices) && finalRequiredServices.length > 0) {
      const missingServices = [];
      for (const serviceName of finalRequiredServices) {
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
