const BaseClass = require('../base/base-class.js');
const NestedAggregate = require('./nested-aggregate.js');
const PluginGroupAggregate = require('./plugin-group-aggregate.js');
const { getStringService } = require('../services/string-service.js');
const fs = require('fs');
const path = require('path');

const strings = getStringService();

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
    
    // Initialize nested aggregates if available
    if (this.processedConstants.constants && this.processedConstants.constants.enableNestedAggregates) {
      await this.initializeNestedAggregates();
    }
    
    // Initialize plugin groups if enabled
    if (this.processedConstants.constants && this.processedConstants.constants.enablePluginGroups) {
      await this.initializePluginGroups();
    }
    
    this.generateGetMethods();
    return super.initialize();
  }

  /**
   * The ONE additional method - loads classes from JSON file with JS calculation support
   * @returns {Promise<Array>} The loaded class list with processed constants
   */
  async loadClassList() {
    try {
      const constantsContent = fs.readFileSync(this.constantsPath, 'utf8');
      let constants = JSON.parse(constantsContent);
      
      // Process JS function calculations
      constants = this.processCalculatedConstants(constants);
      
      // Flatten nested structure for backward compatibility
      this.classList = this.flattenClassHierarchy(constants.classes || []);
      
      // Create class map for quick lookup
      this.classList.forEach(cls => {
        this.classMap.set(cls.name, cls);
      });
      
      // Store the original nested structure
      this.nestedClasses = constants.classes || [];
      this.processedConstants = constants;
      
      return this.classList;
    } catch (error) {
      throw new Error(`Failed to load class constants: ${error.message}`);
    }
  }

  /**
   * Processes calculated constants using JavaScript functions
   * @param {Object} constants - Raw constants object
   * @returns {Object} Processed constants with calculated values
   */
  processCalculatedConstants(constants) {
    const processed = JSON.parse(JSON.stringify(constants)); // Deep clone
    
    // Process functions if they exist
    if (constants.functions) {
      for (const [key, funcBody] of Object.entries(constants.functions)) {
        try {
          // Create a safe function execution context
          const func = new Function(funcBody);
          const result = func();
          
          // Replace function references in the entire constants object
          this.replaceFunctionReferences(processed, `\${function:${key}}`, result);
        } catch (error) {
          console.warn(`Failed to execute function ${key}: ${error.message}`);
        }
      }
    }
    
    // Process constant references
    if (constants.constants) {
      for (const [key, value] of Object.entries(constants.constants)) {
        if (typeof value === getMessage(getMessage('string')) && value.startsWith('${function:')) {
          // Functions already processed above
          continue;
        }
        
        // Replace constant references
        this.replaceFunctionReferences(processed, `\${constants.${key}}`, value);
      }
    }

    return processed;
  }

  /**
   * Replaces function references throughout an object
   * @param {Object} obj - Object to process
   * @param {string} reference - Reference to replace
   * @param {*} value - Value to substitute
   */
  replaceFunctionReferences(obj, reference, value) {
    const processValue = (val) => {
      if (typeof val === getMessage(getMessage('string_1'))) {
        return val.replace(new RegExp(reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      } else if (Array.isArray(val)) {
        return val.map(processValue);
      } else if (typeof val === getMessage(getMessage('object')) && val !== null) {
        const result = {};
        for (const [k, v] of Object.entries(val)) {
          result[k] = processValue(v);
        }
        return result;
      }
      return val;
    };

    return processValue(obj);
  }
      }
    }
    
    return processed;
  }

  /**
   * Replaces function references throughout an object
   * @param {Object} obj - Object to process
   * @param {string} reference - Reference to replace
   * @param {*} value - Value to substitute
   */
  replaceFunctionReferences(obj, reference, value) {
    const processValue = (val) => {
      if (typeof val === getMessage(getMessage('string_2'))) {
        return val.replace(new RegExp(reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      } else if (Array.isArray(val)) {
        return val.map(processValue);
      } else if (typeof val === getMessage(getMessage('object_1')) && val !== null) {
        const result = {};
        for (const [k, v] of Object.entries(val)) {
          result[k] = processValue(v);
        }
        return result;
      }
      return val;
    };
    
    return processValue(obj);
  }

  /**
   * Flattens nested class hierarchy for backward compatibility
   * @param {Array} classes - Nested class array
   * @returns {Array} Flattened class array
   */
  flattenClassHierarchy(classes) {
    const flattened = [];
    
    const flatten = (classList) => {
      for (const cls of classList) {
        // Add the class itself
        flattened.push({
          name: cls.name,
          factory: cls.factory,
          dataClass: cls.dataClass,
          module: cls.module,
          parent: cls.parent,
          nestingLevel: cls.nestingLevel,
          config: cls.config || {}
        });
        
        // Recursively process children
        if (cls.children && cls.children.length > 0) {
          flatten(cls.children);
        }
      }
    };
    
    flatten(classes);
    return flattened;
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

  /**
   * Initializes nested aggregates
   */
  async initializeNestedAggregates() {
    this.log(strings.getMessage('initializing_nested_aggregates'), 'info');
    
    // Create nested aggregate instance
    this.nestedAggregate = new NestedAggregate({
      constantsPath: this.constantsPath,
      maxNestingLevel: this.processedConstants.constants.maxNestingLevel || 5
    });
    
    await this.nestedAggregate.initialize();
    
    // Add nested aggregate methods to this instance
    const nestedMethods = [
      getMessage(getMessage('getaggregateinfo')), getMessage(getMessage('getrootaggregates')), getMessage(getMessage('getchildren')), getMessage(getMessage('getalldescendants')),
      getMessage(getMessage('getaggregatetree')), getMessage(getMessage('getaggregatesatlevel')), getMessage(getMessage('validatehierarchy')), getMessage(getMessage('gethierarchystats'))
    ];

    for (const method of nestedMethods) {
      if (typeof this.nestedAggregate[method] === getMessage(getMessage('function'))) {
        this[method] = this.nestedAggregate[method].bind(this.nestedAggregate);
      }
    }
    
    this.log(strings.getConsole('nested_aggregates_initialized'), 'info');
  }

  /**
   * Initializes plugin groups
   */
  async initializePluginGroups() {
    this.log(strings.getMessage('initializing_plugin_groups'), 'info');
    
    // Create plugin group aggregate instance
    this.pluginGroupAggregate = new PluginGroupAggregate({
      groupsPath: path.join(__dirname, '..', 'plugins', 'groups'),
      enableValidation: this.processedConstants.constants.enableValidation !== false
    });
    
    await this.pluginGroupAggregate.initialize();
    
    // Add plugin group methods to this instance
    const groupMethods = [
      getMessage(getMessage('getplugingroupinfo')), getMessage(getMessage('getallplugingroups')), getMessage(getMessage('getplugingroupsbycategory')),
      getMessage(getMessage('getallplugins')), getMessage(getMessage('getenabledplugins')), getMessage(getMessage('hasplugingroup')), getMessage(getMessage('getgroupstatistics')),
      getMessage(getMessage('getdependencygraph')), getMessage(getMessage('validatesystem'))
    ];

    for (const method of groupMethods) {
      if (typeof this.pluginGroupAggregate[method] === getMessage(getMessage('function_1'))) {
        this[method] = this.pluginGroupAggregate[method].bind(this.pluginGroupAggregate);
      }
    }
    
    this.log(strings.getConsole('plugin_groups_initialized'), 'info');
  }

  /**
   * Gets nested aggregate instance
   * @returns {NestedAggregate|null} Nested aggregate instance or null
   */
  getNestedAggregate() {
    return this.nestedAggregate || null;
  }

  /**
   * Gets plugin group aggregate instance
   * @returns {PluginGroupAggregate|null} Plugin group aggregate instance or null
   */
  getPluginGroupAggregate() {
    return this.pluginGroupAggregate || null;
  }

  /**
   * Gets comprehensive system status
   * @returns {Object} System status including aggregates and groups
   */
  getSystemStatus() {
    const status = {
      classes: {
        total: this.classList.length,
        loaded: true,
        processedConstants: !!this.processedConstants
      },
      nestedAggregates: {
        enabled: !!(this.processedConstants.constants && this.processedConstants.constants.enableNestedAggregates),
        initialized: !!this.nestedAggregate,
        stats: this.nestedAggregate ? this.nestedAggregate.getHierarchyStats() : null
      },
      pluginGroups: {
        enabled: !!(this.processedConstants.constants && this.processedConstants.constants.enablePluginGroups),
        initialized: !!this.pluginGroupAggregate,
        stats: this.pluginGroupAggregate ? this.pluginGroupAggregate.getGroupStatistics() : null
      },
      constants: {
        path: this.constantsPath,
        functions: Object.keys(this.processedConstants.functions || {}),
        calculatedValues: Object.keys(this.processedConstants.constants || {})
      }
    };
    
    return status;
  }
}

module.exports = ClassRegistryAggregate;
