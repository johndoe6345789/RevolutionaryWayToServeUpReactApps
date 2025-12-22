const BaseClassFactory = require('./base-class-factory.js');
const AggregateData = require('../data/aggregate-data.js');
const { getStringService } = require('../../string/string-service');

/**
 * AggregateFactory - Factory for creating aggregate instances
 * Enforces OO plugin rules with single business method
 */
class AggregateFactory extends BaseClassFactory {
  /**
   * Creates a new AggregateFactory instance
   * @param {Object} data - Factory configuration data
   */
  constructor(data) {
    super(data);
    this.aggregateType = data.aggregateType;
    this.maxNestingLevel = data.maxNestingLevel || 5;
    this.enableHierarchyValidation = data.enableHierarchyValidation !== false;
    this.aggregateHierarchy = data.aggregateHierarchy || [];
  }

  /**
   * Initializes the aggregate factory
   * @returns {Promise<AggregateFactory>} The initialized factory
   */
  async initialize() {
    const strings = getStringService();

    // Validate factory configuration
    if (!this.aggregateType) {
      throw new Error(strings.getError('aggregate_type_is_required_for_aggregate_factory'));
    }

    if (this.aggregateHierarchy && !Array.isArray(this.aggregateHierarchy)) {
      throw new Error(strings.getError('aggregate_hierarchy_must_be_an_array'));
    }

    return super.initialize();
  }

  /**
   * The ONE additional method - creates aggregate instances with hierarchy support
   * @param {Object} config - Configuration for the aggregate instance
   * @returns {Promise<BaseClass>} The created aggregate instance
   */
  async create(config = {}) {
    try {
      // Create enhanced data config for aggregates
      const dataConfig = {
        ...this.defaultConfig,
        ...config,
        id: this.generateId(),
        createdAt: new Date(),
        aggregateType: this.aggregateType,
        hierarchyPath: this.aggregateHierarchy,
        nestingLevel: this.aggregateHierarchy.length - 1
      };
      
      // Use AggregateData instead of generic FactoryData
      const data = new AggregateData(dataConfig);
      await data.initialize();
      data.validate();
      
      // Validate hierarchy if enabled
      if (this.enableHierarchyValidation) {
        this.validateHierarchyConstraints(data);
      }
      
      // Get the appropriate aggregate class (NestedAggregate or specific aggregate)
      const AggregateClass = this.getTargetAggregateClass();
      const instance = new AggregateClass(data);
      await instance.initialize();
      
      return instance;
    } catch (error) {
      throw new Error(`Failed to create aggregate ${this.targetClass}: ${error.message}`);
    }
  }

  /**
   * Gets the target aggregate class constructor
   * @returns {Function} The target aggregate class constructor
   */
  getTargetAggregateClass() {
    // Try to load specific aggregate class first
    try {
      const SpecificAggregate = require(`../aggregate/${this.targetClass.toLowerCase()}.js`);
      return SpecificAggregate;
    } catch (error) {
      // Fallback to NestedAggregate for general use
      return require('../aggregate/nested-aggregate.js');
    }
  }

  /**
   * Validates hierarchy constraints for aggregate creation
   * @param {AggregateData} data - The aggregate data to validate
   */
  validateHierarchyConstraints(data) {
    const strings = getStringService();

    // Check nesting level limit
    if (data.nestingLevel > this.maxNestingLevel) {
      throw new Error(strings.getError('nesting_level_exceeds_maximum', {
        nestingLevel: data.nestingLevel,
        maxNestingLevel: this.maxNestingLevel
      }));
    }

    // Check hierarchy path consistency
    if (this.aggregateHierarchy.length > 0 && !this.aggregateHierarchy.includes(this.targetClass)) {
      throw new Error(strings.getError('target_class_this_targetclass_not_found_in_hierarc', { this: this }));
    }

    // Validate parent-child relationships
    if (this.aggregateHierarchy.length > 1) {
      const expectedParent = this.aggregateHierarchy[this.aggregateHierarchy.length - 2];
      if (data.parent && data.parent !== expectedParent) {
        throw new Error(strings.getError('parent_mismatch', {
          expectedParent,
          dataParent: data.parent
        }));
      }
    }
  }

  /**
   * Creates a nested aggregate with children
   * @param {Object} config - Configuration for the aggregate
   * @param {Array} childrenData - Array of child configurations
   * @returns {Promise<BaseClass>} The created aggregate with children
   */
  async createWithChildren(config = {}, childrenData = []) {
    try {
      // Create parent aggregate
      const parentInstance = await this.create(config);
      
      // Create children if provided
      if (childrenData.length > 0) {
        const children = [];
        
        for (const childConfig of childrenData) {
          const childFactory = new AggregateFactory({
            targetClass: childConfig.targetClass,
            dataClass: childConfig.dataClass || this.dataClass,
            aggregateType: childConfig.aggregateType || this.aggregateType,
            aggregateHierarchy: [...this.aggregateHierarchy, childConfig.targetClass],
            maxNestingLevel: this.maxNestingLevel
          });
          
          await childFactory.initialize();
          const childInstance = await childFactory.create(childConfig);
          children.push(childInstance);
        }
        
        // Attach children to parent (if parent supports it)
        if (typeof parentInstance.setChildren === 'function') {
          parentInstance.setChildren(children);
        }
      }
      
      return parentInstance;
    } catch (error) {
      const strings = getStringService();
      throw new Error(strings.getError('failed_to_create_aggregate_with_children_error_mes', { error }));
    }
  }

  /**
   * Creates an aggregate from template
   * @param {string} templateName - Name of the template
   * @param {Object} variables - Template variables
   * @returns {Promise<BaseClass>} The created aggregate instance
   */
  async createFromTemplate(templateName, variables = {}) {
    try {
      const templateData = this.loadAggregateTemplate(templateName);
      const config = this.processTemplateVariables(templateData, variables);
      
      return await this.create(config);
    } catch (error) {
      throw new Error(`Failed to create aggregate from template ${templateName}: ${error.message}`);
    }
  }

  /**
   * Loads aggregate template data
   * @param {string} templateName - Template name
   * @returns {Object} Template data
   */
  loadAggregateTemplate(templateName) {
    // This would typically load from a template file
    // For now, return basic template structure
    const templates = {
      'basic-aggregate': {
        name: '{{name}}',
        factory: 'aggregate-factory',
        dataClass: 'aggregate-data',
        module: 'aggregate/{{name}}',
        children: []
      },
      'nested-aggregate': {
        name: '{{name}}',
        factory: 'aggregate-factory',
        dataClass: 'aggregate-data',
        module: 'aggregate/{{name}}',
        children: [
          {
            name: '{{childName}}',
            factory: 'aggregate-factory',
            dataClass: 'aggregate-data',
            module: 'aggregate/{{childName}}'
          }
        ]
      }
    };
    
    const template = templates[templateName];
    if (!template) {
      const strings = getStringService();
      throw new Error(strings.getError('template_templatename_not_found', { templateName }));
    }
    
    return template;
  }

  /**
   * Processes template variables
   * @param {Object} template - Template data
   * @param {Object} variables - Variables to substitute
   * @returns {Object} Processed template data
   */
  processTemplateVariables(template, variables) {
    const jsonString = JSON.stringify(template);
    const processedString = jsonString.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return variables[varName] || match;
    });
    
    return JSON.parse(processedString);
  }

  /**
   * Gets factory information including hierarchy details
   * @returns {Object} Factory metadata
   */
  getFactoryInfo() {
    return {
      ...super.getFactoryInfo(),
      aggregateType: this.aggregateType,
      maxNestingLevel: this.maxNestingLevel,
      enableHierarchyValidation: this.enableHierarchyValidation,
      hierarchyPath: this.aggregateHierarchy,
      factoryType: 'AggregateFactory'
    };
  }

  /**
   * Validates aggregate hierarchy depth
   * @param {number} depth - Depth to validate
   * @returns {boolean} True if depth is valid
   */
  validateDepth(depth) {
    return depth >= 0 && depth <= this.maxNestingLevel;
  }

  /**
   * Gets the maximum allowed nesting level
   * @returns {number} Maximum nesting level
   */
  getMaxNestingLevel() {
    return this.maxNestingLevel;
  }

  /**
   * Sets the maximum nesting level
   * @param {number} maxLevel - New maximum nesting level
   */
  setMaxNestingLevel(maxLevel) {
    if (typeof maxLevel !== 'number' || maxLevel < 0) {
      const strings = getStringService();
      throw new Error(strings.getError('max_nesting_level_must_be_a_non_negative_number'));
    }
    this.maxNestingLevel = maxLevel;
  }
}

module.exports = AggregateFactory;
