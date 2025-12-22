const BaseClass = require('../base/base-class.js');
const fs = require('fs');
const path = require('path');

/**
 * ClassRegistryAggregate - Loads class list from JSON and generates get methods
 * Enforces OO plugin rules with single business method
 */
class ClassRegistryAggregate extends BaseClass {
  /**
   * Creates a new ClassRegistryAggregate instance
   * @param {Object} data - Configuration data
   */
  constructor(data) {
    super(data);
    this.classList = [];
    this.classMap = new Map();
    this.constantsPath = data.constantsPath || path.join(__dirname, 'class-constants.json');
  }

  /**
   * Initializes the aggregate and generates get methods
   * @returns {Promise<ClassRegistryAggregate>} The initialized instance
   */
  async initialize() {
    await this.loadClassList();
    this.generateGetMethods();
    return super.initialize();
  }

  /**
   * The ONE additional method - loads classes from JSON file
   * @returns {Promise<Array>} The loaded class list
   */
  async loadClassList() {
    try {
      const constantsContent = fs.readFileSync(this.constantsPath, 'utf8');
      const constants = JSON.parse(constantsContent);
      
      this.classList = constants.classes || [];
      
      // Create class map for quick lookup
      this.classList.forEach(cls => {
        this.classMap.set(cls.name, cls);
      });
      
      return this.classList;
    } catch (error) {
      throw new Error(`Failed to load class constants: ${error.message}`);
    }
  }

  /**
   * Generates get methods for each class in the list
   * This is called during initialization, not counted as business method
   */
  generateGetMethods() {
    this.classList.forEach(cls => {
      const methodName = `get${cls.name}`;
      
      this[methodName] = async function(config = {}) {
        try {
          // Dynamically require the factory
          const FactoryClass = require(`../factories/${cls.factory}.js`);
          const factory = new FactoryClass({
            ...config,
            targetClass: cls.name,
            dataClass: cls.dataClass
          });
          
          await factory.initialize();
          return await factory.create(config);
        } catch (error) {
          throw new Error(`Failed to create ${cls.name}: ${error.message}`);
        }
      };
    });
  }

  /**
   * Gets class information by name
   * @param {string} className - The class name to lookup
   * @returns {Object|null} Class information or null if not found
   */
  getClassInfo(className) {
    return this.classMap.get(className) || null;
  }

  /**
   * Gets all registered classes
   * @returns {Array} Array of class information
   */
  getAllClasses() {
    return [...this.classList];
  }

  /**
   * Checks if a class is registered
   * @param {string} className - The class name to check
   * @returns {boolean} True if class is registered
   */
  hasClass(className) {
    return this.classMap.has(className);
  }
}

module.exports = ClassRegistryAggregate;
