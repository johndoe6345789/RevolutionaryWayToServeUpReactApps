/**
 * Plugin Validator
 * Validates plugin folder structure and ensures compliance with architectural standards
 */

const fs = require('fs');
const path = require('path');

class PluginValidator {
  constructor() {
    this.requiredFiles = ['plugin.json', 'index.js'];
    this.requiredDirs = ['modules'];
    this.optionalDirs = ['utils', 'tests', 'docs'];
    this.maxFileSize = 50 * 1024; // 50KB max per file
  }

  /**
   * Validates complete plugin folder structure
   * @param {string} pluginDir - Plugin directory path
   * @returns {Object} - Validation results
   */
  validatePluginStructure(pluginDir) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      structure: {
        requiredFiles: [],
        missingFiles: [],
        extraFiles: [],
        directories: {
          required: [],
          missing: [],
          optional: []
        },
        modules: {
          valid: [],
          invalid: [],
          oversized: []
        }
      }
    };

    if (!fs.existsSync(pluginDir)) {
      results.valid = false;
      results.errors.push(`Plugin directory does not exist: ${pluginDir}`);
      return results;
    }

    // Validate required files
    this.validateRequiredFiles(pluginDir, results);
    
    // Validate directory structure
    this.validateDirectories(pluginDir, results);
    
    // Validate modules directory
    this.validateModulesDirectory(pluginDir, results);
    
    // Validate file sizes
    this.validateFileSizes(pluginDir, results);
    
    // Check for architectural compliance
    this.validateArchitecture(pluginDir, results);
    
    return results;
  }

  /**
   * Validates required files exist
   * @param {string} pluginDir - Plugin directory
   * @param {Object} results - Validation results
   */
  validateRequiredFiles(pluginDir, results) {
    const files = fs.readdirSync(pluginDir);
    
    for (const requiredFile of this.requiredFiles) {
      const filePath = path.join(pluginDir, requiredFile);
      if (fs.existsSync(filePath)) {
        results.structure.requiredFiles.push(requiredFile);
      } else {
        results.valid = false;
        results.structure.missingFiles.push(requiredFile);
        results.errors.push(`Missing required file: ${requiredFile}`);
      }
    }

    // Check for unexpected files at root
    const expectedFiles = [...this.requiredFiles, ...this.requiredDirs, ...this.optionalDirs];
    for (const file of files) {
      const filePath = path.join(pluginDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile() && !expectedFiles.includes(file)) {
        results.structure.extraFiles.push(file);
        results.warnings.push(`Unexpected file at root: ${file}`);
      }
    }
  }

  /**
   * Validates directory structure
   * @param {string} pluginDir - Plugin directory
   * @param {Object} results - Validation results
   */
  validateDirectories(pluginDir, results) {
    const items = fs.readdirSync(pluginDir);
    
    for (const requiredDir of this.requiredDirs) {
      const dirPath = path.join(pluginDir, requiredDir);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        results.structure.directories.required.push(requiredDir);
      } else {
        results.valid = false;
        results.structure.directories.missing.push(requiredDir);
        results.errors.push(`Missing required directory: ${requiredDir}`);
      }
    }

    for (const optionalDir of this.optionalDirs) {
      const dirPath = path.join(pluginDir, optionalDir);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        results.structure.directories.optional.push(optionalDir);
      }
    }
  }

  /**
   * Validates modules directory structure
   * @param {string} pluginDir - Plugin directory
   * @param {Object} results - Validation results
   */
  validateModulesDirectory(pluginDir, results) {
    const modulesDir = path.join(pluginDir, 'modules');
    
    if (!fs.existsSync(modulesDir)) {
      return;
    }

    const moduleFiles = fs.readdirSync(modulesDir);
    
    for (const file of moduleFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(modulesDir, file);
        const stats = fs.statSync(filePath);
        
        // Check file size
        if (stats.size > this.maxFileSize) {
          results.structure.modules.oversized.push({
            file,
            size: stats.size,
            maxSize: this.maxFileSize
          });
          results.errors.push(`Module file too large: ${file} (${stats.size} bytes)`);
        }
        
        // Validate module content
        const moduleValidation = this.validateModuleFile(filePath);
        if (moduleValidation.valid) {
          results.structure.modules.valid.push(file);
        } else {
          results.structure.modules.invalid.push({
            file,
            errors: moduleValidation.errors
          });
          results.errors.push(`Invalid module: ${file} - ${moduleValidation.errors.join(', ')}`);
        }
      } else {
        results.warnings.push(`Non-JavaScript file in modules directory: ${file}`);
      }
    }

    // Ensure at least one module exists
    if (results.structure.modules.valid.length === 0) {
      results.valid = false;
      results.errors.push('No valid modules found in modules directory');
    }
  }

  /**
   * Validates individual module file
   * @param {string} modulePath - Path to module file
   * @returns {Object} - Module validation result
   */
  validateModuleFile(modulePath) {
    const result = {
      valid: true,
      errors: []
    };

    try {
      const content = fs.readFileSync(modulePath, 'utf8');
      const lines = content.split('\n');
      
      // Count code lines (excluding comments and empty lines)
      const codeLines = lines.filter(line => {
        const trimmed = line.trim();
        return trimmed && 
               !trimmed.startsWith('//') && 
               !trimmed.startsWith('/*') && 
               !trimmed.startsWith('*') &&
               !trimmed.startsWith('*/');
      });

      if (codeLines.length > 100) {
        result.valid = false;
        result.errors.push(`Exceeds 100 lines (${codeLines.length} code lines)`);
      }

      // Check for module.exports
      if (!content.includes('module.exports') && !content.includes('exports.')) {
        result.warnings = result.warnings || [];
        result.warnings.push('No module.exports or exports.* found');
      }

      // Check for basic structure
      if (content.length < 50) {
        result.warnings = result.warnings || [];
        result.warnings.push('Module appears to be very small');
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`Failed to read module: ${error.message}`);
    }

    return result;
  }

  /**
   * Validates file sizes across plugin
   * @param {string} pluginDir - Plugin directory
   * @param {Object} results - Validation results
   */
  validateFileSizes(pluginDir, results) {
    const checkDirectory = (dir, relativePath = '') => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        const relativeItemPath = path.join(relativePath, item);
        
        if (stat.isFile()) {
          if (stat.size > this.maxFileSize) {
            results.warnings.push(
              `Large file: ${relativeItemPath} (${stat.size} bytes)`
            );
          }
        } else if (stat.isDirectory() && !item.startsWith('.')) {
          checkDirectory(itemPath, relativeItemPath);
        }
      }
    };
    
    checkDirectory(pluginDir);
  }

  /**
   * Validates architectural compliance
   * @param {string} pluginDir - Plugin directory
   * @param {Object} results - Validation results
   */
  validateArchitecture(pluginDir, results) {
    // Check for circular dependencies (basic check)
    this.checkCircularDependencies(pluginDir, results);
    
    // Check for proper naming conventions
    this.checkNamingConventions(pluginDir, results);
    
    // Check for documentation
    this.checkDocumentation(pluginDir, results);
  }

  /**
   * Basic circular dependency check
   * @param {string} pluginDir - Plugin directory
   * @param {Object} results - Validation results
   */
  checkCircularDependencies(pluginDir, results) {
    const modulesDir = path.join(pluginDir, 'modules');
    
    if (!fs.existsSync(modulesDir)) return;
    
    const modules = fs.readdirSync(modulesDir).filter(f => f.endsWith('.js'));
    const dependencies = new Map();
    
    for (const module of modules) {
      const modulePath = path.join(modulesDir, module);
      const content = fs.readFileSync(modulePath, 'utf8');
      const requires = content.match(/require\s*\(['"]([^'"]+)['"]\s*\)/g) || [];
      
      dependencies.set(module, requires.map(req => {
        const match = req.match(/require\s*\(['"]([^'"]+)['"]\s*\)/);
        return match ? match[1] : null;
      }).filter(Boolean));
    }
    
    // Simple circular dependency detection
    for (const [module, deps] of dependencies) {
      for (const dep of deps) {
        const depModule = dep.endsWith('.js') ? path.basename(dep) : `${dep}.js`;
        const depDeps = dependencies.get(depModule) || [];
        
        if (depDeps.some(d => d.endsWith(module) || d === module.replace('.js', ''))) {
          results.warnings.push(`Potential circular dependency: ${module} ↔ ${depModule}`);
        }
      }
    }
  }

  /**
   * Checks naming conventions
   * @param {string} pluginDir - Plugin directory
   * @param {Object} results - Validation results
   */
  checkNamingConventions(pluginDir, results) {
    const items = fs.readdirSync(pluginDir);
    
    for (const item of items) {
      // Check for kebab-case in files and directories
      if (!/^[a-z0-9-]+$/.test(item) && !item.startsWith('.')) {
        results.warnings.push(`Naming convention: Use kebab-case for ${item}`);
      }
    }
  }

  /**
   * Checks for documentation
   * @param {string} pluginDir - Plugin directory
   * @param {Object} results - Validation results
   */
  checkDocumentation(pluginDir, results) {
    const readmePath = path.join(pluginDir, 'README.md');
    if (!fs.existsSync(readmePath)) {
      results.warnings.push('Consider adding README.md for documentation');
    }
    
    const docsDir = path.join(pluginDir, 'docs');
    if (!fs.existsSync(docsDir)) {
      results.warnings.push('Consider adding docs/ directory for detailed documentation');
    }
  }

  /**
   * Generates validation report
   * @param {Object} results - Validation results
   * @returns {string} - Formatted report
   */
  generateReport(results) {
    let report = '\n🔍 PLUGIN VALIDATION REPORT\n';
    report += '============================\n\n';
    
    report += `Overall Status: ${results.valid ? '✅ VALID' : '❌ INVALID'}\n\n`;
    
    if (results.errors.length > 0) {
      report += '🚨 ERRORS:\n';
      for (const error of results.errors) {
        report += `  - ${error}\n`;
      }
      report += '\n';
    }
    
    if (results.warnings.length > 0) {
      report += '⚠️  WARNINGS:\n';
      for (const warning of results.warnings) {
        report += `  - ${warning}\n`;
      }
      report += '\n';
    }
    
    report += '📁 STRUCTURE SUMMARY:\n';
    report += `  Required Files: ${results.structure.requiredFiles.length}/${this.requiredFiles.length}\n`;
    report += `  Valid Modules: ${results.structure.modules.valid.length}\n`;
    report += `  Invalid Modules: ${results.structure.modules.invalid.length}\n`;
    
    return report;
  }
}

module.exports = PluginValidator;
