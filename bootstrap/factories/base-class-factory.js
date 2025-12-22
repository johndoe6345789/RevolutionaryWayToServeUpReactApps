const BaseClass = require('../base/base-class.js');
const FactoryData = require('../data/factory-data.js');
const { getStringService } = require('../../string/string-service');

/**
 * BaseClassFactory - Base factory for creating class instances
 * Enforces OO plugin rules with single business method
 */
class BaseClassFactory extends BaseClass {
  /**
   * Creates a new BaseClassFactory instance
   * @param {Object} data - Factory configuration data
   */
  constructor(data) {
    super(data);
    this.targetClass = data.targetClass;
    this.dataClass = data.dataClass;
    this.defaultConfig = data.config || {};
  }

  /**
   * Initializes the factory
   * @returns {Promise<BaseClassFactory>} The initialized factory
   */
  async initialize() {
    const strings = getStringService();

    // Validate factory configuration
    if (!this.targetClass) {
      throw new Error(strings.getError('target_class_is_required_for_factory'));
    }

    if (!this.dataClass) {
      throw new Error(strings.getError('data_class_is_required_for_factory'));
    }

    return super.initialize();
  }

  /**
   * The ONE additional method - creates class instances
   * @param {Object} config - Configuration for the instance
   * @returns {Promise<BaseClass>} The created instance
   */
  async create(config = {}) {
    try {
      // Create data instance with generated ID
      const dataConfig = {
        ...this.defaultConfig,
        ...config,
        id: this.generateId(),
        createdAt: new Date()
      };
      
      const DataClass = this.getDataClass();
      const data = new DataClass(dataConfig);
      await data.initialize();
      data.validate();
      
      // Create target class instance
      const TargetClass = this.getTargetClass();
      const instance = new TargetClass(data);
      await instance.initialize();
      
      return instance;
    } catch (error) {
      throw new Error(`Failed to create ${this.targetClass}: ${error.message}`);
    }
  }

  /**
   * Gets the target class constructor
   * @returns {Function} The target class constructor
   */
  getTargetClass() {
    // This should be overridden by subclasses
    // For now, return a default base class
    return BaseClass;
  }

  /**
   * Gets the data class constructor
   * @returns {Function} The data class constructor
   */
  getDataClass() {
    // Map data class names to actual constructors
    const dataClassMap = {
      'factory-data': FactoryData,
      'service-data': require('../data/service-data.js'),
      'utilities-data': require('../data/utilities-data.js'),
      'base-data': require('../data/base-data.js')
    };
    
    const DataClass = dataClassMap[this.dataClass];
    if (!DataClass) {
      const strings = getStringService();
      throw new Error(strings.getError('unknown_data_class_this_dataclass', { this: this }));
    }
    
    return DataClass;
  }

  /**
   * Generates a unique ID for data objects
   * @returns {string} Generated ID
   */
  generateId() {
    return `${this.targetClass.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets factory information
   * @returns {Object} Factory metadata
   */
  getFactoryInfo() {
    return {
      targetClass: this.targetClass,
      dataClass: this.dataClass,
      defaultConfig: this.defaultConfig,
      factoryType: this.constructor.name
    };
  }
}

module.exports = BaseClassFactory;
