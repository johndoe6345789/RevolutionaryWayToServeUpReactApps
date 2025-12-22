#!/usr/bin/env node

/**
 * AggregateGetMethodsGenerator - Generates get methods for nested aggregate classes
 * Creates methods that return class instances for unlimited nesting levels
 */

const BaseCodegen = require('./base-codegen');
const path = require('path');

class AggregateGetMethodsGenerator extends BaseCodegen {
  constructor(options = {}) {
    super({
      ...options,
      outputDir: options.outputDir || './bootstrap/generated/aggregate'
    });
    
    this.constantsPath = options.constantsPath || './bootstrap/aggregate/class-constants.json';
    this.aggregateData = null;
    this.aggregates = new Map();
  }

  /**
   * Initialize the generator and load aggregate data
   * @returns {Promise<AggregateGetMethodsGenerator>} The initialized generator
   */
  async initialize() {
    await super.initialize();
    
    // Load aggregate constants
    this.aggregateData = this.loadConfig(this.constantsPath);
    
    // Process aggregate hierarchy
    this.processAggregateHierarchy();
    
    return this;
  }

  /**
   * Generate get methods for all aggregates
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generate(results) {
    this.log('Generating aggregate get methods...', 'info');
    
    // Generate get methods for each aggregate class
    for (const [aggregateName, aggregateInfo] of this.aggregates) {
      await this.generateAggregateGetMethods(aggregateName, aggregateInfo, results);
    }
    
    // Generate index file for easy importing
    await this.generateAggregateIndex(results);
    
    // Generate type definitions for TypeScript
    await this.generateTypeDefinitions(results);
  }

  /**
   * Process aggregate hierarchy from JSON data
   * @returns {void}
   */
  processAggregateHierarchy() {
    const classes = this.aggregateData.classes || [];
    
    // Build aggregate map
    for (const classData of classes) {
      this.aggregates.set(classData.name, {
        ...classData,
        children: classData.children || [],
        getMethods: []
      });
    }
    
    // Build parent-child relationships
    for (const [name, aggregate] of this.aggregates) {
      if (aggregate.parent) {
        const parent = this.aggregates.get(aggregate.parent);
        if (parent) {
          parent.children.push(aggregate);
        }
      }
    }
    
    // Generate get method names
    this.generateGetMethodNames();
  }

  /**
   * Generate appropriate get method names for aggregates
   * @returns {void}
   */
  generateGetMethodNames() {
    for (const [name, aggregate] of this.aggregates) {
      // Generate get method name (e.g., getUserService, getProviderUtilities)
      const methodName = this.generateMethodName(name);
      aggregate.getMethodName = methodName;
      aggregate.getMethodPath = this.generateMethodPath(aggregate);
      
      // Generate get methods for all descendants
      this.generateDescendantGetMethods(aggregate);
    }
  }

  /**
   * Generate get method name from class name
   * @param {string} className - Class name
   * @returns {string} Get method name
   */
  generateMethodName(className) {
    // Convert PascalCase to camelCase with 'get' prefix
    const camelCase = className.replace(/([A-Z])/g, ' $1').trim().replace(/\s+/g, '').toLowerCase();
    return `get${className}`;
  }

  /**
   * Generate method path for aggregate
   * @param {Object} aggregate - Aggregate info
   * @returns {string} Method path
   */
  generateMethodPath(aggregate) {
    const path = [];
    let current = aggregate;
    
    while (current) {
      path.unshift(current.name);
      current = current.parent ? this.aggregates.get(current.parent) : null;
    }
    
    return path.join('.');
  }

  /**
   * Generate get methods for all descendants of an aggregate
   * @param {Object} aggregate - Parent aggregate
   * @returns {void}
   */
  generateDescendantGetMethods(aggregate) {
    const generateForDescendants = (agg, prefix = '') => {
      for (const child of agg.children) {
        const childAggregate = this.aggregates.get(child.name);
        if (childAggregate) {
          const methodName = prefix ? `${prefix}${childAggregate.getMethodName}` : childAggregate.getMethodName;
          aggregate.getMethods.push({
            name: methodName,
            target: childAggregate.name,
            path: this.generateMethodPath(childAggregate),
            nestingLevel: childAggregate.nestingLevel
          });
          
          // Recursively generate for descendants
          generateForDescendants(childAggregate, methodName);
        }
      }
    };
    
    generateForDescendants(aggregate);
  }

  /**
   * Generate get methods for a specific aggregate
   * @param {string} aggregateName - Name of the aggregate
   * @param {Object} aggregateInfo - Aggregate information
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateAggregateGetMethods(aggregateName, aggregateInfo, results) {
    this.log(`Generating get methods for ${aggregateName}...`, 'info');
    
    const className = `${aggregateName}WithGetMethods`;
    const content = this.generateAggregateClass(aggregateName, aggregateInfo);
    
    await this.writeFile(`${className}.js`, content);
    
    // Generate TypeScript definitions
    const tsContent = this.generateAggregateTypeScript(aggregateName, aggregateInfo);
    await this.writeFile(`${className}.d.ts`, tsContent, { addHeader: false });
  }

  /**
   * Generate the aggregate class with get methods
   * @param {string} aggregateName - Name of the aggregate
   * @param {Object} aggregateInfo - Aggregate information
   * @returns {string} Generated class content
   */
  generateAggregateClass(aggregateName, aggregateInfo) {
    const className = `${aggregateName}WithGetMethods`;
    const baseClass = aggregateInfo.extends || 'BaseClass';
    
    const template = `const BaseClass = require('../base/base-class.js');
const AggregateData = require('../data/aggregate-data.js');
const ${aggregateName}Factory = require('../factories/${aggregateInfo.factory}.js');

/**
 * ${className} - ${aggregateName} with auto-generated get methods
 * Provides unlimited nesting drill-down capability
 * Auto-generated by AggregateGetMethodsGenerator
 */
class ${className} extends BaseClass {
  /**
   * Creates a new ${className} instance
   * @param {Object} data - Configuration data
   */
  constructor(data) {
    super(data);
    this.aggregateName = '${aggregateName}';
    this.nestingLevel = ${aggregateInfo.nestingLevel || 0};
    this.maxNestingLevel = ${this.aggregateData.constants?.maxNestingLevel || 5};
    this.factoryPath = '${aggregateInfo.factory}';
    this.dataClass = '${aggregateInfo.dataClass}';
    this.modulePath = '${aggregateInfo.module}';
  }

  /**
   * Initializes the aggregate with get methods
   * @returns {Promise<${className}>} The initialized instance
   */
  async initialize() {
    // Initialize base aggregate
    this.aggregate = await this.createAggregate();
    return super.initialize();
  }

  /**
   * The ONE additional method - delegates to aggregate execute
   * @returns {Promise<any>} Result of aggregate execution
   */
  async execute() {
    return await this.aggregate.execute();
  }

  /**
   * Create the underlying aggregate instance
   * @returns {Promise<Object>} The aggregate instance
   */
  async createAggregate() {
    const factory = new ${aggregateName}Factory({
      targetClass: '${aggregateName}',
      dataClass: this.dataClass,
      module: this.modulePath,
      config: ${JSON.stringify(aggregateInfo.config || {})}
    });
    
    await factory.initialize();
    return await factory.create();
  }

  /**
   * Validates nesting level against maximum
   * @param {number} level - Current nesting level
   * @returns {boolean} True if within limits
   */
  validateNestingLevel(level) {
    if (level > this.maxNestingLevel) {
      throw new Error(\`Nesting level \${level} exceeds maximum \${this.maxNestingLevel}\`);
    }
    return true;
  }

${this.generateGetMethodsCode(aggregateInfo)}
${this.generateUtilityMethods(aggregateInfo)}
}

module.exports = ${className};
`;
    
    return template;
  }

  /**
   * Generate get methods code for an aggregate
   * @param {Object} aggregateInfo - Aggregate information
   * @returns {string} Get methods code
   */
  generateGetMethodsCode(aggregateInfo) {
    let methodsCode = '';
    
    // Add get method for self
    methodsCode += `  /**
   * Gets the ${aggregateInfo.name} aggregate
   * @param {Object} config - Optional configuration
   * @returns {Promise<Object>} The ${aggregateInfo.name} instance
   */
  async get${aggregateInfo.name}(config = {}) {
    this.validateNestingLevel(${aggregateInfo.nestingLevel || 0});
    return await this.aggregate;
  }

`;
    
    // Add get methods for children
    for (const child of aggregateInfo.children) {
      const childAggregate = this.aggregates.get(child.name);
      if (childAggregate) {
        methodsCode += `  /**
   * Gets the ${childAggregate.name} aggregate
   * @param {Object} config - Optional configuration
   * @returns {Promise<Object>} The ${childAggregate.name} instance
   */
  async get${childAggregate.name}(config = {}) {
    this.validateNestingLevel(${childAggregate.nestingLevel || 0});
    
    const FactoryClass = require('../factories/${childAggregate.factory}.js');
    const factory = new FactoryClass({
      ...config,
      targetClass: '${childAggregate.name}',
      dataClass: '${childAggregate.dataClass}',
      aggregateHierarchy: this.getAggregatePath('${childAggregate.name}')
    });
    
    await factory.initialize();
    return await factory.create(config);
  }

`;
      }
    }
    
    // Add get methods for all descendants
    for (const getMethod of aggregateInfo.getMethods) {
      if (getMethod.target !== aggregateInfo.name) {
        methodsCode += `  /**
   * Gets the ${getMethod.target} aggregate (descendant)
   * @param {Object} config - Optional configuration
   * @returns {Promise<Object>} The ${getMethod.target} instance
   */
  async ${getMethod.name}(config = {}) {
    this.validateNestingLevel(${getMethod.nestingLevel});
    
    const FactoryClass = require('../factories/${this.aggregates.get(getMethod.target).factory}.js');
    const factory = new FactoryClass({
      ...config,
      targetClass: '${getMethod.target}',
      dataClass: '${this.aggregates.get(getMethod.target).dataClass}',
      aggregateHierarchy: this.getAggregatePath('${getMethod.target}')
    });
    
    await factory.initialize();
    return await factory.create(config);
  }

`;
      }
    }
    
    return methodsCode;
  }

  /**
   * Generate utility methods for aggregate navigation
   * @param {Object} aggregateInfo - Aggregate information
   * @returns {string} Utility methods code
   */
  generateUtilityMethods(aggregateInfo) {
    return `  /**
   * Gets the full path to an aggregate from root
   * @param {string} aggregateName - Target aggregate name
   * @returns {Array} Path from root to aggregate
   */
  getAggregatePath(aggregateName) {
    const path = [];
    let current = this.aggregates?.get(aggregateName) || this.findAggregate(aggregateName);
    
    while (current) {
      path.unshift(current.name);
      if (current.parent) {
        current = this.findAggregate(current.parent);
      } else {
        break;
      }
    }
    
    return path;
  }

  /**
   * Finds an aggregate by name
   * @param {string} name - Aggregate name to find
   * @returns {Object|null} Aggregate info or null
   */
  findAggregate(name) {
    // This would be populated during initialization with all aggregates
    const aggregates = ${JSON.stringify(Object.fromEntries(this.aggregates))};
    return aggregates[name] || null;
  }

  /**
   * Gets all child aggregates
   * @returns {Array} Array of child aggregate names
   */
  getChildren() {
    return ${JSON.stringify(aggregateInfo.children.map(child => child.name))};
  }

  /**
   * Gets all descendant aggregates
   * @returns {Array} Array of all descendant aggregate names
   */
  getAllDescendants() {
    return ${JSON.stringify(aggregateInfo.getMethods.map(method => method.target))};
  }

  /**
   * Gets aggregate hierarchy information
   * @returns {Object} Hierarchy statistics
   */
  getHierarchyInfo() {
    return {
      name: '${aggregateInfo.name}',
      nestingLevel: ${aggregateInfo.nestingLevel || 0},
      children: this.getChildren(),
      descendants: this.getAllDescendants(),
      maxNestingLevel: this.maxNestingLevel,
      totalGetMethods: ${aggregateInfo.getMethods.length + 1}
    };
  }
`;
  }

  /**
   * Generate TypeScript definitions for an aggregate
   * @param {string} aggregateName - Name of the aggregate
   * @param {Object} aggregateInfo - Aggregate information
   * @returns {string} TypeScript definitions
   */
  generateAggregateTypeScript(aggregateName, aggregateInfo) {
    const className = `${aggregateName}WithGetMethods`;
    const getMethodSignatures = this.generateGetMethodSignatures(aggregateInfo);
    
    return `/**
 * ${className} TypeScript definitions
 * Auto-generated by AggregateGetMethodsGenerator
 */

import { BaseClass } from '../base/base-class';

declare class ${className} extends BaseClass {
  aggregateName: string;
  nestingLevel: number;
  maxNestingLevel: number;
  factoryPath: string;
  dataClass: string;
  modulePath: string;
  aggregate: any;

  initialize(): Promise<${className}>;
  execute(): Promise<any>;
  createAggregate(): Promise<any>;
  validateNestingLevel(level: number): boolean;

${getMethodSignatures}

  getAggregatePath(aggregateName: string): string[];
  findAggregate(name: string): any;
  getChildren(): string[];
  getAllDescendants(): string[];
  getHierarchyInfo(): {
    name: string;
    nestingLevel: number;
    children: string[];
    descendants: string[];
    maxNestingLevel: number;
    totalGetMethods: number;
  };
}

export default ${className};
`;
  }

  /**
   * Generate TypeScript method signatures
   * @param {Object} aggregateInfo - Aggregate information
   * @returns {string} Method signatures
   */
  generateGetMethodSignatures(aggregateInfo) {
    let signatures = '';
    
    // Self method
    signatures += `  get${aggregateInfo.name}(config?: any): Promise<any>;\n`;
    
    // Child methods
    for (const child of aggregateInfo.children) {
      signatures += `  get${child.name}(config?: any): Promise<any>;\n`;
    }
    
    // Descendant methods
    for (const getMethod of aggregateInfo.getMethods) {
      if (getMethod.target !== aggregateInfo.name) {
        signatures += `  ${getMethod.name}(config?: any): Promise<any>;\n`;
      }
    }
    
    return signatures;
  }

  /**
   * Generate aggregate index file
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateAggregateIndex(results) {
    const imports = [];
    const exports = [];
    
    for (const [name] of this.aggregates) {
      const className = `${name}WithGetMethods`;
      imports.push(`const ${className} = require('./${className}.js');`);
      exports.push(`  ${name}: ${className},`);
    }
    
    const indexContent = `${imports.join('\n')}

/**
 * Auto-generated aggregate get methods index
 * Generated by AggregateGetMethodsGenerator
 */

module.exports = {
${exports.join('\n')}
};
`;
    
    await this.writeFile('index.js', indexContent, { addHeader: false });
  }

  /**
   * Generate TypeScript definitions index
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateTypeDefinitions(results) {
    const exports = [];
    
    for (const [name] of this.aggregates) {
      const className = `${name}WithGetMethods`;
      exports.push(`export { default as ${name} } from './${className}.d.ts';`);
    }
    
    const indexContent = `/**
 * Auto-generated TypeScript definitions index
 * Generated by AggregateGetMethodsGenerator
 */

${exports.join('\n')}
`;
    
    await this.writeFile('index.d.ts', indexContent, { addHeader: false });
  }

  /**
   * Register cleanup operations
   * @returns {Promise<void>}
   */
  async registerCleanupOperations() {
    // Register cleanup for any temporary files
    this.registerCleanupOperation({
      type: 'deleteFile',
      path: path.join(this.options.outputDir, '.cache')
    });
  }
}

module.exports = AggregateGetMethodsGenerator;
