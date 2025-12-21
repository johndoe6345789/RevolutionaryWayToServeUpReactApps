/**
 * Tracks named factory constructors so they can create instances with dependency injection.
 */
class FactoryRegistry {
  /**
   * Creates the backing storage for factory entries.
   */
  constructor() {
    this._factories = new Map();
    this._factoryLoaders = new Map(); // Map of loader functions for lazy loading
  }

  /**
   * Registers a named factory constructor with metadata and required dependencies.
   */
  register(name, factory, metadata, requiredDependencies) {
    if (!name) {
      throw new Error("Factory name is required");
    }

    if (arguments.length !== 4) {
      throw new Error("FactoryRegistry.register requires exactly 4 parameters: (name, factory, metadata, requiredDependencies)");
    }

    if (this._factories.has(name)) {
      throw new Error("Factory already registered: " + name);
    }
    this._factories.set(name, { factory, metadata: metadata || {} });
  }

  /**
   * Registers a factory loader function that will be called to load the factory when needed.
   */
  registerLoader(name, loader, metadata, requiredDependencies) {
    if (!name) {
      throw new Error("Factory name is required");
    }

    if (arguments.length !== 4) {
      throw new Error("FactoryRegistry.registerLoader requires exactly 4 parameters: (name, loader, metadata, requiredDependencies)");
    }

    if (this._factoryLoaders.has(name)) {
      throw new Error("Factory loader already registered: " + name);
    }
    this._factoryLoaders.set(name, { loader, metadata: metadata || {}, requiredDependencies: requiredDependencies || [] });
  }

  /**
   * Creates an instance using the registered factory with the provided dependencies.
   * If the factory is not yet registered, attempts to load it from a loader.
   */
  create(name, dependencies = {}) {
    // First, try to get the factory directly
    let entry = this._factories.get(name);

    // If not found, try to load it from a loader
    if (!entry && this._factoryLoaders.has(name)) {
      const loaderEntry = this._factoryLoaders.get(name);
      const factory = loaderEntry.loader();
      this._factories.set(name, { factory, metadata: loaderEntry.metadata });
      this._factoryLoaders.delete(name); // Remove loader after loading
      entry = this._factories.get(name);
    }

    if (!entry) {
      throw new Error("Factory not found: " + name);
    }

    // Check if required dependencies are provided
    const factoryMetadata = entry.metadata;
    const requiredDeps = factoryMetadata.required || [];

    for (const dep of requiredDeps) {
      if (!(dep in dependencies)) {
        throw new Error(`Required dependency missing for factory ${name}: ${dep}`);
      }
    }

    // For BaseFactory subclasses, call the factory function (which returns create function)
    // For other factories, create an instance and call its create method if it exists
    if (typeof entry.factory === 'function') {
      return entry.factory(dependencies);
    } else {
      const factoryInstance = new entry.factory();
      return factoryInstance.create ? factoryInstance.create(dependencies) : new factoryInstance(dependencies);
    }
  }

  /**
   * Returns the factory constructor that was registered under the given name.
   * If the factory is not yet registered, attempts to load it from a loader.
   */
  getFactory(name) {
    let entry = this._factories.get(name);

    // If not found, try to load it from a loader
    if (!entry && this._factoryLoaders.has(name)) {
      const loaderEntry = this._factoryLoaders.get(name);
      const factory = loaderEntry.loader();
      this._factories.set(name, { factory, metadata: loaderEntry.metadata });
      this._factoryLoaders.delete(name); // Remove loader after loading
      entry = this._factories.get(name);
    }

    return entry ? entry.factory : undefined;
  }

  /**
   * Lists the names of every registered factory.
   */
  listFactories() {
    return Array.from(this._factories.keys());
  }

  /**
   * Returns metadata that was attached to the named factory entry.
   */
  getMetadata(name) {
    let entry = this._factories.get(name);

    // If not found, try to load it from a loader
    if (!entry && this._factoryLoaders.has(name)) {
      const loaderEntry = this._factoryLoaders.get(name);
      const factory = loaderEntry.loader();
      this._factories.set(name, { factory, metadata: loaderEntry.metadata });
      this._factoryLoaders.delete(name); // Remove loader after loading
      entry = this._factories.get(name);
    }

    return entry ? entry.metadata : undefined;
  }

  /**
   * Indicates whether a factory with the given name already exists in the registry.
   */
  isRegistered(name) {
    return this._factories.has(name) || this._factoryLoaders.has(name);
  }

  /**
   * Removes all registered factories so the registry can be reused.
   */
  reset() {
    this._factories.clear();
    this._factoryLoaders.clear();
  }
}

module.exports = FactoryRegistry;