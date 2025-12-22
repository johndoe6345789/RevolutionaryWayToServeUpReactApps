/**
 * Module Loader
 * Handles loading and validation of atomic modules (max 100 LOC)
 */

const fs = require('fs');
const path = require('path');

class ModuleLoader {
  constructor() {
    this.cache = new Map();
    this.maxLines = 100;
  }

  /**
   * Loads a module from file path
   * @param {string} modulePath - Path to module file
   * @returns {Object} - Loaded module
   */
  loadModule(modulePath) {
    // Check cache first
    if (this.cache.has(modulePath)) {
      return this.cache.get(modulePath);
    }

    if (!fs.existsSync(modulePath)) {
      throw new Error(`Module file not found: ${modulePath}`);
    }

    // Validate module size before loading
    this.validateModuleSize(modulePath);
    
    try {
      // Clear require cache to ensure fresh load
      delete require.cache[require.resolve(modulePath)];
      
      const moduleExports = require(modulePath);
      
      // Validate module structure
      this.validateModuleStructure(moduleExports, modulePath);
      
      // Cache the loaded module
      this.cache.set(modulePath, moduleExports);
      
      return moduleExports;
    } catch (error) {
      throw new Error(`Failed to load module ${modulePath}: ${error.message}`);
    }
  }

  /**
   * Validates that module doesn't exceed 100 lines of code
   * @param {string} modulePath - Path to module file
   */
  validateModuleSize(modulePath) {
    const content = fs.readFileSync(modulePath, 'utf8');
    const lines = content.split('\n');
    
    // Filter out empty lines and comments for more accurate counting
    const codeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && 
             !trimmed.startsWith('//') && 
             !trimmed.startsWith('/*') && 
             !trimmed.startsWith('*') &&
             !trimmed.startsWith('*/');
    });

    if (codeLines.length > this.maxLines) {
      throw new Error(
        `Module ${modulePath} exceeds ${this.maxLines} lines (${codeLines.length} lines)`
      );
    }
  }

  /**
   * Validates module export structure
   * @param {*} moduleExports - Module exports
   * @param {string} modulePath - Module path for error reporting
   */
  validateModuleStructure(moduleExports, modulePath) {
    if (moduleExports === undefined || moduleExports === null) {
      throw new Error(`Module ${modulePath} must export something`);
    }

    // If it's a class, ensure it has a constructor
    if (typeof moduleExports === 'function') {
      // It's a class or constructor function
      return;
    }

    // If it's an object, ensure it has valid properties
    if (typeof moduleExports === 'object') {
      const keys = Object.keys(moduleExports);
      if (keys.length === 0) {
        throw new Error(`Module ${modulePath} must export at least one function or class`);
      }
      
      // Ensure all exports are functions or classes
      for (const key of keys) {
        const value = moduleExports[key];
        if (typeof value !== 'function' && typeof value !== 'object') {
          throw new Error(
            `Module ${modulePath} export '${key}' must be a function or object`
          );
        }
      }
    } else if (typeof moduleExports !== 'function') {
      throw new Error(
        `Module ${modulePath} must export a function, class, or object`
      );
    }
  }

  /**
   * Loads multiple modules from an array of paths
   * @param {string[]} modulePaths - Array of module file paths
   * @returns {Object} - Map of loaded modules indexed by filename
   */
  loadModules(modulePaths) {
    const modules = {};
    
    for (const modulePath of modulePaths) {
      try {
        const moduleName = path.basename(modulePath, '.js');
        modules[moduleName] = this.loadModule(modulePath);
      } catch (error) {
        console.warn(`Warning: Failed to load module ${modulePath}: ${error.message}`);
      }
    }
    
    return modules;
  }

  /**
   * Creates a module context for dependency injection
   * @param {Object} context - Base context
   * @param {Object} modules - Loaded modules
   * @returns {Object} - Enhanced context with modules
   */
  createModuleContext(context, modules) {
    return {
      ...context,
      modules,
      requireModule: (name) => {
        if (!modules[name]) {
          throw new Error(`Module '${name}' not found in context`);
        }
        return modules[name];
      },
      hasModule: (name) => !!modules[name]
    };
  }

  /**
   * Validates all modules in a directory
   * @param {string} dirPath - Directory path
   * @returns {Object} - Validation results
   */
  validateDirectoryModules(dirPath) {
    const results = {
      valid: [],
      invalid: [],
      total: 0
    };

    if (!fs.existsSync(dirPath)) {
      return results;
    }

    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(dirPath, file);
        results.total++;
        
        try {
          this.validateModuleSize(filePath);
          results.valid.push(file);
        } catch (error) {
          results.invalid.push({
            file,
            error: error.message
          });
        }
      }
    }
    
    return results;
  }

  /**
   * Gets module statistics
   * @param {string} modulePath - Module file path
   * @returns {Object} - Module statistics
   */
  getModuleStats(modulePath) {
    if (!fs.existsSync(modulePath)) {
      return null;
    }

    const content = fs.readFileSync(modulePath, 'utf8');
    const lines = content.split('\n');
    const stats = fs.statSync(modulePath);

    const codeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && 
             !trimmed.startsWith('//') && 
             !trimmed.startsWith('/*') && 
             !trimmed.startsWith('*') &&
             !trimmed.startsWith('*/');
    });

    return {
      totalLines: lines.length,
      codeLines: codeLines.length,
      emptyLines: lines.filter(line => !line.trim()).length,
      commentLines: lines.length - codeLines.length - lines.filter(line => !line.trim()).length,
      fileSize: stats.size,
      withinLimit: codeLines.length <= this.maxLines
    };
  }

  /**
   * Clears the module cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Sets maximum lines allowed (for testing or configuration)
   * @param {number} maxLines - Maximum lines allowed
   */
  setMaxLines(maxLines) {
    this.maxLines = maxLines;
  }
}

module.exports = ModuleLoader;
