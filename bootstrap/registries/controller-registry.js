/**
 * Track named controller instances so other controllers can obtain them without
 * re-importing deeply nested modules.
 */
class ControllerRegistry {
  /**
   * Creates the backing storage for controller entries.
   */
  constructor() {
    this._controllers = new Map();
  }

  /**
   * Registers a named controller instance with metadata and required services validation.
   */
  register(name, controller, metadata, requiredServices) {
    if (!name) {
      throw new Error("Controller name is required");
    }

    if (arguments.length !== 4) {
      throw new Error("ControllerRegistry.register requires exactly 4 parameters: (name, controller, metadata, requiredServices)");
    }

    if (this._controllers.has(name)) {
      throw new Error("Controller already registered: " + name);
    }

    this._controllers.set(name, { controller, metadata: metadata || {} });

    // Validate that required services are registered
    if (Array.isArray(requiredServices) && requiredServices.length > 0) {
      const missingControllers = [];
      for (const controllerName of requiredServices) {
        if (!this._controllers.has(controllerName)) {
          missingControllers.push(controllerName);
        }
      }

      if (missingControllers.length > 0) {
        throw new Error(`Required controllers are not registered: ${missingControllers.join(', ')}`);
      }
    }
  }

  /**
   * Returns the controller instance that was registered under the given name.
   */
  getController(name) {
    const entry = this._controllers.get(name);
    return entry ? entry.controller : undefined;
  }

  /**
   * Lists the names of every registered controller.
   */
  listControllers() {
    return Array.from(this._controllers.keys());
  }

  /**
   * Returns metadata that was attached to the named controller entry.
   */
  getMetadata(name) {
    const entry = this._controllers.get(name);
    return entry ? entry.metadata : undefined;
  }

  /**
   * Indicates whether a controller with the given name already exists in the registry.
   */
  isRegistered(name) {
    return this._controllers.has(name);
  }

  /**
   * Removes all registered controllers so the registry can be reused.
   */
  reset() {
    this._controllers.clear();
  }
}

module.exports = ControllerRegistry;