const { getStringService } = require('../../string/string-service');

/**
 * BaseFactory - A foundational factory class for creating objects with consistent patterns
 */
class BaseFactory {
  /**
   * Creates a new instance of BaseFactory
   * @param {Object} [config={}] Configuration options for the factory
   */
  constructor(config = {}) {
    this.config = config;
    this.registry = new Map();
    this.initialized = false;
  }

  /**
   * Initializes the factory with default settings
   */
  async initialize() {
    this._ensureNotInitialized();
    // Default initialization - can be overridden by subclasses
    this._markInitialized();
    return this;
  }

  /**
   * Registers a builder function for a specific type
   * @param {string} type The type identifier
   * @param {Function} builder The builder function
   * @returns {BaseFactory} The factory instance for chaining
   */
  register(type, builder) {
    if (typeof type !== 'string' || typeof builder !== 'function') {
      const strings = getStringService();
      throw new Error(strings.getError('type_must_be_a_string_and_builder_must_be_a_functi'));
    }
    this.registry.set(type, builder);
    return this;
  }

  /**
   * Creates an instance based on the provided type and options
   * @param {string} type The type identifier
   * @param {...any} args Arguments to pass to the builder
   * @returns {any} The created instance
   */
  create(type, ...args) {
    const builder = this.registry.get(type);
    if (!builder) {
      const strings = getStringService();
      throw new Error(strings.getError('no_builder_registered_for_type_type', { type }));
    }
    return builder(...args);
  }

  /**
   * Checks if a type is registered
   * @param {string} type The type identifier
   * @returns {boolean} True if the type is registered
   */
  has(type) {
    return this.registry.has(type);
  }

  /**
   * Unregisters a type
   * @param {string} type The type identifier
   * @returns {boolean} True if the item was deleted
   */
  unregister(type) {
    return this.registry.delete(type);
  }

  /**
   * Gets all registered types
   * @returns {Array<string>} Array of registered types
   */
  getTypes() {
    return Array.from(this.registry.keys());
  }

  /**
   * Clears all registered builders
   * @returns {BaseFactory} The factory instance for chaining
   */
  clear() {
    this.registry.clear();
    return this;
  }

  /**
   * Throws if initialization already ran for this factory.
   */
  _ensureNotInitialized() {
    if (this.initialized) {
      const strings = getStringService();
      throw new Error(strings.getError('this_constructor_name_already_initialized_2', { constructorName: this.constructor.name }));
    }
  }

  /**
   * Marks the factory as initialized.
   */
  _markInitialized() {
    this.initialized = true;
  }

  /**
   * Throws when the factory is used before initialize() completed.
   */
  _ensureInitialized() {
    if (!this.initialized) {
      const strings = getStringService();
      throw new Error(strings.getError('this_constructor_name_not_initialized_2', { constructorName: this.constructor.name }));
    }
  }
}

module.exports = BaseFactory;
