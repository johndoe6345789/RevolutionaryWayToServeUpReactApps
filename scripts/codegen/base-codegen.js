#!/usr/bin/env node

/**
 * BaseCodegen - Foundation for all code generators in the system
 * Provides clean up/down functionality and common generation utilities
 */

const fs = require('fs');
const path = require('path');

class BaseCodegen {
  constructor(options = {}) {
    this.options = {
      outputDir: options.outputDir || './bootstrap/generated',
      cleanBeforeGenerate: options.cleanBeforeGenerate || true,
      backupExisting: options.backupExisting || true,
      dryRun: options.dryRun || false,
      verbose: options.verbose || false,
      ...options
    };
    
    this.generatedFiles = new Set();
    this.backupFiles = new Map();
    this.cleanupOperations = [];
  }

  /**
   * Initialize the codegen - required by OO plugin
   * @returns {Promise<BaseCodegen>} The initialized codegen
   */
  async initialize() {
    this.log('Initializing codegen...', 'info');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
      this.log(`Created output directory: ${this.options.outputDir}`, 'info');
    }
    
    // Clean up if requested
    if (this.options.cleanBeforeGenerate) {
      await this.cleanUp();
    }
    
    return this;
  }

  /**
   * Execute the codegen - required by OO plugin
   * @returns {Promise<Object>} Generation results
   */
  async execute() {
    this.log('Executing codegen generation...', 'info');
    
    const results = {
      generatedFiles: [],
      backedUpFiles: [],
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString()
    };
    
    try {
      // Generate files (to be implemented by subclasses)
      await this.generate(results);
      
      // Register cleanup operations
      await this.registerCleanupOperations();
      
      results.generatedFiles = Array.from(this.generatedFiles);
      results.backedUpFiles = Array.from(this.backupFiles.keys());
      
      this.log(`Generated ${results.generatedFiles.length} files`, 'success');
      
    } catch (error) {
      results.errors.push(error.message);
      this.log(`Codegen failed: ${error.message}`, 'error');
    }
    
    return results;
  }

  /**
   * Clean up generated files - called before new generation
   * @returns {Promise<void>}
   */
  async cleanUp() {
    this.log('Cleaning up previous generated files...', 'info');
    
    if (!fs.existsSync(this.options.outputDir)) {
      return;
    }
    
    const files = fs.readdirSync(this.options.outputDir);
    let cleanedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(this.options.outputDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        // Backup existing files if requested
        if (this.options.backupExisting) {
          await this.backupFile(filePath);
        }
        
        // Remove the file
        fs.unlinkSync(filePath);
        cleanedCount++;
      }
    }
    
    this.log(`Cleaned up ${cleanedCount} files`, 'info');
  }

  /**
   * Clean down - called after generation to perform final cleanup
   * @returns {Promise<void>}
   */
  async cleanDown() {
    this.log('Performing final cleanup operations...', 'info');
    
    for (const operation of this.cleanupOperations) {
      try {
        await this.executeCleanupOperation(operation);
        this.log(`Executed cleanup operation: ${operation.type}`, 'info');
      } catch (error) {
        this.log(`Cleanup operation failed: ${error.message}`, 'error');
      }
    }
    
    this.cleanupOperations = [];
  }

  /**
   * Generate files - to be implemented by subclasses
   * @param {Object} results - Generation results object
   * @returns {Promise<void>}
   */
  async generate(results) {
    throw new Error('generate() method must be implemented by subclass');
  }

  /**
   * Register cleanup operations - to be implemented by subclasses
   * @returns {Promise<void>}
   */
  async registerCleanupOperations() {
    // Default implementation - can be overridden
  }

  /**
   * Write a generated file
   * @param {string} relativePath - Relative path to output directory
   * @param {string} content - File content
   * @param {Object} options - Write options
   * @returns {Promise<void>}
   */
  async writeFile(relativePath, content, options = {}) {
    const fullPath = path.join(this.options.outputDir, relativePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Backup existing file if it exists
    if (fs.existsSync(fullPath) && this.options.backupExisting) {
      await this.backupFile(fullPath);
    }
    
    // Write the file (unless dry run)
    if (!this.options.dryRun) {
      fs.writeFileSync(fullPath, content, 'utf8');
      this.log(`Generated: ${relativePath}`, 'info');
    } else {
      this.log(`[DRY RUN] Would generate: ${relativePath}`, 'info');
    }
    
    this.generatedFiles.add(relativePath);
    
    // Add header if requested
    if (options.addHeader !== false) {
      await this.addGenerationHeader(fullPath);
    }
  }

  /**
   * Backup an existing file
   * @param {string} filePath - Path to file to backup
   * @returns {Promise<void>}
   */
  async backupFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    
    fs.copyFileSync(filePath, backupPath);
    this.backupFiles.set(filePath, backupPath);
    
    this.log(`Backed up: ${path.basename(filePath)} -> ${path.basename(backupPath)}`, 'info');
  }

  /**
   * Add generation header to a file
   * @param {string} filePath - Path to file
   * @returns {Promise<void>}
   */
  async addGenerationHeader(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const header = `/**
 * Auto-generated file - DO NOT EDIT MANUALLY
 * Generated by: ${this.constructor.name}
 * Generated at: ${new Date().toISOString()}
 * This file will be overwritten during next generation
 */

`;
    
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('Auto-generated file')) {
      fs.writeFileSync(filePath, header + content, 'utf8');
    }
  }

  /**
   * Register a cleanup operation
   * @param {Object} operation - Cleanup operation
   * @returns {void>}
   */
  registerCleanupOperation(operation) {
    this.cleanupOperations.push(operation);
  }

  /**
   * Execute a cleanup operation
   * @param {Object} operation - Cleanup operation
   * @returns {Promise<void>}
   */
  async executeCleanupOperation(operation) {
    switch (operation.type) {
      case 'deleteFile':
        if (fs.existsSync(operation.path)) {
          fs.unlinkSync(operation.path);
        }
        break;
        
      case 'moveFile':
        if (fs.existsSync(operation.source)) {
          fs.renameSync(operation.source, operation.destination);
        }
        break;
        
      case 'createSymlink':
        if (fs.existsSync(operation.target) && !fs.existsSync(operation.link)) {
          fs.symlinkSync(operation.target, operation.link);
        }
        break;
        
      case 'runCommand':
        const { execSync } = require('child_process');
        execSync(operation.command, { stdio: 'inherit' });
        break;
        
      default:
        throw new Error(`Unknown cleanup operation type: ${operation.type}`);
    }
  }

  /**
   * Load JSON configuration file
   * @param {string} configPath - Path to JSON config file
   * @returns {Object} Parsed configuration
   */
  loadConfig(configPath) {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }
    
    const content = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(content);
    
    // Process function placeholders in config
    return this.processConfigFunctions(config);
  }

  /**
   * Process function placeholders in configuration
   * @param {Object} config - Configuration object
   * @returns {Object} Processed configuration
   */
  processConfigFunctions(config) {
    const processed = JSON.parse(JSON.stringify(config));
    
    const processValue = (value) => {
      if (typeof value === 'string' && value.includes('${function:')) {
        const match = value.match(/\$\{function:(\w+)\}/);
        if (match && this.options.functions && this.options.functions[match[1]]) {
          const func = new Function('return ' + this.options.functions[match[1]])();
          return value.replace(match[0], func);
        }
      }
      return value;
    };
    
    const processObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(processObject);
      } else if (obj && typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          result[key] = processObject(value);
        }
        return result;
      } else {
        return processValue(obj);
      }
    };
    
    return processObject(processed);
  }

  /**
   * Generate a template with data
   * @param {string} template - Template string
   * @param {Object} data - Data to interpolate
   * @returns {string} Rendered template
   */
  renderTemplate(template, data) {
    let rendered = template;
    
    for (const [key, value] of Object.entries(data)) {
      const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
      rendered = rendered.replace(placeholder, value);
    }
    
    return rendered;
  }

  /**
   * Log a message
   * @param {string} message - Message to log
   * @param {string} level - Log level (info, success, warning, error)
   * @returns {void}
   */
  log(message, level = 'info') {
    if (!this.options.verbose && level === 'info') {
      return;
    }
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[${timestamp}] [${this.constructor.name}]`;
    
    switch (level) {
      case 'success':
        console.log(`\x1b[32m${prefix} ✓ ${message}\x1b[0m`);
        break;
      case 'warning':
        console.log(`\x1b[33m${prefix} ⚠ ${message}\x1b[0m`);
        break;
      case 'error':
        console.log(`\x1b[31m${prefix} ✗ ${message}\x1b[0m`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Get codegen statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      generatedFiles: this.generatedFiles.size,
      backedUpFiles: this.backupFiles.size,
      cleanupOperations: this.cleanupOperations.length,
      outputDirectory: this.options.outputDir
    };
  }
}

module.exports = BaseCodegen;
