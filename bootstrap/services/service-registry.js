/**
 * Track named service instances so other helpers can obtain them without
 * re-importing deeply nested modules.
 */
class ServiceRegistry {
  constructor() {
    this._services = new Map();
  }

  register(name, service, metadata = {}) {
    if (!name) {
      throw new Error("Service name is required");
    }
    if (this._services.has(name)) {
      throw new Error("Service already registered: " + name);
    }
    this._services.set(name, { service, metadata });
  }

  getService(name) {
    const entry = this._services.get(name);
    return entry ? entry.service : undefined;
  }

  listServices() {
    return Array.from(this._services.keys());
  }

  getMetadata(name) {
    const entry = this._services.get(name);
    return entry ? entry.metadata : undefined;
  }
}

module.exports = ServiceRegistry;
