const BaseClass = require('../base/base-class.js');

/**
 * BaseData - Base class for all data classes
 * Enforces OO plugin rules with single business method for validation
 */
class BaseData extends BaseClass {
  /**
   * Creates a new BaseData instance
   * @param {Object} data - Data object with all properties
   */
  constructor(data) {
    super(data);
    this.createdAt = new Date();
    this.version = '1.0.0';
  }

  /**
   * Initializes the data object
   * @returns {Promise<BaseData>} The initialized data instance
   */
  async initialize() {
    // Base initialization for data objects
    return super.initialize();
  }

  /**
   * The ONE additional method - validates the data
   * @returns {boolean} True if data is valid
   * @throws {Error} If data is invalid
   */
  validate() {
    const strings = getStringService();
    if (!this.id) {
      throw new Error(strings.getError('item_name_required'));
    }
    return true;
  }

  /**
   * Gets a string representation of the data
   * @returns {string} String representation
   */
  toString() {
    return `${this.constructor.name}(id: ${this.id}, created: ${this.createdAt.toISOString()})`;
  }

  /**
   * Converts data to JSON
   * @returns {Object} Plain object representation
   */
  toJSON() {
    const result = {};
    Object.keys(this).forEach(key => {
      if (typeof this[key] !== 'function') {
        result[key] = this[key];
      }
    });
    return result;
  }
}

module.exports = BaseData;
