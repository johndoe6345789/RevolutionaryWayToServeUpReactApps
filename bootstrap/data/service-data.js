const BaseData = require('./base-data.js');

/**
 * ServiceData - Data class for service configurations
 * Enforces OO plugin rules with single business method
 */
class ServiceData extends BaseData {
  /**
   * Creates a new ServiceData instance
   * @param {Object} data - Service configuration data
   */
  constructor(data) {
    super(data);
    this.serviceName = data.serviceName;
    this.serviceType = data.serviceType;
    this.dependencies = data.dependencies || [];
    this.config = data.config || {};
    this.version = data.version || '1.0.0';
  }

  /**
   * Initializes the service data
   * @returns {Promise<ServiceData>} The initialized data instance
   */
  async initialize() {
    return super.initialize();
  }

  /**
   * The ONE additional method - service-specific validation
   * @returns {boolean} True if service data is valid
   * @throws {Error} If service data is invalid
   */
  validate() {
    const strings = getStringService();
    super.validate();
    
    if (!this.serviceName) {
      throw new Error(strings.getError('service_name_required'));
    }
    
    if (!this.serviceType) {
      throw new Error(strings.getError('service_type_required'));
    }
    
    if (!Array.isArray(this.dependencies)) {
      throw new Error(strings.getError('dependencies_invalid'));
    }
    
    if (typeof this.config !== 'object') {
      throw new Error(strings.getError('config_object_required'));
    }
    
    // Validate service name format
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(this.serviceName)) {
      throw new Error(strings.getError('service_name_invalid'));
    }
    
    return true;
  }

  /**
   * Gets the service module path
   * @returns {string} Module path for the service
   */
  getModulePath() {
    return `../services/${this.serviceType}/${this.serviceName}`;
  }

  /**
   * Checks if service has dependencies
   * @returns {boolean} True if service has dependencies
   */
  hasDependencies() {
    return this.dependencies.length > 0;
  }

  /**
   * Gets dependency count
   * @returns {number} Number of dependencies
   */
  getDependencyCount() {
    return this.dependencies.length;
  }
}

module.exports = ServiceData;
