#!/usr/bin/env node

/**
 * BusinessLogicGenerator - Generates business logic classes with initialize/execute pattern
 * Enforces OO plugin rules with single business method requirement
 * 
 * 🚀 Revolutionary Features:
 * - Strict initialize/execute pattern enforcement
 * - Dataclass constructor pattern validation
 * - Base class inheritance requirements
 * - Dependency injection support
 * - Method size and complexity limits
 */

const BaseCodegen = require('../base/base-codegen');
const path = require('path');
const fs = require('fs');

// Import string service
const { getStringService } = require('../../bootstrap/services/string-service');

class BusinessLogicGenerator extends BaseCodegen {
  constructor(options = {}) {
    super({
      ...options,
      outputDir: options.outputDir || './generated-project/src'
    });
    
    this.specification = null;
    this.classesConfig = null;
    this.generatedClasses = new Map();
  }

  /**
   * Initialize business logic generator
   * @returns {Promise<BusinessLogicGenerator>} The initialized generator
   */
  async initialize() {
    await super.initialize();
    const strings = getStringService();

    this.log(strings.getConsole('initializing_business_logic_generator'), 'info');
    
    // Load project specification
    if (this.options.specPath) {
      this.specification = this.loadConfig(this.options.specPath);
    } else if (this.options.specification) {
      this.specification = this.options.specification;
    } else {
      throw new Error('Project specification is required (specPath or specification option)');
    }
    
    // Extract classes configuration
    this.classesConfig = this.specification.classes?.businessLogic || [];
    
    // Validate business logic classes
    this.validateClasses();
    
    // Set project name in options for template processing
    this.options.projectName = this.specification.project?.name || getMessage('generatedproject');
    
    return this;
  }

  /**
   * Generate all business logic classes
   * @param {Object} results - Generation results object
   * @returns {Promise<void>}
   */
  async generate(results) {
    const strings = getStringService();
    this.log(strings.getConsole('generating_business_classes'), 'info');

    try {
      if (this.classesConfig.length === 0) {
        this.log(strings.getConsole('no_business_classes_specified'), 'warning');
        return;
      }

      // Generate each business logic class
      for (const classConfig of this.classesConfig) {
        await this.generateBusinessClass(classConfig);
        this.generatedClasses.set(classConfig.name, classConfig);

        // Trigger innovation features
        this.triggerInnovation('classCreated', { name: classConfig.name });
      }

      // Generate TypeScript definitions
      if (this.options.generateTypeScript !== false) {
        await this.generateTypeScriptDefinitions();
      }

      // Generate test stubs
      if (this.options.generateTests !== false) {
        await this.generateTestStubs();
      }

      // Generate class index
      await this.generateClassIndex();

      this.log(strings.getConsole('business_classes_generated', { count: this.generatedClasses.size }), 'success');

    } catch (error) {
      this.log(strings.getConsole('business_generation_failed', { error: error.message }), 'error');
      throw error;
    }
  }

  /**
   * Generate a single business logic class
   * @param {Object} classConfig - Class configuration
   * @returns {Promise<void>}
   */
  async generateBusinessClass(classConfig) {
    const strings = getStringService();
    this.log(strings.getConsole('generating_class', { name: classConfig.name }), 'info');

    // Validate class configuration
    this.validateClassConfig(classConfig);

    // Generate class content
    const classContent = this.generateClassContent(classConfig);

    // Write class file
    const classPath = `${classConfig.module || 'business'}/${classConfig.name}.js`;
    await this.writeFile(classPath, classContent);

    // Generate data class if specified
    if (classConfig.dataClass) {
      await this.generateDataClass(classConfig);
    }

    // Generate factory if specified
    if (classConfig.factory) {
      await this.generateFactory(classConfig);
    }
  }

  /**
   * Generate class content with initialize/execute pattern
   * @param {Object} classConfig - Class configuration
   * @returns {string} Generated class content
   */
  generateClassContent(classConfig) {
    const baseClass = classConfig.extends || 'BaseClass';
    const dataClass = classConfig.dataClass || `${classConfig.name}Data`;
    const interfaces = classConfig.implements ? classConfig.implements.join(', ') : '';
    const dependencies = this.generateDependencies(classConfig.dependencies || []);
    
    const template = `${dependencies}

/**
 * ${classConfig.name} - ${classConfig.description}
 * 
 * 🚀 Revolutionary Pattern:
 * - Initialize method for setup and configuration
 * - Execute method for single business operation
 * - Dataclass constructor pattern enforced
 * - Base class inheritance required
 * - Maximum 2 methods (except codegen classes)
 * 
 * Generated by RevolutionaryCodegen
 */
class ${classConfig.name} extends ${baseClass}${interfaces ? ' implements ' + interfaces : ''} {
  /**
   * Creates a new ${classConfig.name} instance
   * 🎯 Dataclass Pattern: Single parameter containing all configuration
   * @param {${dataClass}} data - Data class with all configuration
   */
  constructor(data) {
    super(data);
    
    // Dataclass pattern - assign all properties from data
    Object.assign(this, data);
    
    // Store metadata for validation
    this._className = '${classConfig.name}';
    this._dataClass = '${dataClass}';
    this._created = new Date().toISOString();
  }

  /**
   * Initialize the ${classConfig.name} instance
   * 🔧 Setup: Configure dependencies, validate inputs, prepare state
   * @returns {Promise<${classConfig.name}>} The initialized instance
   */
  async initialize() {
    this.log('Initializing ${classConfig.name}...', 'info');
    
    // TODO: Add your initialization logic here
    // Examples:
    // - Load configuration
    // - Set up dependencies
    // - Validate input parameters
    // - Initialize internal state
    // - Connect to external services
${this.generateInitializeLogic(classConfig.initializeLogic)}
    
    this.log('${classConfig.name} initialized successfully', 'success');
    return this;
  }

  /**
   * Execute the primary business operation
   * ⚡ Business Logic: Single method that performs the main operation
   * @param {...any} args - Optional arguments for the operation
   * @returns {Promise<any>} Result of the business operation
   */
  async execute(...args) {
    this.log('Executing ${classConfig.name}...', 'info');
    
    // TODO: Add your business logic here
    // Examples:
    // - Process input data
    // - Perform business calculations
    // - Interact with databases
    // - Call external APIs
    // - Transform and return results
${this.generateExecuteLogic(classConfig.executeLogic)}
    
    this.log('${classConfig.name} execution completed', 'success');
    return this.createResult(args);
  }

${this.generateUtilityMethods(classConfig)}

${this.generateValidationMethods(classConfig)}

${this.generateHelperMethods(classConfig)}
}

module.exports = ${classConfig.name};
`;
    
    return this.processTemplate(template, {
      className: classConfig.name,
      description: classConfig.description,
      dataClass: dataClass,
      baseClass: baseClass
    });
  }

  /**
   * Generate dependency imports
   * @param {Array} dependencies - Array of dependencies
   * @returns {string} Import statements
   */
  generateDependencies(dependencies) {
    if (dependencies.length === 0) {
      return '';
    }
    
    const imports = dependencies.map(dep => {
      if (dep.startsWith('./') || dep.startsWith('../')) {
        return `const ${dep.split('/').pop().replace('.js', '')} = require('${dep}');`;
      } else if (dep.includes('/')) {
        const parts = dep.split('/');
        return `const ${parts[parts.length - 1]} = require('${dep}');`;
      } else {
        return `const ${dep} = require('${dep}');`;
      }
    });
    
    return imports.join('\n') + '\n\n';
  }

  /**
   * Generate initialize method logic
   * @param {string} customLogic - Custom initialization logic
   * @returns {string} Initialize method code
   */
  generateInitializeLogic(customLogic) {
    if (!customLogic) {
      return `    // Initialize default configuration
    this.config = this.config || {};
    
    // Set up default state
    this.state = 'ready';
    
    // Validate required properties
    this.validateRequiredProperties();`;
    }
    
    return `    ${customLogic}`;
  }

  /**
   * Generate execute method logic
   * @param {string} customLogic - Custom execution logic
   * @returns {string} Execute method code
   */
  generateExecuteLogic(customLogic) {
    if (!customLogic) {
      return `    // Default business operation
    const result = {
      success: true,
      data: args,
      timestamp: new Date().toISOString(),
      processedBy: this._className
    };
    
    return result;`;
    }
    
    return `    ${customLogic}`;
  }

  /**
   * Generate utility methods for the class
   * @param {Object} classConfig - Class configuration
   * @returns {string} Utility methods code
   */
  generateUtilityMethods(classConfig) {
    return `  /**
   * Create a standardized result object
   * @param {any} data - Result data
   * @returns {Object} Standardized result
   */
  createResult(data = null) {
    return {
      success: true,
      data: data,
      className: this._className,
      timestamp: new Date().toISOString(),
      executionId: this.generateExecutionId()
    };
  }

  /**
   * Generate a unique execution ID
   * @returns {string} Unique ID
   */
  generateExecutionId() {
    return \`\${this._className}_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }

  /**
   * Log a message with class context
   * @param {string} message - Message to log
   * @param {string} level - Log level
   * @returns {void}
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = \`[\${timestamp}] [\${this._className}]\`;
    
    switch (level) {
      case 'success':
        console.log(\`\\x1b[32m\${prefix} ✓ \${message}\\x1b[0m\`);
        break;
      case 'warning':
        console.log(\`\\x1b[33m\${prefix} ⚠ \${message}\\x1b[0m\`);
        break;
      case 'error':
        console.log(\`\\x1b[31m\${prefix} ✗ \${message}\\x1b[0m\`);
        break;
      default:
        console.log(\`\${prefix} \${message}\`);
    }
  }`;
  }

  /**
   * Generate validation methods
   * @param {Object} classConfig - Class configuration
   * @returns {string} Validation methods code
   */
  generateValidationMethods(classConfig) {
    return `  /**
   * Validate required properties
   * @returns {boolean} True if valid
   * @throws {Error} If validation fails
   */
  validateRequiredProperties() {
    // TODO: Add your validation logic here
    // Examples:
    // - Check required fields
    // - Validate data formats
    // - Check value ranges
    // - Verify business rules
    
    // Base validation - ensure data object exists
    if (!this.data) {
      throw new Error('Data object is required for ${classConfig.name}');
    }
    
    return true;
  }

  /**
   * Validate business rules
   * @returns {boolean} True if valid
   * @throws {Error} If validation fails
   */
  validateBusinessRules() {
    // TODO: Add business rule validation
    // Examples:
    // - Check business constraints
    // - Validate state transitions
    // - Ensure data consistency
    // - Check permission requirements
    
    return true;
  }`;
  }

  /**
   * Generate helper methods
   * @param {Object} classConfig - Class configuration
   * @returns {string} Helper methods code
   */
  generateHelperMethods(classConfig) {
    return `  /**
   * Get class information
   * @returns {Object} Class metadata
   */
  getClassInfo() {
    return {
      name: this._className,
      dataClass: this._dataClass,
      created: this._created,
      state: this.state || 'unknown',
      version: '1.0.0'
    };
  }

  /**
   * Reset the class state
   * @returns {void}
   */
  reset() {
    this.state = 'reset';
    this.log(getConsole('class_state_reset'), 'info');
  }

  /**
   * Get execution statistics
   * @returns {Object} Execution statistics
   */
  getExecutionStats() {
    return {
      className: this._className,
      state: this.state,
      created: this._created,
      lastExecution: this.lastExecution || null
    };
  }`;
  }

  /**
   * Generate data class for business logic
   * @param {Object} classConfig - Class configuration
   * @returns {Promise<void>}
   */
  async generateDataClass(classConfig) {
    const dataClassName = classConfig.dataClass || `${classConfig.name}Data`;
    const dataClassContent = this.generateDataClassContent(classConfig, dataClassName);
    
    const dataPath = `data/${dataClassName}.js`;
    await this.writeFile(dataPath, dataClassContent);
  }

  /**
   * Generate data class content
   * @param {Object} classConfig - Class configuration
   * @param {string} dataClassName - Data class name
   * @returns {string} Data class content
   */
  generateDataClassContent(classConfig, dataClassName) {
    return `const BaseData = require('../base/base-data.js');

/**
 * ${dataClassName} - Data class for ${classConfig.name}
 * 
 * 🚀 Revolutionary Pattern:
 * - Property validation
 * - Type safety
 * - Business rule enforcement
 * - Serialization support
 * 
 * Generated by RevolutionaryCodegen
 */
class ${dataClassName} extends BaseData {
  /**
   * Creates a new ${dataClassName} instance
   * @param {Object} data - Raw data object
   */
  constructor(data = {}) {
    super(data);
    
    // TODO: Add your data properties here
    // Examples:
    // this.id = data.id || this.generateId();
    // this.name = data.name;
    // this.value = data.value;
    // this.created = data.created || new Date();
    
    // Store configuration if provided
    if (classConfig.config) {
${Object.keys(classConfig.config).map(key => `      this.${key} = data.${key} || ${JSON.stringify(classConfig.config[key])};`).join('\n')}
    }
  }

  /**
   * Validate data according to business rules
   * @returns {boolean} True if valid
   * @throws {Error} If validation fails
   */
  validate() {
    super.validate();
    
    // TODO: Add your validation logic here
    // Examples:
    // - Check required fields
    // - Validate data types
    // - Check value ranges
    // - Validate formats
    
    return true;
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      ...this,
      dataClass: '${dataClassName}',
      generatedBy: 'RevolutionaryCodegen'
    };
  }

  /**
   * Get data class information
   * @returns {Object} Data class metadata
   */
  getDataClassInfo() {
    return {
      name: '${dataClassName}',
      targetClass: '${classConfig.name}',
      properties: Object.keys(this).filter(key => !key.startsWith('_')),
      validated: this.isValid()
    };
  }
}

module.exports = ${dataClassName};
`;
  }

  /**
   * Generate factory class for business logic
   * @param {Object} classConfig - Class configuration
   * @returns {Promise<void>}
   */
  async generateFactory(classConfig) {
    const factoryName = classConfig.factory || `${classConfig.name}Factory`;
    const factoryContent = this.generateFactoryContent(classConfig, factoryName);
    
    const factoryPath = `factories/${factoryName}.js`;
    await this.writeFile(factoryPath, factoryContent);
  }

  /**
   * Generate factory class content
   * @param {Object} classConfig - Class configuration
   * @param {string} factoryName - Factory name
   * @returns {string} Factory class content
   */
  generateFactoryContent(classConfig, factoryName) {
    const dataClassName = classConfig.dataClass || `${classConfig.name}Data`;
    
    return `const BaseFactory = require('../base/base-factory.js');
const ${classConfig.name} = require('../${classConfig.module || 'business'}/${classConfig.name}.js');
const ${dataClassName} = require('../data/${dataClassName}.js');

/**
 * ${factoryName} - Factory for creating ${classConfig.name} instances
 * 
 * 🚀 Revolutionary Pattern:
 * - Dependency injection support
 * - Configuration validation
 * - Instance pooling
 * - Lifecycle management
 * 
 * Generated by RevolutionaryCodegen
 */
class ${factoryName} extends BaseFactory {
  /**
   * Creates a new ${factoryName} instance
   * @param {Object} options - Factory configuration options
   */
  constructor(options = {}) {
    super({
      targetClass: ${classConfig.name},
      dataClass: ${dataClassName},
      defaultConfig: ${JSON.stringify(classConfig.config || {})},
      ...options
    });
  }

  /**
   * Create a new ${classConfig.name} instance
   * @param {Object} config - Instance configuration
   * @returns {Promise<${classConfig.name}>} Created instance
   */
  async create(config = {}) {
    try {
      // Merge with default configuration
      const finalConfig = { ...this.defaultConfig, ...config };
      
      // Create data instance
      const data = new ${dataClassName}(finalConfig);
      await data.initialize();
      
      // Validate data
      data.validate();
      
      // Create business logic instance
      const instance = new ${classConfig.name}(data);
      await instance.initialize();
      
      this.log(\`Created \${this.targetClass.name} instance successfully\`, 'success');
      return instance;
      
    } catch (error) {
      this.log(\`Failed to create \${this.targetClass.name}: \${error.message}\`, 'error');
      throw error;
    }
  }

  /**
   * Create multiple instances
   * @param {Array} configs - Array of configurations
   * @returns {Promise<Array>} Array of instances
   */
  async createBatch(configs) {
    const instances = [];
    
    for (const config of configs) {
      const instance = await this.create(config);
      instances.push(instance);
    }
    
    this.log(\`Created \${instances.length} \${this.targetClass.name} instances\`, 'success');
    return instances;
  }

  /**
   * Get factory information
   * @returns {Object} Factory metadata
   */
  getFactoryInfo() {
    return {
      name: '${factoryName}',
      targetClass: '${classConfig.name}',
      dataClass: '${dataClassName}',
      instancesCreated: this.instancesCreated || 0,
      successRate: this.calculateSuccessRate()
    };
  }
}

module.exports = ${factoryName};
`;
  }

  /**
   * Generate TypeScript definitions
   * @returns {Promise<void>}
   */
  async generateTypeScriptDefinitions() {
    const strings = getStringService();
    this.log(strings.getConsole('generating_typescript_definitions'), 'info');

    let tsContent = `/**
 * TypeScript definitions for business logic classes
 * Generated by RevolutionaryCodegen
 */

`;

    for (const [className, classConfig] of this.generatedClasses) {
      tsContent += this.generateTypeScriptDefinition(classConfig);
    }

    await this.writeFile('types/index.d.ts', tsContent, { addHeader: false });
  }

  /**
   * Generate TypeScript definition for a class
   * @param {Object} classConfig - Class configuration
   * @returns {string} TypeScript definition
   */
  generateTypeScriptDefinition(classConfig) {
    const dataClassName = classConfig.dataClass || `${classConfig.name}Data`;
    
    return `declare class ${classConfig.name} {
  constructor(data: ${dataClassName});
  initialize(): Promise<${classConfig.name}>;
  execute(...args: any[]): Promise<any>;
  reset(): void;
  getClassInfo(): {
    name: string;
    dataClass: string;
    created: string;
    state: string;
    version: string;
  };
  getExecutionStats(): {
    className: string;
    state: string;
    created: string;
    lastExecution: string | null;
  };
}

declare class ${dataClassName} {
  constructor(data?: any);
  validate(): boolean;
  toObject(): any;
  getDataClassInfo(): {
    name: string;
    targetClass: string;
    properties: string[];
    validated: boolean;
  };
}

`;
  }

  /**
   * Generate test stubs
   * @returns {Promise<void>}
   */
  async generateTestStubs() {
    const strings = getStringService();
    this.log(strings.getConsole('generating_test_stubs'), 'info');

    for (const [className, classConfig] of this.generatedClasses) {
      const testContent = this.generateTestStub(classConfig);
      const testPath = `test/${className}.test.js`;
      await this.writeFile(testPath, testContent);
    }
  }

  /**
   * Generate test stub for a class
   * @param {Object} classConfig - Class configuration
   * @returns {string} Test stub content
   */
  generateTestStub(classConfig) {
    const dataClassName = classConfig.dataClass || `${classConfig.name}Data`;
    
    return `const ${classConfig.name} = require('../src/${classConfig.module || 'business'}/${classConfig.name}.js');
const ${dataClassName} = require('../src/data/${dataClassName}.js');
const { getStringService } = require('../bootstrap/services/string-service');
const strings = getStringService();


describe('${classConfig.name}', () => {
  let instance;
  let data;

  beforeEach(() => {
    data = new ${dataClassName}({
      // TODO: Add test data here
    });
    
    instance = new ${classConfig.name}(data);
  });

  afterEach(() => {
    if (instance) {
      instance.reset();
    }
  });

  describe('initialize', () => {
    it(getMessage('should_initialize_successfully'), async () => {
      const result = await instance.initialize();
      
      expect(result).toBe(instance);
      expect(instance.getClassInfo().state).toBe('ready');
    });
  });

  describe('execute', () => {
    it(getConsole('should_execute_business_logic'), async () => {
      const result = await instance.execute('test-data');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('validation', () => {
    it(getError('should_validate_required_properties'), () => {
      expect(() => {
        new ${classConfig.name}(null);
      }).toThrow();
    });
  });

  // TODO: Add more test cases here
  // Examples:
  // - Error handling tests
  // - Business rule validation tests
  // - Integration tests
  // - Performance tests
});
`;
  }

  /**
   * Generate class index file
   * @returns {Promise<void>}
   */
  async generateClassIndex() {
    const strings = getStringService();
    this.log(strings.getConsole('generating_class_index'), 'info');

    let indexContent = `/**
 * Business logic classes index
 * Generated by RevolutionaryCodegen
 */

`;

    // Add exports for each class
    for (const [className, classConfig] of this.generatedClasses) {
      const modulePath = classConfig.module || 'business';
      indexContent += `const ${className} = require('./${modulePath}/${className}.js');\n`;
    }

    indexContent += '\nmodule.exports = {\n';

    for (const [className] of this.generatedClasses) {
      indexContent += `  ${className},\n`;
    }

    indexContent += '};\n';

    await this.writeFile('index.js', indexContent, { addHeader: false });
  }

  /**
   * Validate business logic classes configuration
   * @returns {void}
   */
  validateClasses() {
    if (!Array.isArray(this.classesConfig)) {
      throw new Error(getError('business_logic_classes_must_be_an_array'));
    }
    
    for (const classConfig of this.classesConfig) {
      this.validateClassConfig(classConfig);
    }
  }

  /**
   * Validate individual class configuration
   * @param {Object} classConfig - Class configuration
   * @returns {void}
   */
  validateClassConfig(classConfig) {
    if (!classConfig.name) {
      throw new Error(getError('class_name_is_required'));
    }
    
    if (!classConfig.description) {
      throw new Error(getError('class_description_is_required'));
    }
    
    if (!classConfig.module) {
      throw new Error(getError('class_module_path_is_required'));
    }
    
    // Validate naming conventions
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(classConfig.name)) {
      throw new Error(`Class name '${classConfig.name}' must follow PascalCase convention`);
    }
  }

  /**
   * Register cleanup operations
   * @returns {Promise<void>}
   */
  async registerCleanupOperations() {
    // Clean up temporary files
    this.registerCleanupOperation({
      type: 'cleanCache',
      path: path.join(this.options.outputDir, '.cache')
    });
  }

  /**
   * Get generation statistics
   * @returns {Object} Statistics
   */
  getGenerationStats() {
    return {
      classesGenerated: this.generatedClasses.size,
      businessLogicClasses: this.classesConfig.length,
      ...super.getStats()
    };
  }
}

module.exports = BusinessLogicGenerator;
