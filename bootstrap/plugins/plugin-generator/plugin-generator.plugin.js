#!/usr/bin/env node

/**
 * PluginGenerator Plugin - Generates plugin skeletons with OO compliance
 * Enforces OO plugin rules with single business method
 */

const BasePlugin = require('../../scripts/lib/base-plugin');
const fs = require('fs');
const path = require('path');

class PluginGeneratorPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'plugin-generator',
      description: 'Generates OO-compliant plugin skeletons with templates',
      version: '1.0.0',
      author: 'RWTRA',
      category: 'generation',
      commands: [
        {
          name: 'generate-plugin',
          description: 'Generate a new plugin skeleton'
        }
      ],
      dependencies: []
    });

    this.templatesPath = path.join(__dirname, 'templates');
    this.outputPath = null;
    this.pluginConfig = null;
    this.generatedFiles = [];
  }

  /**
   * Initializes the plugin generator
   * @param {Object} context - Execution context
   */
  async initialize(context) {
    await super.initialize(context);
    
    this.outputPath = context.options.output || path.join(process.cwd(), 'generated-plugins');
    this.pluginConfig = {
      name: context.options.name,
      category: context.options.category || 'utility',
      description: context.options.description || 'Generated plugin',
      author: context.options.author || 'RWTRA',
      language: context.options.language || 'javascript',
      template: context.options.template || 'basic-plugin'
    };
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
  }

  /**
   * The ONE additional method - generates plugin skeleton
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Generation results
   */
  async execute(context) {
    await this.initialize(context);
    
    this.log('Starting plugin generation...', 'info');
    this.log(this.colorize('🔧 Plugin Generator - OO Compliant Skeleton Generation', context.colors.cyan));
    this.log(this.colorize('='.repeat(60), context.colors.white));
    
    try {
      // Validate plugin configuration
      this.validatePluginConfig();
      
      // Generate plugin structure
      const pluginPath = await this.generatePluginStructure();
      
      // Generate plugin files
      await this.generatePluginFiles(pluginPath);
      
      // Generate plugin metadata
      await this.generatePluginMetadata(pluginPath);
      
      // Generate factory and data classes
      await this.generatePluginSupportClasses(pluginPath);
      
      // Create results summary
      const results = this.createResultsSummary(pluginPath);
      
      // Display results
      this.displayResults(results, context);
      
      return results;
    } catch (error) {
      this.log(`Plugin generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Validates plugin configuration
   */
  validatePluginConfig() {
    if (!this.pluginConfig.name) {
      throw new Error('Plugin name is required');
    }
    
    if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(this.pluginConfig.name)) {
      throw new Error('Plugin name must contain only letters, numbers, and hyphens');
    }
    
    const validCategories = ['analysis', 'bundling', 'generation', 'utility', 'testing', 'development'];
    if (!validCategories.includes(this.pluginConfig.category)) {
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }
    
    this.log(`Plugin configuration validated: ${this.pluginConfig.name}`, 'info');
  }

  /**
   * Generates plugin directory structure
   * @returns {string} Plugin path
   */
  async generatePluginStructure() {
    const pluginPath = path.join(this.outputPath, this.pluginConfig.name);
    
    // Create main plugin directory
    fs.mkdirSync(pluginPath, { recursive: true });
    
    // Create subdirectories
    const subdirs = ['data', 'factories', 'templates', 'metadata'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(pluginPath, subdir);
      fs.mkdirSync(subdirPath, { recursive: true });
      this.generatedFiles.push(subdirPath);
    }
    
    this.log(`Created plugin structure at: ${pluginPath}`, 'info');
    return pluginPath;
  }

  /**
   * Generates plugin main file and templates
   * @param {string} pluginPath - Path to plugin directory
   */
  async generatePluginFiles(pluginPath) {
    // Generate main plugin file
    const pluginTemplate = this.getPluginTemplate(this.pluginConfig.template);
    const pluginContent = this.processTemplate(pluginTemplate, this.pluginConfig);
    
    const pluginFile = path.join(pluginPath, `${this.pluginConfig.name}.plugin.js`);
    fs.writeFileSync(pluginFile, pluginContent, 'utf8');
    this.generatedFiles.push(pluginFile);
    
    // Generate plugin factory
    const factoryContent = this.processTemplate(this.getFactoryTemplate(), this.pluginConfig);
    const factoryFile = path.join(pluginPath, 'factories', `${this.pluginConfig.name}-factory.js`);
    fs.writeFileSync(factoryFile, factoryContent, 'utf8');
    this.generatedFiles.push(factoryFile);
    
    // Generate plugin data class
    const dataContent = this.processTemplate(this.getDataTemplate(), this.pluginConfig);
    const dataFile = path.join(pluginPath, 'data', `${this.pluginConfig.name}-data.js`);
    fs.writeFileSync(dataFile, dataContent, 'utf8');
    this.generatedFiles.push(dataFile);
    
    this.log('Generated plugin files', 'info');
  }

  /**
   * Generates plugin metadata file
   * @param {string} pluginPath - Path to plugin directory
   */
  async generatePluginMetadata(pluginPath) {
    const metadata = {
      name: this.pluginConfig.name,
      description: this.pluginConfig.description,
      version: '1.0.0',
      author: this.pluginConfig.author,
      category: this.pluginConfig.category,
      language: this.pluginConfig.language,
      generated: new Date().toISOString(),
      ooCompliant: true,
      dependencies: [],
      commands: [
        {
          name: `${this.pluginConfig.name}-run`,
          description: `Run ${this.pluginConfig.name} plugin`
        }
      ],
      structure: {
        mainFile: `${this.pluginConfig.name}.plugin.js`,
        factory: `factories/${this.pluginConfig.name}-factory.js`,
        dataClass: `data/${this.pluginConfig.name}-data.js`,
        templates: 'templates/',
        metadata: 'metadata/'
      }
    };
    
    const metadataFile = path.join(pluginPath, 'metadata', 'plugin-metadata.json');
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2), 'utf8');
    this.generatedFiles.push(metadataFile);
    
    this.log('Generated plugin metadata', 'info');
  }

  /**
   * Generates plugin support classes (factory and data)
   * @param {string} pluginPath - Path to plugin directory
   */
  async generatePluginSupportClasses(pluginPath) {
    // Support classes are already generated in generatePluginFiles
    // This method exists for future extensibility
    this.log('Generated plugin support classes', 'info');
  }

  /**
   * Gets plugin template based on template name
   * @param {string} templateName - Template name
   * @returns {string} Template content
   */
  getPluginTemplate(templateName) {
    const templates = {
      'basic-plugin': `#!/usr/bin/env node

/**
 * {{PascalCaseName}} Plugin - {{description}}
 * Enforces OO plugin rules with single business method
 */

const BasePlugin = require('../scripts/lib/base-plugin');

class {{PascalCaseName}} extends BasePlugin {
  constructor(data) {
    super({
      name: '{{name}}',
      description: '{{description}}',
      version: '1.0.0',
      author: '{{author}}',
      category: '{{category}}',
      commands: [
        {
          name: '{{name}}-run',
          description: 'Run {{name}} plugin'
        }
      ],
      dependencies: []
    });
  }

  /**
   * Initializes the plugin
   * @param {Object} context - Execution context
   */
  async initialize(context) {
    await super.initialize(context);
    this.log('{{PascalCaseName}} plugin initialized', 'info');
  }

  /**
   * The ONE additional method - executes plugin logic
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Plugin execution results
   */
  async execute(context) {
    this.log('{{PascalCaseName}} plugin executing', 'info');
    
    // TODO: Implement your plugin logic here
    
    return {
      success: true,
      message: '{{PascalCaseName}} plugin executed successfully',
      data: {}
    };
  }
}

module.exports = {{PascalCaseName}};`,
      
      'analysis-plugin': `#!/usr/bin/env node

/**
 * {{PascalCaseName}} Analysis Plugin - {{description}}
 * Enforces OO plugin rules with single business method
 */

const BasePlugin = require('../scripts/lib/base-plugin');

class {{PascalCaseName}} extends BasePlugin {
  constructor(data) {
    super({
      name: '{{name}}',
      description: '{{description}}',
      version: '1.0.0',
      author: '{{author}}',
      category: 'analysis',
      commands: [
        {
          name: '{{name}}-analyze',
          description: 'Run {{name}} analysis'
        }
      ],
      dependencies: []
    });

    this.analysisResults = {
      summary: {
        totalFiles: 0,
        issues: 0,
        recommendations: 0
      },
      details: [],
      recommendations: []
    };
  }

  /**
   * Initializes the analysis plugin
   * @param {Object} context - Execution context
   */
  async initialize(context) {
    await super.initialize(context);
    this.log('{{PascalCaseName}} analysis plugin initialized', 'info');
  }

  /**
   * The ONE additional method - performs analysis
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Analysis results
   */
  async execute(context) {
    this.log('Starting {{PascalCaseName}} analysis...', 'info');
    
    // TODO: Implement your analysis logic here
    // Example: scan files, analyze patterns, generate reports
    
    this.analysisResults.summary.totalFiles = 0;
    this.analysisResults.summary.issues = 0;
    this.analysisResults.summary.recommendations = 0;
    
    return {
      success: true,
      results: this.analysisResults
    };
  }
}

module.exports = {{PascalCaseName}};`
    };
    
    return templates[templateName] || templates['basic-plugin'];
  }

  /**
   * Gets factory template
   * @returns {string} Factory template
   */
  getFactoryTemplate() {
    return `const BaseClassFactory = require('../bootstrap/factories/base-class-factory.js');
const {{PascalCaseName}}Data = require('../data/{{name}}-data.js');

/**
 * {{PascalCaseName}}Factory - Factory for creating {{name}} instances
 * Enforces OO plugin rules with single business method
 */
class {{PascalCaseName}}Factory extends BaseClassFactory {
  /**
   * Creates a new {{PascalCaseName}}Factory instance
   * @param {Object} data - Factory configuration data
   */
  constructor(data) {
    super(data);
    this.pluginType = data.pluginType || '{{category}}';
  }

  /**
   * Initializes the factory
   * @returns {Promise<{{PascalCaseName}}Factory>} The initialized factory
   */
  async initialize() {
    if (!this.pluginType) {
      throw new Error('Plugin type is required');
    }
    
    return super.initialize();
  }

  /**
   * The ONE additional method - creates plugin instances
   * @param {Object} config - Configuration for the plugin instance
   * @returns {Promise<BaseClass>} The created plugin instance
   */
  async create(config = {}) {
    try {
      const dataConfig = {
        ...this.defaultConfig,
        ...config,
        id: this.generateId(),
        createdAt: new Date(),
        pluginType: this.pluginType
      };
      
      const data = new {{PascalCaseName}}Data(dataConfig);
      await data.initialize();
      data.validate();
      
      const PluginClass = require('../{{name}}.plugin.js');
      const instance = new PluginClass(data);
      await instance.initialize();
      
      return instance;
    } catch (error) {
      throw new Error(\`Failed to create {{name}}: \${error.message}\`);
    }
  }
}

module.exports = {{PascalCaseName}}Factory;`;
  }

  /**
   * Gets data template
   * @returns {string} Data template
   */
  getDataTemplate() {
    return `const BaseData = require('../bootstrap/data/base-data.js');

/**
 * {{PascalCaseName}}Data - Data class for {{name}} configurations
 * Enforces OO plugin rules with single business method
 */
class {{PascalCaseName}}Data extends BaseData {
  /**
   * Creates a new {{PascalCaseName}}Data instance
   * @param {Object} data - Plugin configuration data
   */
  constructor(data) {
    super(data);
    this.name = data.name;
    this.pluginType = data.pluginType;
    this.config = data.config || {};
    this.options = data.options || {};
  }

  /**
   * Initializes the plugin data
   * @returns {Promise<{{PascalCaseName}}Data>} The initialized data instance
   */
  async initialize() {
    return super.initialize();
  }

  /**
   * The ONE additional method - plugin-specific validation
   * @returns {boolean} True if plugin data is valid
   * @throws {Error} If plugin data is invalid
   */
  validate() {
    super.validate();
    
    if (!this.name) {
      throw new Error('Plugin name is required');
    }
    
    if (!this.pluginType) {
      throw new Error('Plugin type is required');
    }
    
    if (typeof this.config !== 'object') {
      throw new Error('Config must be an object');
    }
    
    if (typeof this.options !== 'object') {
      throw new Error('Options must be an object');
    }
    
    return true;
  }

  /**
   * Gets plugin configuration
   * @returns {Object} Plugin configuration
   */
  getConfig() {
    return {
      name: this.name,
      type: this.pluginType,
      config: this.config,
      options: this.options
    };
  }

  /**
   * Updates plugin configuration
   * @param {Object} newConfig - New configuration to merge
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

module.exports = {{PascalCaseName}}Data;`;
  }

  /**
   * Processes template with variables
   * @param {string} template - Template content
   * @param {Object} variables - Template variables
   * @returns {string} Processed template
   */
  processTemplate(template, variables) {
    let processed = template;
    
    // Replace common variables
    const replacements = {
      '{{name}}': variables.name,
      '{{description}}': variables.description,
      '{{author}}': variables.author,
      '{{category}}': variables.category,
      '{{language}}': variables.language,
      '{{PascalCaseName}}': this.toPascalCase(variables.name),
      '{{camelCaseName}}': this.toCamelCase(variables.name),
      '{{snake_case_name}}': this.toSnakeCase(variables.name)
    };
    
    for (const [placeholder, value] of Object.entries(replacements)) {
      processed = processed.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }
    
    return processed;
  }

  /**
   * Converts string to PascalCase
   * @param {string} str - Input string
   * @returns {string} PascalCase string
   */
  toPascalCase(str) {
    return str.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase());
  }

  /**
   * Converts string to camelCase
   * @param {string} str - Input string
   * @returns {string} camelCase string
   */
  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Converts string to snake_case
   * @param {string} str - Input string
   * @returns {string} snake_case string
   */
  toSnakeCase(str) {
    return str.replace(/-/g, '_');
  }

  /**
   * Creates results summary
   * @param {string} pluginPath - Path to generated plugin
   * @returns {Object} Results summary
   */
  createResultsSummary(pluginPath) {
    return {
      success: true,
      plugin: {
        name: this.pluginConfig.name,
        category: this.pluginConfig.category,
        description: this.pluginConfig.description,
        path: pluginPath,
        template: this.pluginConfig.template
      },
      files: this.generatedFiles,
      ooCompliant: true,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Displays generation results
   * @param {Object} results - Generation results
   * @param {Object} context - Execution context
   */
  displayResults(results, context) {
    console.log(context.colors.reset + '\n🔧 PLUGIN GENERATION COMPLETE');
    console.log('=====================================');
    
    console.log(`\n📦 Plugin: ${context.colors.cyan}${results.plugin.name}${context.colors.reset}`);
    console.log(`📂 Path: ${context.colors.yellow}${results.plugin.path}${context.colors.reset}`);
    console.log(`🏷️  Category: ${context.colors.green}${results.plugin.category}${context.colors.reset}`);
    console.log(`📋 Template: ${context.colors.magenta}${results.plugin.template}${context.colors.reset}`);
    
    console.log('\n📄 Generated Files:');
    for (const file of results.files) {
      const relativePath = path.relative(results.plugin.path, file) || path.basename(file);
      console.log(`   ${context.colors.cyan}• ${relativePath}${context.colors.reset}`);
    }
    
    console.log(`\n✅ OO Compliant: ${context.colors.green}YES${context.colors.reset}`);
    console.log(`🕐 Generated: ${context.colors.gray}${new Date(results.generatedAt).toLocaleString()}${context.colors.reset}`);
    
    console.log('\n🚀 Next Steps:');
    console.log(context.colors.cyan + '   1. Navigate to plugin directory' + context.colors.reset);
    console.log(context.colors.cyan + '   2. Implement your plugin logic in the execute() method' + context.colors.reset);
    console.log(context.colors.cyan + '   3. Test your plugin with the development tools' + context.colors.reset);
    console.log(context.colors.cyan + '   4. Register plugin in the system if needed' + context.colors.reset);
  }
}

module.exports = PluginGeneratorPlugin;
