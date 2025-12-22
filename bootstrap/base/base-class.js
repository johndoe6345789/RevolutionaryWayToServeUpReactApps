/**
 * BaseClass - Foundational class for all classes in the system
 * Enforces the OO plugin rules: dataclass constructor, initialize method, single business method
 */
class BaseClass {
  /**
   * Creates a new BaseClass instance
   * @param {Object} data - Data object with all properties (dataclass pattern)
   */
  constructor(data) {
    Object.assign(this, data);
  }

  /**
   * Initializes the instance - required by OO plugin
   * @returns {Promise<BaseClass>} The initialized instance
   */
  async initialize() {
    // Base initialization - can be overridden by subclasses
    return this;
  }

  /**
   * The ONE additional business method allowed per OO rules
   * Default implementation - to be overridden by subclasses
   * @returns {Promise<any>} Result of the business logic
   */
  async execute() {
    return this;
  }
}

module.exports = BaseClass;
