const BaseData = require('./base-data.js');

/**
 * FactoryData - Data class for factory configurations
 * Enforces OO plugin rules with single business method
 */
class FactoryData extends BaseData {
  /**
   * Creates a new FactoryData instance
   * @param {Object} data - Factory configuration data
   */
  constructor(data) {
    super(data);
    this.type = data.type;
    this.targetClass = data.targetClass;
    this.dataClass = data.dataClass;
    this.config = data.config || {};
    this.dependencies = data.dependencies || [];
  }

  /**
   * Initializes the factory data
   * @returns {Promise<FactoryData>} The initialized data instance
   */
  async initialize() {
    return super.initialize();
  }

  /**
   * The ONE additional method - factory-specific validation
   * @returns {boolean} True if factory data is valid
   * @throws {Error} If factory data is invalid
   */
  validate() {
    super.validate();
    
    if (!this.type) {
      throw new Error('Factory type is required');
    }
    
    if (!this.targetClass) {
      throw new Error('Target class is required');
    }
    
    if (!this.dataClass) {
      throw new Error('Data class is required');
    }
    
    if (typeof this.config !== 'object') {
      throw new Error('Config must be an object');
    }
    
    if (!Array.isArray(this.dependencies)) {
      throw new Error('Dependencies must be an array');
    }
    
    return true;
  }

  /**
   * Gets the factory module path
   * @returns {string} Module path for the factory
   */
  getModulePath() {
    return `../factories/${this.type}`;
  }

  /**
   * Checks if factory has dependencies
   * @returns {boolean} True if factory has dependencies
   */
  hasDependencies() {
    return this.dependencies.length > 0;
  }
}

module.exports = FactoryData;
