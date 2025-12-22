#!/usr/bin/env node

/**
 * DataClassGenerator - Generates data classes from JSON metadata
 * Creates data ferrying classes with validation and type safety
 */

const BaseCodegen = require('./base-codegen');
const path = require('path');
const fs = require('fs');

class DataClassGenerator extends BaseCodegen {
  constructor(options = {}) {
    super({
      ...options,
      outputDir: options.outputDir || './bootstrap/generated/data'
    });
    
    this.constantsPath = options.constantsPath || './bootstrap/aggregate/class-constants.json';
    this.bootstrapPath = options.bootstrapPath || './bootstrap';
    this.aggregateData = null;
    this.dataClasses = new Map();
  }

  /**
   * Initialize the data class generator and load metadata
   * @returns {Promise<DataClassGenerator>} The initialized generator
   */
  async initialize() {
    await super.initialize();
    
    // Load aggregate constants
    this.aggregateData = this.loadConfig(this.constantsPath);
    
    // Scan for existing data classes
    await this.scanForDataClasses();
    
    // Process data class specifications
    this.processDataClassSpecifications();
    
    return this;
  }

  /**
   * Scan for existing data classes
   * @returns {Promise<void>}
   */
  async scanForDataClasses() {
    this.log('Scanning for existing data classes...', 'info');
    
    const dataClasses = new Map();
    const scanDirectory = (dir, relativePath = '') => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const itemRelativePath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          scanDirectory(fullPath, itemRelativePath);
        } else if (item.endsWith('.js') && item.endsWith('-data.js')) {
          this.extractDataClassFromFile(fullPath, itemRelativePath, dataClasses);
        }
      }
    };
    
    scanDirectory(path.join(this.bootstrapPath, 'data'));
    
    this.dataClasses = dataClasses;
    this.log(`Found ${dataClasses.size} existing data classes`, 'info');
  }

  /**
   * Extract data class information from a file
   * @param {string} filePath - Path to the file
   * @param {string} relativePath - Relative path
   * @param {Map} dataClasses - Data classes map to populate
   * @returns {void}
   */
  extractDataClassFromFile(filePath, relativePath, dataClasses) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract class name
      const classMatch = content.match(/class\s+(\w+Data)\s+extends\s+(\w+)/);
      if (!classMatch) return;
      
      const className = classMatch[1];
      const extendsClass = classMatch[2];
      
      // Extract properties
      const properties = this.extractPropertiesFromContent(content);
      
      // Extract validation methods
      const validationMethods = this.extractValidationMethods(content);
      
      dataClasses.set(className, {
        name: className,
        extends: extendsClass,
        filePath: relativePath,
        properties: properties,
        validationMethods: validationMethods,
        hasValidation: validationMethods.length > 0
      });
      
    } catch (error) {
      this.log(`Error scanning data class file ${filePath}: ${error.message}`, 'warning');
    }
  }

  /**
   * Extract properties from class content
   * @param {string} content - File content
   * @returns {Array} Array of property objects
   */
  extractPropertiesFromContent(content) {
    const properties = [];
    
    // Look for constructor assignments
    const constructorMatch = content.match(/constructor\s*\([^)]*\)\s*\{([^}]*)\}/);
    if (constructorMatch) {
      const constructorBody = constructorMatch[1];
      
      // Extract property assignments
      const propertyRegex = /this\.(\w+)\s*=\s*(?:data\.(\w+)|([^;]+);/g;
      let match;
      
      while ((match = propertyRegex.exec(constructorBody)) !== null) {
        const propertyName = match[1];
        const dataProperty = match[2] || propertyName;
        const assignment = match[3];
        
        // Infer type from assignment
        let type = 'any';
        if (assignment) {
          if (assignment.includes('[]')) type = 'array';
          else if (assignment.includes('{}')) type = 'object';
          else if (assignment.includes("'") || assignment.includes("'")) type = 'string';
          else if (assignment.match(/^\d/)) type = 'number';
          else if (assignment.includes('true') || assignment.includes('false')) type = 'boolean';
        }
        
        properties.push({
          name: propertyName,
          dataProperty: dataProperty,
          type: type,
          required: true,
          default: null
        });
      }
    }
    
    return properties;
  }

  /**
   * Extract validation methods from content
   * @param {string} content - File content
   * @returns {Array} Array of validation method objects
   */
  extractValidationMethods(content) {
    const validationMethods = [];
    
    // Look for validation method patterns
    const validationRegex = /(validate\w*)\s*\([^)]*\)\s*\{([^}]*)\}/g;
    let match;
    
    while ((match = validationRegex.exec(content)) !== null) {
      const methodName = match[1];
      const methodBody = match[2];
      
      // Extract validation rules from method body
      const rules = this.extractValidationRules(methodBody);
      
      validationMethods.push({
        name: methodName,
        body: methodBody,
        rules: rules
      });
    }
    
    return validationMethods;
  }

  /**
   * Extract validation rules from method body
   * @param {string} methodBody - Method body content
   * @returns {Array} Array of validation rule objects
   */
  extractValidationRules(methodBody) {
    const rules = [];
    
    // Look for common validation patterns
    const patterns = [
      { type: 'required', regex: /if\s*\(\s*!\s*this\.(\w+)\s*\)/ },
      { type: 'minLength', regex: /if\s*\(\s*this\.(\w+)\.length\s*<\s*(\d+)\s*\)/ },
      { type: 'maxLength', regex: /if\s*\(\s*this\.(\w+)\.length\s*>\s*(\d+)\s*\)/ },
      { type: 'pattern', regex: /if\s*\(\s*!\s*(\w+)\.test\s*\(\s*this\.(\w+)\s*\)\s*\)/ },
      { type: 'range', regex: /if\s*\(\s*\(?\s*this\.(\w+)\s*[<>]\s*(\d+)\s*\)/ }
    ];
    
    for (const pattern of patterns) {
      const match = methodBody.match(pattern.regex);
      if (match) {
        rules.push({
          type: pattern.type,
          property: match[1],
          value: match[2],
          message: this.inferValidationMessage(pattern.type, match[1], match[2])
        });
      }
    }
    
    return rules;
  }

  /**
   * Infer validation message from pattern
   * @param {string} type - Validation type
   * @param {string} property - Property name
   * @param {string} value - Validation value
   * @returns {string} Inferred validation message
   */
  inferValidationMessage(type, property, value) {
    switch (type) {
      case 'required':
        return `${property} is required`;
      case 'minLength':
        return `${property} must be at least ${value} characters`;
      case 'maxLength':
        return `${property} must be no more than ${value} characters`;
      case 'pattern':
        return `${property} format is invalid`;
      case 'range':
        return `${property} must be within valid range`;
      default:
        return `${property} is invalid`;
    }
  }

  /**
   * Process data class specifications from aggregate data
   * @returns {void}
   */
  processDataClassSpecifications() {
    this.log('Processing data class specifications...', 'info');
    
    if (!this.aggregateData.classes) return;
    
    // Process each class in aggregate data
    for (const classSpec of this.aggregateData.classes) {
      const className = `${classSpec.name}Data`;
      const existingDataClass = this.dataClasses.get(className);
      
      if (existingDataClass) {
        // Update existing data class with specification
        existingDataClass.specification = classSpec;
        existingDataClass.config = classSpec.config;
        existingDataClass.nestingLevel = classSpec.nestingLevel;
      } else {
        // Create new data class from specification
        this.dataClasses.set(className, {
          name: className,
          extends: 'BaseData',
          filePath: null,
          specification: classSpec,
          config: classSpec.config,
          nestingLevel: classSpec.nestingLevel || 0,
          properties: [],
          validationMethods: [],
          hasValidation: false,
          generated: true
        });
      }
    }
  }

  /**
   * Generate data classes
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generate(results) {
    this.log('Generating data classes...', 'info');
    
    // Generate data classes for all specifications
    for (const [className, classInfo] of this.dataClasses) {
      if (classInfo.generated || !classInfo.filePath) {
        await this.generateDataClass(className, classInfo, results);
      }
    }
    
    // Generate data class index
    await this.generateDataClassIndex(results);
    
    // Generate TypeScript definitions
    await this.generateTypeDefinitions(results);
    
    // Generate validation schemas
    await this.generateValidationSchemas(results);
  }

  /**
   * Generate a data class
   * @param {string} className - Name of the data class
   * @param {Object} classInfo - Class information
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateDataClass(className, classInfo, results) {
    this.log(`Generating data class ${className}...`, 'info');
    
    const content = this.generateDataClassContent(className, classInfo);
    
    await this.writeFile(`${className}.js`, content);
    
    // Generate TypeScript definitions
    const tsContent = this.generateDataClassTypeScript(className, classInfo);
    await this.writeFile(`${className}.d.ts`, tsContent, { addHeader: false });
  }

  /**
   * Generate data class content
   * @param {string} className - Name of the data class
   * @param {Object} classInfo - Class information
   * @returns {string} Generated class content
   */
  generateDataClassContent(className, classInfo) {
    const baseClass = classInfo.extends || 'BaseData';
    const properties = this.generateProperties(classInfo);
    const validation = this.generateValidationMethods(classInfo);
    const utilities = this.generateUtilityMethods(classInfo);
    
    const template = `const BaseData = require('../base/base-data.js');

/**
 * ${className} - Data class for ${classInfo.specification?.name || className.replace('Data', '')}
 * Enforces OO plugin rules with single business method
 * Auto-generated by DataClassGenerator
 */
class ${className} extends BaseData {
  /**
   * Creates a new ${className} instance
   * @param {Object} data - Data object with all properties
   */
  constructor(data) {
    super(data);
    
    // Assign properties using dataclass pattern
${properties}
    
    // Store specification metadata
    this._specification = ${JSON.stringify(classInfo.specification || {})};
    this._config = ${JSON.stringify(classInfo.config || {})};
    this._nestingLevel = ${classInfo.nestingLevel || 0};
  }

  /**
   * Initializes the data class
   * @returns {Promise<${className}>} The initialized data instance
   */
  async initialize() {
    // Perform any async initialization
    return super.initialize();
  }

  /**
   * The ONE additional method - validates the data
   * @returns {boolean} True if data is valid
   * @throws {Error} If validation fails
   */
  async execute() {
    return this.validate();
  }

  /**
   * Validates the data according to specification
   * @returns {boolean} True if valid
   * @throws {Error} If validation fails
   */
  validate() {
    super.validate();
    
${validation}
    
    return true;
  }

${utilities}
}

module.exports = ${className};
`;
    
    return template;
  }

  /**
   * Generate property assignments
   * @param {Object} classInfo - Class information
   * @returns {string} Property assignment code
   */
  generateProperties(classInfo) {
    let properties = '';
    
    // Generate from specification if available
    if (classInfo.specification && classInfo.specification.config) {
      for (const [key, value] of Object.entries(classInfo.specification.config)) {
        properties += `    this.${key} = data.${key} || ${JSON.stringify(value)};\n`;
      }
    } else if (classInfo.properties && classInfo.properties.length > 0) {
      // Generate from existing properties
      for (const prop of classInfo.properties) {
        const defaultValue = prop.default !== null ? JSON.stringify(prop.default) : 'undefined';
        properties += `    this.${prop.name} = data.${prop.dataProperty || prop.name} || ${defaultValue};\n`;
      }
    } else {
      // Default property assignment
      properties += '    Object.assign(this, data);\n';
    }
    
    return properties;
  }

  /**
   * Generate validation methods
   * @param {Object} classInfo - Class information
   * @returns {string} Validation methods code
   */
  generateValidationMethods(classInfo) {
    let validation = '';
    
    // Generate from specification if available
    if (classInfo.specification && classInfo.specification.config) {
      for (const [key, value] of Object.entries(classInfo.specification.config)) {
        if (typeof value === 'string' && value.trim() !== '') {
          validation += `    if (!this.${key} || this.${key}.trim() === '') {
      throw new Error('${key} is required');
    }\n\n`;
        }
      }
    } else if (classInfo.validationMethods && classInfo.validationMethods.length > 0) {
      // Use existing validation methods
      for (const valMethod of classInfo.validationMethods) {
        validation += `    // ${valMethod.name}\n`;
        validation += this.indentCode(valMethod.body, '    ') + '\n\n';
      }
    }
    
    return validation.trim();
  }

  /**
   * Generate utility methods
   * @param {Object} classInfo - Class information
   * @returns {string} Utility methods code
   */
  generateUtilityMethods(classInfo) {
    return `  /**
   * Gets the specification metadata
   * @returns {Object} Specification information
   */
  getSpecification() {
    return this._specification;
  }

  /**
   * Gets the configuration
   * @returns {Object} Configuration data
   */
  getConfig() {
    return this._config;
  }

  /**
   * Gets the nesting level
   * @returns {number} Nesting level
   */
  getNestingLevel() {
    return this._nestingLevel;
  }

  /**
   * Gets data as plain object
   * @returns {Object} Plain object representation
   */
  toObject() {
    const obj = { ...this };
    
    // Remove internal properties
    delete obj._specification;
    delete obj._config;
    delete obj._nestingLevel;
    
    return obj;
  }

  /**
   * Creates a clone of the data class
   * @param {Object} overrides - Properties to override
   * @returns {${classInfo.name}> Cloned instance
   */
  clone(overrides = {}) {
    const data = this.toObject();
    Object.assign(data, overrides);
    
    return new ${classInfo.name}(data);
  }

  /**
   * Gets data class information
   * @returns {Object} Data class metadata
   */
  getDataClassInfo() {
    return {
      name: '${classInfo.name}',
      extends: '${classInfo.extends || 'BaseData'}',
      specification: this._specification,
      config: this._config,
      nestingLevel: this._nestingLevel,
      generatedBy: 'DataClassGenerator',
      generatedAt: new Date().toISOString()
    };
  }
`;
  }

  /**
   * Indent code by specified amount
   * @param {string} code - Code to indent
   * @param {string} indent - Indentation string
   * @returns {string} Indented code
   */
  indentCode(code, indent) {
    return code.split('\n').map(line => indent + line).join('\n');
  }

  /**
   * Generate TypeScript definitions for a data class
   * @param {string} className - Name of the data class
   * @param {Object} classInfo - Class information
   * @returns {string} TypeScript definitions
   */
  generateDataClassTypeScript(className, classInfo) {
    const properties = this.generateTypeScriptProperties(classInfo);
    
    return `/**
 * ${className} TypeScript definitions
 * Auto-generated by DataClassGenerator
 */

import { BaseData } from '../base/base-data';

interface ${className}Spec {
  [key: string]: any;
  nestingLevel?: number;
  config?: any;
}

interface ${className}Validation {
  validate(): boolean;
  [key: string]: any;
}

declare class ${className} extends BaseData {
  _specification: ${className}Spec;
  _config: any;
  _nestingLevel: number;

  constructor(data?: any);
  initialize(): Promise<${className}>;
  execute(): Promise<boolean>;
  validate(): boolean;
  getSpecification(): ${className}Spec;
  getConfig(): any;
  getNestingLevel(): number;
  toObject(): any;
  clone(overrides?: any): ${className};
  getDataClassInfo(): {
    name: string;
    extends: string;
    specification: ${className}Spec;
    config: any;
    nestingLevel: number;
    generatedBy: string;
    generatedAt: string;
  };
${properties}
}

export default ${className};
`;
  }

  /**
   * Generate TypeScript property definitions
   * @param {Object} classInfo - Class information
   * @returns {string} TypeScript property definitions
   */
  generateTypeScriptProperties(classInfo) {
    let properties = '';
    
    if (classInfo.specification && classInfo.specification.config) {
      for (const [key, value] of Object.entries(classInfo.specification.config)) {
        const type = this.inferTypeScriptType(value);
        properties += `  ${key}?: ${type};\n`;
      }
    } else if (classInfo.properties && classInfo.properties.length > 0) {
      for (const prop of classInfo.properties) {
        const type = this.inferTypeScriptTypeFromProperty(prop);
        const optional = prop.required ? '' : '?';
        properties += `  ${prop.name}${optional}: ${type};\n`;
      }
    }
    
    return properties;
  }

  /**
   * Infer TypeScript type from value
   * @param {any} value - Value to infer type from
   * @returns {string} Inferred TypeScript type
   */
  inferTypeScriptType(value) {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'any[]';
    if (typeof value === 'object' && value !== null) return 'any';
    return 'any';
  }

  /**
   * Infer TypeScript type from property
   * @param {Object} prop - Property object
   * @returns {string} Inferred TypeScript type
   */
  inferTypeScriptTypeFromProperty(prop) {
    switch (prop.type) {
      case 'string': return 'string';
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'array': return 'any[]';
      case 'object': return 'any';
      default: return 'any';
    }
  }

  /**
   * Generate data class index file
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateDataClassIndex(results) {
    const imports = [];
    const exports = [];
    
    for (const [className] of this.dataClasses) {
      imports.push(`const ${className} = require('./${className}.js');`);
      exports.push(`  ${className.replace('Data', '')}: ${className},`);
    }
    
    const indexContent = `${imports.join('\n')}

/**
 * Auto-generated data classes index
 * Generated by DataClassGenerator
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
    
    for (const [className] of this.dataClasses) {
      exports.push(`export { default as ${className.replace('Data', '')} } from './${className}.d.ts';`);
    }
    
    const indexContent = `/**
 * Auto-generated TypeScript definitions index
 * Generated by DataClassGenerator
 */

${exports.join('\n')}
`;
    
    await this.writeFile('index.d.ts', indexContent, { addHeader: false });
  }

  /**
   * Generate validation schemas
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateValidationSchemas(results) {
    const schemas = {};
    
    for (const [className, classInfo] of this.dataClasses) {
      if (classInfo.specification) {
        schemas[className.replace('Data', '')] = {
          type: 'object',
          properties: this.generateSchemaProperties(classInfo),
          required: this.generateRequiredProperties(classInfo),
          additionalProperties: false
        };
      }
    }
    
    const schemaContent = `/**
 * Validation schemas for all data classes
 * Auto-generated by DataClassGenerator
 */

module.exports = ${JSON.stringify(schemas, null, 2)};
`;
    
    await this.writeFile('validation-schemas.json', schemaContent, { addHeader: false });
  }

  /**
   * Generate JSON schema properties
   * @param {Object} classInfo - Class information
   * @returns {Object} Schema properties
   */
  generateSchemaProperties(classInfo) {
    const properties = {};
    
    if (classInfo.specification && classInfo.specification.config) {
      for (const [key, value] of Object.entries(classInfo.specification.config)) {
        properties[key] = {
          type: this.inferSchemaType(value),
          default: value
        };
      }
    }
    
    return properties;
  }

  /**
   * Generate required properties array
   * @param {Object} classInfo - Class information
   * @returns {Array} Required properties
   */
  generateRequiredProperties(classInfo) {
    const required = [];
    
    if (classInfo.specification && classInfo.specification.config) {
      for (const [key, value] of Object.entries(classInfo.specification.config)) {
        if (typeof value === 'string' && value.trim() !== '') {
          required.push(key);
        } else if (value !== null && value !== undefined) {
          required.push(key);
        }
      }
    }
    
    return required;
  }

  /**
   * Infer JSON schema type from value
   * @param {any} value - Value to infer type from
   * @returns {string} Inferred schema type
   */
  inferSchemaType(value) {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) return 'object';
    return 'string';
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

  /**
   * Get data class generation statistics
   * @returns {Object} Statistics
   */
  getGenerationStats() {
    const generatedCount = Array.from(this.dataClasses.values()).filter(c => c.generated).length;
    const existingCount = Array.from(this.dataClasses.values()).filter(c => !c.generated).length;
    
    return {
      totalDataClasses: this.dataClasses.size,
      generatedDataClasses: generatedCount,
      existingDataClasses: existingCount,
      coveragePercentage: Math.round((generatedCount / this.dataClasses.size) * 100),
      ...super.getStats()
    };
  }
}

module.exports = DataClassGenerator;
