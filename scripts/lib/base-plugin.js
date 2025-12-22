/**
 * Base Plugin Class
 * Abstract base class that all plugins must extend
 */

class BasePlugin {
  constructor(metadata = {}) {
    this.name = metadata.name || 'unknown';
    this.description = metadata.description || 'No description provided';
    this.version = metadata.version || '1.0.0';
    this.author = metadata.author || 'Unknown';
    this.category = metadata.category || 'utility';
    this.language = metadata.language || null;
    this.dependencies = metadata.dependencies || [];
    this.commands = metadata.commands || [];
    this.modules = metadata.modules || [];
    this.directory = metadata.directory || 'unknown';
    this.entry = metadata.entry || 'index.js';
    this.loaded = false;
    this.context = null;
    this.languageContext = null;
    this.loadedModules = new Map();
  }

  /**
   * Initializes plugin with execution context
   * @param {Object} context - Execution context containing paths, config, options
   */
  async initialize(context) {
    this.context = context;
    
    // Load modules if module loader is available
    if (context.moduleLoader && this.modules.length > 0) {
      await this.loadModules(context.moduleLoader);
    }
    
    this.loaded = true;
  }

  /**
   * Loads all plugin modules
   * @param {ModuleLoader} moduleLoader - Module loader instance
   */
  async loadModules(moduleLoader) {
    if (!this.modules || this.modules.length === 0) {
      return;
    }

    for (const modulePath of this.modules) {
      try {
        const module = moduleLoader.loadModule(modulePath);
        const moduleName = require('path').basename(modulePath, '.js');
        this.loadedModules.set(moduleName, module);
        this.log(`Loaded module: ${moduleName}`, 'info');
      } catch (error) {
        this.log(`Failed to load module ${modulePath}: ${error.message}`, 'error');
        throw error;
      }
    }
  }

  /**
   * Gets a loaded module by name
   * @param {string} moduleName - Module name
   * @returns {Object|null} - Module instance or null
   */
  getModule(moduleName) {
    return this.loadedModules.get(moduleName) || null;
  }

  /**
   * Checks if a module is loaded
   * @param {string} moduleName - Module name
   * @returns {boolean} - True if module is loaded
   */
  hasModule(moduleName) {
    return this.loadedModules.has(moduleName);
  }

  /**
   * Gets all loaded modules
   * @returns {Map} - Map of loaded modules
   */
  getAllModules() {
    return new Map(this.loadedModules);
  }

  /**
   * Executes a module method
   * @param {string} moduleName - Module name
   * @param {string} methodName - Method name
   * @param {...*} args - Method arguments
   * @returns {*} - Method result
   */
  async executeModule(moduleName, methodName, ...args) {
    const module = this.getModule(moduleName);
    if (!module) {
      throw new Error(`Module '${moduleName}' not found`);
    }

    if (typeof module[methodName] !== 'function') {
      throw new Error(`Method '${methodName}' not found in module '${moduleName}'`);
    }

    return await module[methodName](...args);
  }

  /**
   * Creates a module context for passing to modules
   * @returns {Object} - Module context
   */
  createModuleContext() {
    return {
      plugin: this,
      name: this.name,
      version: this.version,
      directory: this.directory,
      context: this.context,
      log: (message, level = 'info') => this.log(message, level),
      colorize: (text, color) => this.colorize(text, color),
      getModule: (name) => this.getModule(name),
      hasModule: (name) => this.hasModule(name)
    };
  }

  /**
   * Main execution method that plugins must implement
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Plugin execution results
   */
  async execute(context) {
    throw new Error(`Plugin ${this.name} must implement execute() method`);
  }

  /**
   * Cleanup method called after plugin execution
   */
  async cleanup() {
    // Override in subclasses if cleanup is needed
  }

  /**
   * Validates that the plugin's dependencies are available
   * @param {PluginRegistry} registry - Plugin registry to check against
   * @returns {boolean} - True if all dependencies are satisfied
   */
  validateDependencies(registry) {
    for (const dep of this.dependencies) {
      if (!registry.hasPlugin(dep)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets plugin metadata
   * @returns {Object} - Plugin metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
      category: this.category,
      dependencies: this.dependencies,
      commands: this.commands,
      file: this.file,
      loaded: this.loaded
    };
  }

  /**
   * Logs a message with plugin context
   * @param {string} message - Message to log
   * @param {string} level - Log level (info, warn, error)
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.name}]`;
    
    switch (level) {
      case 'error':
        console.error(`${prefix} ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`);
        break;
      case 'info':
      default:
        console.log(`${prefix} ${message}`);
        break;
    }
  }

  /**
   * Utility method to colorize output (if context provides colors)
   * @param {string} text - Text to colorize
   * @param {string} color - Color name
   * @returns {string} - Colorized text
   */
  colorize(text, color) {
    if (!this.context || !this.context.colors) {
      return text;
    }
    
    const colors = this.context.colors;
    return `${color}${text}${colors.reset}`;
  }

  /**
   * Sets the language context for the plugin
   * @param {Object} languageContext - Language context configuration
   */
  setLanguageContext(languageContext) {
    this.languageContext = languageContext;
  }

  /**
   * Gets the current language context
   * @returns {Object|null} - Current language context or null
   */
  getLanguageContext() {
    return this.languageContext || (this.context ? this.context.languageContext : null);
  }

  /**
   * Creates a language-aware analyzer for the current context
   * @returns {Object|null} - Language-aware analyzer or null
   */
  createAnalyzer() {
    const context = this.getLanguageContext();
    if (!context) {
      this.log('No language context available', 'warn');
      return null;
    }

    // Create analyzer with common methods that plugins can use
    return {
      context: context,
      
      /**
       * Validate class name according to language rules
       */
      validateClassName(name) {
        return context.validation.classNameRegex.test(name);
      },

      /**
       * Validate method name according to language rules
       */
      validateMethodName(name) {
        return context.validation.methodNameRegex.test(name);
      },

      /**
       * Validate file name according to language rules
       */
      validateFileName(name) {
        return context.validation.fileNameRegex.test(name.replace(/\.[^/.]+$/, ''));
      },

      /**
       * Check if file should be ignored
       */
      shouldIgnoreFile(filePath) {
        return context.analysis.ignorePatterns.some(pattern => 
          filePath.includes(pattern)
        );
      },

      /**
       * Get expected file extensions for this language
       */
      getFileExtensions() {
        return context.fileExtensions;
      },

      /**
       * Get source directories for this language
       */
      getSourceDirectories() {
        return context.projectStructure.source;
      },

      /**
       * Get test directories for this language
       */
      getTestDirectories() {
        return context.projectStructure.test;
      },

      /**
       * Extract patterns from content using language-specific regex
       */
      extractPatterns(content) {
        const patterns = context.patterns;
        const result = {};

        // Extract classes
        if (patterns.classDeclaration) {
          const classes = [];
          let match;
          const regex = new RegExp(patterns.classDeclaration);
          while ((match = regex.exec(content)) !== null) {
            classes.push(match[1]);
          }
          result.classes = classes;
        }

        // Extract methods
        if (patterns.methodDeclaration) {
          const methods = [];
          let match;
          const regex = new RegExp(patterns.methodDeclaration);
          while ((match = regex.exec(content)) !== null) {
            methods.push(match[1]);
          }
          result.methods = methods;
        }

        // Extract imports
        if (patterns.importStatement) {
          const imports = [];
          let match;
          const regex = new RegExp(patterns.importStatement);
          while ((match = regex.exec(content)) !== null) {
            imports.push({
              name: match[1],
              path: this.extractImportPath(content, match.index)
            });
          }
          result.imports = imports;
        }

        // Extract exports
        if (patterns.exportStatement) {
          const exports = [];
          let match;
          const regex = new RegExp(patterns.exportStatement);
          while ((match = regex.exec(content)) !== null) {
            exports.push({
              name: match[1] || match[2],
              line: content.substring(0, match.index).split('\n').length
            });
          }
          result.exports = exports;
        }

        return result;
      },

      /**
       * Extract import path from content
       */
      extractImportPath(content, index) {
        const requireMatch = content.substring(index).match(/require\s*\(['"]([^'"]+)['"]\)/);
        return requireMatch ? requireMatch[1] : null;
      }
    };
  }

  /**
   * Creates language-aware test data generator
   * @returns {Object|null} - Test data generator or null
   */
  createTestDataGenerator() {
    const context = this.getLanguageContext();
    if (!context) {
      this.log('No language context available for test data generation', 'warn');
      return null;
    }

    return {
      context,
      
      /**
       * Generate valid class name for this language
       */
      generateValidClassName() {
        const names = {
          'PascalCase': ['TestClass', 'UserService', 'DataProcessor', 'ApiClient'],
          'camelCase': ['testClass', 'userService', 'dataProcessor', 'apiClient'],
          'snake_case': ['test_class', 'user_service', 'data_processor', 'api_client']
        };
        const namingStyle = context.naming.classCase;
        const nameList = names[namingStyle] || names['PascalCase'];
        return nameList[Math.floor(Math.random() * nameList.length)];
      },

      /**
       * Generate valid method name for this language
       */
      generateValidMethodName() {
        const names = {
          'camelCase': ['processData', 'getUser', 'calculateResult', 'validateInput'],
          'snake_case': ['process_data', 'get_user', 'calculate_result', 'validate_input']
        };
        const namingStyle = context.naming.methodCase;
        const nameList = names[namingStyle] || names['camelCase'];
        return nameList[Math.floor(Math.random() * nameList.length)];
      },

      /**
       * Generate invalid class name
       */
      generateInvalidClassName() {
        const invalidNames = ['invalid@Name', '123Name', 'name-with-dash', ''];
        return invalidNames[Math.floor(Math.random() * invalidNames.length)];
      },

      /**
       * Generate mock file path for this language
       */
      generateMockFilePath(type = 'source') {
        const directories = type === 'test' ? context.projectStructure.test : context.projectStructure.source;
        const dir = directories[Math.floor(Math.random() * directories.length)];
        const className = this.generateValidClassName();
        const fileName = context.naming.fileCase === 'PascalCase' 
          ? `${className}.js` 
          : `${className.toLowerCase().replace(/([A-Z])/g, '_$1').substring(1)}.js`;
        return `${dir}/${fileName}`;
      }
    };
  }

  /**
   * Applies language-specific rules to analysis results
   * @param {Object} results - Analysis results
   * @returns {Object} - Results with language-specific enhancements
   */
  applyLanguageRules(results) {
    const context = this.getLanguageContext();
    if (!context) {
      return results;
    }

    // Apply validation rules
    if (results.classes) {
      results.classValidation = results.classes.map(className => ({
        name: className,
        valid: this.validateClassName(className),
        issues: this.validateClassName(className) ? [] : ['Invalid class name for language']
      }));
    }

    if (results.methods) {
      results.methodValidation = results.methods.map(methodName => ({
        name: methodName,
        valid: this.validateMethodName(methodName),
        issues: this.validateMethodName(methodName) ? [] : ['Invalid method name for language']
      }));
    }

    // Apply language-specific insights
    results.languageInsights = {
      naming: context.naming,
      displayName: context.displayName,
      validation: context.validation
    };

    return results;
  }

  /**
   * Validates a class name using current language context
   * @param {string} name - Class name to validate
   * @returns {boolean} - True if valid for current language
   */
  validateClassName(name) {
    const analyzer = this.createAnalyzer();
    return analyzer ? analyzer.validateClassName(name) : true; // Fallback to true if no analyzer
  }

  /**
   * Validates a method name using current language context
   * @param {string} name - Method name to validate
   * @returns {boolean} - True if valid for current language
   */
  validateMethodName(name) {
    const analyzer = this.createAnalyzer();
    return analyzer ? analyzer.validateMethodName(name) : true; // Fallback to true if no analyzer
  }

  /**
   * Validates a file name using current language context
   * @param {string} name - File name to validate
   * @returns {boolean} - True if valid for current language
   */
  validateFileName(name) {
    const analyzer = this.createAnalyzer();
    return analyzer ? analyzer.validateFileName(name) : true; // Fallback to true if no analyzer
  }
}

module.exports = BasePlugin;
