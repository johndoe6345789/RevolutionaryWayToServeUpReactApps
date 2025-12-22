const { getStringService } = require('../services/string-service');

/**
 * Base skeleton class for all registry classes.
 * Provides common implementation of IRegistry interface methods.
 */
class BaseRegistry {
  /**
   * Creates a new BaseRegistry instance with internal storage.
   */
  constructor() {
    this._items = new Map();
  }

  /**
   * Registers an item with the registry.
   * @param name - The unique name/identifier for the item
   * @param item - The item to register
   * @param metadata - Additional metadata about the item
   * @param requiredDependencies - List of required dependencies for this item
   */
  register(name, item, metadata, requiredDependencies) {
    const strings = getStringService();
    
    if (!name || typeof name !== 'string') {
      throw new Error(strings.getError('item_name_required'));
    }

    if (this._items.has(name)) {
      throw new Error(`Item already registered: ${name}`);
    }

    // Store with metadata and dependencies
    this._items.set(name, {
      item,
      metadata: metadata || {},
      requiredDependencies: Array.isArray(requiredDependencies) ? requiredDependencies : []
    });

    // Validate dependencies if provided
    if (requiredDependencies && requiredDependencies.length > 0) {
      this._validateDependencies(name, requiredDependencies);
    }
  }

  /**
   * Retrieves an item from the registry by name.
   * @param name - The name of the item to retrieve
   * @returns The registered item or undefined if not found
   */
  get(name) {
    const entry = this._items.get(name);
    return entry ? entry.item : undefined;
  }

  /**
   * Checks if an item is registered with the given name.
   * @param name - The name to check
   * @returns True if the item is registered, false otherwise
   */
  has(name) {
    return this._items.has(name);
  }

  /**
   * Removes an item from the registry.
   * @param name - The name of the item to remove
   * @returns True if the item was removed, false if it wasn't found
   */
  unregister(name) {
    if (this._items.has(name)) {
      this._items.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Gets all registered item names.
   * @returns Array of all registered names
   */
  getAllNames() {
    return Array.from(this._items.keys());
  }

  /**
   * Clears all items from the registry.
   */
  clear() {
    this._items.clear();
  }

  /**
   * Gets metadata for a registered item.
   * @param name - The name of the item
   * @returns The metadata object or undefined if not found
   */
  getMetadata(name) {
    const entry = this._items.get(name);
    return entry ? entry.metadata : undefined;
  }

  /**
   * Gets the required dependencies for a registered item.
   * @param name - The name of the item
   * @returns Array of required dependencies or undefined if not found
   */
  getRequiredDependencies(name) {
    const entry = this._items.get(name);
    return entry ? entry.requiredDependencies : undefined;
  }

  /**
   * Gets the total count of registered items.
   * @returns The number of registered items
   */
  getCount() {
    return this._items.size;
  }

  /**
   * Checks if the registry is empty.
   * @returns True if no items are registered
   */
  isEmpty() {
    return this._items.size === 0;
  }

  /**
   * Validates that all required dependencies are registered.
   * @param itemName - The name of the item being registered
   * @param requiredDependencies - Array of required dependency names
   * @private
   */
  _validateDependencies(itemName, requiredDependencies) {
    const strings = getStringService();
    const missingDependencies = [];
    
    for (const dependencyName of requiredDependencies) {
      if (!this._items.has(dependencyName)) {
        missingDependencies.push(dependencyName);
      }
    }

    if (missingDependencies.length > 0) {
      throw new Error(
        strings.getError('item_name_required') + ` ${itemName}: ${missingDependencies.join(', ')}`
      );
    }
  }

  /**
   * Gets all entries as an array of objects.
   * @returns Array of entry objects with name, item, metadata, and dependencies
   */
  getAllEntries() {
    const entries = [];
    
    for (const [name, entry] of this._items) {
      entries.push({
        name,
        item: entry.item,
        metadata: entry.metadata,
        requiredDependencies: entry.requiredDependencies
      });
    }
    
    return entries;
  }

  /**
   * Filters items by metadata properties.
   * @param filterFn - Function that receives metadata and returns boolean
   * @returns Array of items matching the filter criteria
   */
  filterByMetadata(filterFn) {
    const results = [];
    
    for (const [name, entry] of this._items) {
      if (filterFn(entry.metadata, name)) {
        results.push({ name, item: entry.item, metadata: entry.metadata });
      }
    }
    
    return results;
  }
}

module.exports = BaseRegistry;
