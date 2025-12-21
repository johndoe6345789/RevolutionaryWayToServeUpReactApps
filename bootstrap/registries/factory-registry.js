/**
 * Tracks named factory constructors so they can create instances with dependency injection.
 */
class FactoryRegistry {
  /**
   * Creates the backing storage for factory entries.
   */
  constructor() {
    this._factories = new Map();
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
   * Creates an instance using the registered factory with the provided dependencies.
   */
  create(name, dependencies = {}) {
    const entry = this._factories.get(name);
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

    const factory = new entry.factory(dependencies);
    return factory.create ? factory.create(dependencies) : factory;
  }

  /**
   * Returns the factory constructor that was registered under the given name.
   */
  getFactory(name) {
    const entry = this._factories.get(name);
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
    const entry = this._factories.get(name);
    return entry ? entry.metadata : undefined;
  }

  /**
   * Indicates whether a factory with the given name already exists in the registry.
   */
  isRegistered(name) {
    return this._factories.has(name);
  }

  /**
   * Removes all registered factories so the registry can be reused.
   */
  reset() {
    this._factories.clear();
  }
}

module.exports = FactoryRegistry;