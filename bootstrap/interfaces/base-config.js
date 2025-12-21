/**
 * Base skeleton class for all configuration classes.
 * Provides common implementation of IConfig interface methods.
 */
class BaseConfig {
  /**
   * Creates a new BaseConfig instance with optional initial values.
   * @param options - Optional configuration properties
   */
  constructor(options = {}) {
    Object.assign(this, options);
  }

  /**
   * Validates that the configuration is properly set up.
   * Base implementation performs basic validation.
   * @throws Error if configuration is invalid
   */
  validate() {
    if (typeof this !== 'object' || this === null) {
      throw new Error('Configuration must be a valid object');
    }
  }

  /**
   * Merges additional configuration properties into this instance.
   * @param additional - Additional configuration to merge
   * @returns A new configuration instance with merged properties
   */
  merge(additional) {
    return new this.constructor({
      ...this.toObject(),
      ...additional,
    });
  }

  /**
   * Serializes the configuration to a plain object.
   * @returns The configuration as a plain object
   */
  toObject() {
    const obj = {};
    for (const [key, value] of Object.entries(this)) {
      if (typeof value !== 'function') {
        obj[key] = value;
      }
    }
    return obj;
  }

  /**
   * Clones this configuration instance.
   * @returns A new configuration instance with the same properties
   */
  clone() {
    return new this.constructor(this.toObject());
  }

  /**
   * Checks if this configuration is equal to another configuration.
   * @param other - Another configuration to compare with
   * @returns True if configurations are equal
   */
  equals(other) {
    if (!other || typeof other.toObject !== 'function') {
      return false;
    }
    
    const thisObj = this.toObject();
    const otherObj = other.toObject();
    
    return JSON.stringify(thisObj) === JSON.stringify(otherObj);
  }
}

module.exports = BaseConfig;
