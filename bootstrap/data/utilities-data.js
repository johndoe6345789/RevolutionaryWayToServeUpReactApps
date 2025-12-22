const BaseData = require('./base-data.js');

/**
 * UtilitiesData - Data class for utility configurations
 * Enforces OO plugin rules with single business method
 */
class UtilitiesData extends BaseData {
  /**
   * Creates a new UtilitiesData instance
   * @param {Object} data - Utility configuration data
   */
  constructor(data) {
    super(data);
    this.utilityType = data.utilityType;
    this.utilityName = data.utilityName;
    this.source = data.source;
    this.config = data.config || {};
    this.processingOptions = data.processingOptions || {};
  }

  /**
   * Initializes the utilities data
   * @returns {Promise<UtilitiesData>} The initialized data instance
   */
  async initialize() {
    return super.initialize();
  }

  /**
   * The ONE additional method - utility-specific validation
   * @returns {boolean} True if utilities data is valid
   * @throws {Error} If utilities data is invalid
   */
  validate() {
    super.validate();
    
    if (!this.utilityType) {
      throw new Error('Utility type is required');
    }
    
    if (!this.utilityName) {
      throw new Error('Utility name is required');
    }
    
    if (typeof this.config !== 'object') {
      throw new Error('Config must be an object');
    }
    
    if (typeof this.processingOptions !== 'object') {
      throw new Error('Processing options must be an object');
    }
    
    // Validate utility name format
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(this.utilityName)) {
      throw new Error('Utility name must be a valid identifier');
    }
    
    // Validate utility type
    const validTypes = ['provider', 'alias', 'normalizer', 'validator', 'transformer'];
    if (!validTypes.includes(this.utilityType)) {
      throw new Error(`Utility type must be one of: ${validTypes.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Gets the utility module path
   * @returns {string} Module path for the utility
   */
  getModulePath() {
    return `../services/cdn/network/${this.utilityName}`;
  }

  /**
   * Checks if utility has source data
   * @returns {boolean} True if utility has source data
   */
  hasSource() {
    return this.source !== undefined && this.source !== null;
  }

  /**
   * Gets processing option by key
   * @param {string} key - Option key
   * @param {*} defaultValue - Default value if option not found
   * @returns {*} Option value or default
   */
  getProcessingOption(key, defaultValue = null) {
    return this.processingOptions.hasOwnProperty(key) ? this.processingOptions[key] : defaultValue;
  }

  /**
   * Checks if utility has specific processing option
   * @param {string} key - Option key
   * @returns {boolean} True if option exists
   */
  hasProcessingOption(key) {
    return this.processingOptions.hasOwnProperty(key);
  }
}

module.exports = UtilitiesData;
