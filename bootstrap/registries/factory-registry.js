/**
 * Registry for managing factory classes that create instances of objects.
 * Factories are stored by name and can be retrieved to create new instances.
 */
class FactoryRegistry {
  /**
   * Creates the backing storage for factory entries.
   */
  constructor() {
    this._factories = new Map();
  }

  /**
   * Registers a named factory with optional metadata.
   */
  register(name, factory, metadata) {
    if (!name) {
      throw new Error("Factory name is required");
    }

    if (typeof factory !== 'function' && !factory.create) {
      throw new Error("Factory must be a function or have a create method");
    }

    if (this._factories.has(name)) {
      throw new Error("Factory already registered: " + name);
    }

    this._factories.set(name, { 
      factory, 
      metadata: metadata || {},
      createdInstances: [] // Track instances created by this factory
    });
  }

  /**
   * Creates a new instance using the registered factory.
   */
  create(name, ...args) {
    const factoryEntry = this._factories.get(name);
    if (!factoryEntry) {
      throw new Error(`Factory not registered: ${name}`);
    }

    const { factory } = factoryEntry;
    let instance;

    if (typeof factory === 'function') {
      instance = factory(...args);
    } else if (factory.create && typeof factory.create === 'function') {
      instance = factory.create(...args);
    } else {
      throw new Error(`Invalid factory for ${name}: must be function or have create method`);
    }

    // Track the created instance
    factoryEntry.createdInstances.push(instance);
    return instance;
  }

  /**
   * Gets the factory function without creating an instance.
   */
  getFactory(name) {
    const factoryEntry = this._factories.get(name);
    return factoryEntry ? factoryEntry.factory : undefined;
  }

  /**
   * Gets metadata for the specified factory.
   */
  getMetadata(name) {
    const factoryEntry = this._factories.get(name);
    return factoryEntry ? factoryEntry.metadata : undefined;
  }

  /**
   * Lists the names of every registered factory.
   */
  listFactories() {
    return Array.from(this._factories.keys());
  }

  /**
   * Indicates whether a factory with the given name already exists in the registry.
   */
  isRegistered(name) {
    return this._factories.has(name);
  }

  /**
   * Gets all instances created by a specific factory.
   */
  getCreatedInstances(name) {
    const factoryEntry = this._factories.get(name);
    return factoryEntry ? factoryEntry.createdInstances : [];
  }

  /**
   * Resets the created instances list for a specific factory.
   */
  resetInstances(name) {
    const factoryEntry = this._factories.get(name);
    if (factoryEntry) {
      factoryEntry.createdInstances = [];
    }
  }

  /**
   * Removes all registered factories so the registry can be reused.
   */
  reset() {
    this._factories.clear();
  }
}

module.exports = FactoryRegistry;