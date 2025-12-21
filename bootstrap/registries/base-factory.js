/**
 * Base class for factories that create objects with dependency injection.
 */
class BaseFactory {
  /**
   * Creates a new BaseFactory instance with the provided dependencies.
   */
  constructor(dependencies = {}) {
    this.dependencies = dependencies;
  }

  /**
   * Creates an instance of the target class with the provided config.
   */
  create(config = {}) {
    throw new Error(`${this.constructor.name} must implement create()`);
  }

  /**
   * Gets a dependency by name.
   */
  getDependency(name) {
    if (!(name in this.dependencies)) {
      throw new Error(`Dependency not found: ${name}`);
    }
    return this.dependencies[name];
  }
}

module.exports = BaseFactory;