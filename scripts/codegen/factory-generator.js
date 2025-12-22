#!/usr/bin/env node

/**
 * FactoryGenerator - Generates factory classes for every class in the system
 * Ensures complete factory coverage with dataclass patterns
 */

const BaseCodegen = require('./base-codegen');
const path = require('path');
const fs = require('fs');

class FactoryGenerator extends BaseCodegen {
  constructor(options = {}) {
    super({
      ...options,
      outputDir: options.outputDir || './bootstrap/generated/factories'
    });
    
    this.constantsPath = options.constantsPath || './bootstrap/aggregate/class-constants.json';
    this.bootstrapPath = options.bootstrapPath || './bootstrap';
    this.aggregateData = null;
    this.classes = new Map();
    this.scanResults = null;
  }

  /**
   * Initialize the factory generator and scan for classes
   * @returns {Promise<FactoryGenerator>} The initialized generator
   */
  async initialize() {
    await super.initialize();
    
    // Load aggregate constants
    this.aggregateData = this.loadConfig(this.constantsPath);
    
    // Scan for all classes in the system
    await this.scanForClasses();
    
    return this;
  }

  /**
   * Scan the bootstrap system for all classes
   * @returns {Promise<void>}
   */
  async scanForClasses() {
    this.log('Scanning bootstrap system for classes...', 'info');
    
    const classes = new Map();
    const scanDirectory = (dir, relativePath = '') => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const itemRelativePath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          scanDirectory(fullPath, itemRelativePath);
        } else if (item.endsWith('.js') && !item.endsWith('.test.js') && !item.includes('test')) {
          this.extractClassesFromFile(fullPath, itemRelativePath, classes);
        }
      }
    };
    
    scanDirectory(this.bootstrapPath);
    
    // Merge with aggregate data
    this.mergeWithAggregateData(classes);
    
    this.scanResults = {
      totalClasses: classes.size,
      classes: Array.from(classes.entries()).map(([name, info]) => ({ name, ...info }))
    };
    
    this.log(`Found ${this.scanResults.totalClasses} classes`, 'info');
  }

  /**
   * Extract classes from a file
   * @param {string} filePath - Path to the file
   * @param {string} relativePath - Relative path from bootstrap
   * @param {Map} classes - Classes map to populate
   * @returns {void}
   */
  extractClassesFromFile(filePath, relativePath, classes) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract class definitions
      const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?\s*\{/g;
      let match;
      
      while ((match = classRegex.exec(content)) !== null) {
        const className = match[1];
        const extendsClass = match[2] || null;
        const implementsInterface = match[3] || null;
        
        // Skip abstract classes and test classes
        if (className.includes('Test') || className.includes('Mock') || className.includes('Stub')) {
          continue;
        }
        
        // Skip if this is already a factory
        if (className.endsWith('Factory') || className.endsWith('Generator')) {
          continue;
        }
        
        // Determine data class name
        const dataClassName = this.inferDataClassName(className, relativePath);
        
        // Determine factory name
        const factoryName = `${className}Factory`;
        
        classes.set(className, {
          name: className,
          factoryName: factoryName,
          dataClassName: dataClassName,
          extends: extendsClass,
          implements: implementsInterface,
          filePath: relativePath,
          module: relativePath.replace(/\.js$/, ''),
          hasFactory: classes.has(factoryName)
        });
      }
    } catch (error) {
      this.log(`Error scanning file ${filePath}: ${error.message}`, 'warning');
    }
  }

  /**
   * Infer data class name from class name and file path
   * @param {string} className - Class name
   * @param {string} filePath - File path
   * @returns {string} Inferred data class name
   */
  inferDataClassName(className, filePath) {
    // Check if it's in a specific directory
    if (filePath.includes('/data/')) {
      return `${className}Data`;
    }
    
    // Check if it's in factories
    if (filePath.includes('/factories/')) {
      return 'factory-data';
    }
    
    // Check if it's in aggregate
    if (filePath.includes('/aggregate/')) {
      return 'aggregate-data';
    }
    
    // Check if it's in services
    if (filePath.includes('/services/')) {
      return 'service-data';
    }
    
    // Default data class
    return 'base-data';
  }

  /**
   * Merge scanned classes with aggregate data
   * @param {Map} classes - Scanned classes
   * @returns {void}
   */
  mergeWithAggregateData(classes) {
    if (!this.aggregateData.classes) return;
    
    // Update classes with aggregate configuration
    for (const aggregateClass of this.aggregateData.classes) {
      const existingClass = classes.get(aggregateClass.name);
      if (existingClass) {
        // Merge with existing information
        existingClass.factory = aggregateClass.factory;
        existingClass.dataClass = aggregateClass.dataClass;
        existingClass.config = aggregateClass.config;
        existingClass.nestingLevel = aggregateClass.nestingLevel;
        existingClass.children = aggregateClass.children || [];
      } else {
        // Add new class from aggregate data
        classes.set(aggregateClass.name, {
          name: aggregateClass.name,
          factoryName: aggregateClass.factory || `${aggregateClass.name}Factory`,
          dataClassName: aggregateClass.dataClass || `${aggregateClass.name}Data`,
          extends: aggregateClass.extends || 'BaseClass',
          implements: aggregateClass.implements,
          filePath: aggregateClass.module,
          module: aggregateClass.module,
          config: aggregateClass.config,
          nestingLevel: aggregateClass.nestingLevel || 0,
          children: aggregateClass.children || [],
          hasFactory: false
        });
      }
    }
    
    // Update global classes map
    this.classes = classes;
  }

  /**
   * Generate factories for all classes
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generate(results) {
    this.log('Generating factory classes...', 'info');
    
    // Generate factories for each class
    for (const [className, classInfo] of this.classes) {
      if (!classInfo.hasFactory) {
        await this.generateFactory(className, classInfo, results);
      }
    }
    
    // Generate factory index
    await this.generateFactoryIndex(results);
    
    // Generate TypeScript definitions
    await this.generateTypeDefinitions(results);
    
    // Generate factory registry
    await this.generateFactoryRegistry(results);
  }

  /**
   * Generate a factory for a specific class
   * @param {string} className - Name of the class
   * @param {Object} classInfo - Class information
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateFactory(className, classInfo, results) {
    this.log(`Generating factory for ${className}...`, 'info');
    
    const factoryName = classInfo.factoryName;
    const content = this.generateFactoryClass(className, classInfo);
    
    await this.writeFile(`${factoryName}.js`, content);
    
    // Generate TypeScript definitions
    const tsContent = this.generateFactoryTypeScript(className, classInfo);
    await this.writeFile(`${factoryName}.d.ts`, tsContent, { addHeader: false });
  }

  /**
   * Generate factory class content
   * @param {string} className - Name of the class
   * @param {Object} classInfo - Class information
   * @returns {string} Generated factory class
   */
  generateFactoryClass(className, classInfo) {
    const factoryName = classInfo.factoryName;
    const dataClass = classInfo.dataClassName;
    const modulePath = classInfo.module;
    const config = classInfo.config || {};
    
    const template = `const BaseClassFactory = require('../base/base-class-factory.js');
const ${dataClass} = require('../data/${dataClass}.js');

/**
 * ${factoryName} - Factory for creating ${className} instances
 * Enforces OO plugin rules with single business method
 * Auto-generated by FactoryGenerator
 */
class ${factoryName} extends BaseClassFactory {
  /**
   * Creates a new ${factoryName} instance
   * @param {Object} data - Factory configuration data
   */
  constructor(data) {
    super({
      targetClass: '${className}',
      dataClass: '${dataClass}',
      module: '${modulePath}',
      defaultConfig: ${JSON.stringify(config)},
      ...data
    });
  }

  /**
   * Initializes the factory
   * @returns {Promise<${factoryName}>} The initialized factory
   */
  async initialize() {
    // Validate class module exists
    try {
      require.resolve(this.modulePath);
    } catch (error) {
      throw new Error(\`Module not found: \${this.modulePath}\`);
    }
    
    return super.initialize();
  }

  /**
   * The ONE additional method - creates ${className} instances
   * @param {Object} config - Configuration for the instance
   * @returns {Promise<Object>} The created ${className} instance
   */
  async create(config = {}) {
    try {
      // Create data instance with generated ID
      const dataConfig = {
        ...this.defaultConfig,
        ...config,
        id: this.generateId(),
        createdAt: new Date(),
        factoryGenerated: true,
        factoryName: '${factoryName}',
        targetClass: '${className}'
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
      throw new Error(\`Failed to create ${className}: \${error.message}\`);
    }
  }

  /**
   * Gets the target class constructor
   * @returns {Function} The target class constructor
   */
  getTargetClass() {
    try {
      const modulePath = this.modulePath.startsWith('./') 
        ? '../' + this.modulePath.substring(2)
        : '../' + this.modulePath;
      
      const TargetClass = require(modulePath);
      return TargetClass.default || TargetClass;
    } catch (error) {
      throw new Error(\`Failed to load target class: \${this.modulePath}\`);
    }
  }

  /**
   * Gets the data class constructor
   * @returns {Function} The data class constructor
   */
  getDataClass() {
    // Map data class names to actual constructors
    const dataClassMap = {
      'base-data': require('../data/base-data.js'),
      'factory-data': require('../data/factory-data.js'),
      'service-data': require('../data/service-data.js'),
      'utilities-data': require('../data/utilities-data.js'),
      'aggregate-data': require('../data/aggregate-data.js'),
      'plugin-group-data': require('../data/plugin-group-data.js')
    };
    
    const DataClass = dataClassMap[this.dataClass] || ${dataClass};
    if (!DataClass) {
      throw new Error(\`Unknown data class: \${this.dataClass}\`);
    }
    
    return DataClass;
  }

  /**
   * Generates a unique ID for data objects
   * @returns {string} Generated ID
   */
  generateId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return \`${className.toLowerCase()}_\${timestamp}_\${random}\`;
  }

  /**
   * Validates factory configuration
   * @returns {boolean} True if valid
   * @throws {Error} If invalid
   */
  validate() {
    if (!this.targetClass) {
      throw new Error('Target class is required');
    }
    
    if (!this.dataClass) {
      throw new Error('Data class is required');
    }
    
    if (!this.modulePath) {
      throw new Error('Module path is required');
    }
    
    return true;
  }

  /**
   * Gets factory information
   * @returns {Object} Factory metadata
   */
  getFactoryInfo() {
    return {
      targetClass: this.targetClass,
      dataClass: this.dataClass,
      modulePath: this.modulePath,
      defaultConfig: this.defaultConfig,
      factoryType: this.constructor.name,
      generatedBy: 'FactoryGenerator',
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = ${factoryName};
`;
    
    return template;
  }

  /**
   * Generate TypeScript definitions for a factory
   * @param {string} className - Name of the class
   * @param {Object} classInfo - Class information
   * @returns {string} TypeScript definitions
   */
  generateFactoryTypeScript(className, classInfo) {
    const factoryName = classInfo.factoryName;
    const dataClass = classInfo.dataClassName;
    
    return `/**
 * ${factoryName} TypeScript definitions
 * Auto-generated by FactoryGenerator
 */

import { BaseClassFactory } from '../base/base-class-factory';

declare class ${factoryName} extends BaseClassFactory {
  targetClass: string;
  dataClass: string;
  modulePath: string;
  defaultConfig: any;

  constructor(data?: any);
  initialize(): Promise<${factoryName}>;
  create(config?: any): Promise<any>;
  getTargetClass(): Function;
  getDataClass(): Function;
  generateId(): string;
  validate(): boolean;
  getFactoryInfo(): {
    targetClass: string;
    dataClass: string;
    modulePath: string;
    defaultConfig: any;
    factoryType: string;
    generatedBy: string;
    generatedAt: string;
  };
}

export default ${factoryName};
`;
  }

  /**
   * Generate factory index file
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateFactoryIndex(results) {
    const imports = [];
    const exports = [];
    
    for (const [className, classInfo] of this.classes) {
      if (!classInfo.hasFactory) {
        const factoryName = classInfo.factoryName;
        imports.push(`const ${factoryName} = require('./${factoryName}.js');`);
        exports.push(`  ${className}: ${factoryName},`);
      }
    }
    
    const indexContent = `${imports.join('\n')}

/**
 * Auto-generated factory index
 * Generated by FactoryGenerator
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
    
    for (const [className, classInfo] of this.classes) {
      if (!classInfo.hasFactory) {
        const factoryName = classInfo.factoryName;
        exports.push(`export { default as ${className} } from './${factoryName}.d.ts';`);
      }
    }
    
    const indexContent = `/**
 * Auto-generated TypeScript definitions index
 * Generated by FactoryGenerator
 */

${exports.join('\n')}
`;
    
    await this.writeFile('index.d.ts', indexContent, { addHeader: false });
  }

  /**
   * Generate factory registry
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateFactoryRegistry(results) {
    const registryData = {
      generated: new Date().toISOString(),
      totalFactories: 0,
      factories: {},
      coverage: {
        totalClasses: this.scanResults.totalClasses,
        classesWithFactories: 0,
        generatedFactories: 0,
        coveragePercentage: 0
      }
    };
    
    let generatedCount = 0;
    for (const [className, classInfo] of this.classes) {
      registryData.factories[className] = {
        name: className,
        factory: classInfo.factoryName,
        dataClass: classInfo.dataClassName,
        module: classInfo.module,
        config: classInfo.config,
        hasExistingFactory: classInfo.hasFactory,
        generated: !classInfo.hasFactory
      };
      
      if (!classInfo.hasFactory) {
        generatedCount++;
      }
    }
    
    registryData.totalFactories = generatedCount;
    registryData.coverage.classesWithFactories = Array.from(this.classes.values()).filter(c => c.hasFactory).length;
    registryData.coverage.generatedFactories = generatedCount;
    registryData.coverage.coveragePercentage = Math.round((generatedCount / this.classes.size) * 100);
    
    const registryContent = `/**
 * Factory Registry - Complete factory coverage information
 * Auto-generated by FactoryGenerator
 */

module.exports = ${JSON.stringify(registryData, null, 2)};
`;
    
    await this.writeFile('factory-registry.json', registryContent, { addHeader: false });
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
    
    // Register cleanup for any backup files older than 7 days
    this.registerCleanupOperation({
      type: 'runCommand',
      command: `find ${this.options.outputDir} -name "*.backup.*" -mtime +7 -delete 2>/dev/null || true`
    });
  }

  /**
   * Get factory generation statistics
   * @returns {Object} Statistics
   */
  getGenerationStats() {
    if (!this.scanResults) {
      return null;
    }
    
    const generatedCount = Array.from(this.classes.values()).filter(c => !c.hasFactory).length;
    const existingCount = Array.from(this.classes.values()).filter(c => c.hasFactory).length;
    
    return {
      totalClasses: this.scanResults.totalClasses,
      generatedFactories: generatedCount,
      existingFactories: existingCount,
      coveragePercentage: Math.round((generatedCount / this.classes.size) * 100),
      ...super.getStats()
    };
  }
}

module.exports = FactoryGenerator;
