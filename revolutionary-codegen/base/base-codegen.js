#!/usr/bin/env node

/**
 * BaseCodegen - Enhanced foundation for all code generators in the revolutionary system
 * Provides clean up/down functionality, template processing, and innovation features
 * 
 * 🚀 Revolutionary Features:
 * - Clean up/down lifecycle management
 * - Template processing with function evaluation
 * - Fun graphics and progress animations
 * - Easter eggs and developer jokes
 * - Comprehensive error handling and recovery
 * - Language-agnostic design
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const TemplateEngine = require('./template-engine');

class BaseCodegen {
  constructor(options = {}) {
    this.options = {
      outputDir: options.outputDir || './generated-project',
      cleanBeforeGenerate: options.cleanBeforeGenerate !== false,
      backupExisting: options.backupExisting !== false,
      dryRun: options.dryRun || false,
      verbose: options.verbose || false,
      enableInnovations: options.enableInnovations !== false,
      strictMode: options.strictMode || false,
      language: options.language || 'javascript',
      ...options
    };
    
    // Revolutionary codegen state
    this.generatedFiles = new Set();
    this.backupFiles = new Map();
    this.cleanupOperations = [];
    this.templateCache = new Map();
    this.functionRegistry = new Map();
    this.stats = {
      startTime: null,
      endTime: null,
      filesGenerated: 0,
      filesBackedUp: 0,
      errors: 0,
      warnings: 0,
      innovationsTriggered: 0
    };
    
    // Initialize function registry
    this.initializeFunctionRegistry();
    
    // Initialize template engine for language-agnostic processing
    this.templateEngine = new TemplateEngine(this.options.language, {
      templateDir: options.templateDir || path.join(__dirname, '../templates'),
      enableCaching: this.options.enableCaching !== false
    });
    
    // Initialize innovation features
    if (this.options.enableInnovations) {
      this.initializeInnovations();
    }
  }

  /**
   * Initialize codegen - required by OO plugin
   * @returns {Promise<BaseCodegen>} The initialized codegen
   */
  async initialize() {
    this.stats.startTime = new Date();
    this.displayWelcome();
    this.strings = require('../bootstrap/services/string-service').getStringService();
    
    this.log(this.strings.getMessage('rev_codegen_initializing'), 'info');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
      this.log(this.strings.getMessage('created_output_dir', { path: this.options.outputDir }), 'success');
    }
    
    // Clean up if requested
    if (this.options.cleanBeforeGenerate) {
      await this.cleanUp();
    }
    
    // Display progress animation
    this.displayProgressAnimation(this.strings.getMessage('initializing_generators'), 1000);
    
    return this;
  }

  /**
   * Execute the codegen - required by OO plugin
   * @returns {Promise<Object>} Generation results
   */
  async execute() {
    this.log(this.strings.getMessage('executing_codegen'), 'info');
    
    const results = {
      generatedFiles: [],
      backedUpFiles: [],
      errors: [],
      warnings: [],
      innovations: [],
      timestamp: new Date().toISOString(),
      stats: { ...this.stats }
    };
    
    try {
      // Generate files (to be implemented by subclasses)
      await this.generate(results);
      
      // Register and execute cleanup operations
      await this.registerCleanupOperations();
      await this.cleanDown();
      
      // Process results
      results.generatedFiles = Array.from(this.generatedFiles);
      results.backedUpFiles = Array.from(this.backupFiles.keys());
      results.stats.filesGenerated = this.stats.filesGenerated;
      results.stats.filesBackedUp = this.stats.filesBackedUp;
      results.stats.errors = this.stats.errors;
      results.stats.warnings = this.stats.warnings;
      results.stats.innovationsTriggered = this.stats.innovationsTriggered;
      
      this.stats.endTime = new Date();
      const duration = this.stats.endTime - this.stats.startTime;
      results.stats.duration = duration;
      
      this.log(this.strings.getMessage('files_generated', { count: results.generatedFiles.length, duration: Math.round(duration) }), 'success');
      
      // Display completion celebration
      this.displayCompletion(results);
      
    } catch (error) {
      this.stats.errors++;
      results.errors.push(error.message);
      this.log(this.strings.getMessage('codegen_failed', { error: error.message }), 'error');
      this.displayError(error);
      
      if (this.options.strictMode) {
        throw error;
      }
    }
    
    return results;
  }

  /**
   * Clean up generated files - called before new generation
   * @returns {Promise<void>}
   */
  async cleanUp() {
    this.log(this.strings.getMessage('cleaning_up'), 'info');
    
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
        
        // Remove file
        fs.unlinkSync(filePath);
        cleanedCount++;
      } else if (stat.isDirectory() && !file.startsWith('.')) {
        // Recursively clean directories (except hidden ones)
        await this.cleanDirectory(filePath);
        cleanedCount++;
      }
    }
    
    this.log(this.strings.getMessage('cleaned_items', { count: cleanedCount }), 'info');
  }

  /**
   * Clean down - called after generation to perform final cleanup
   * @returns {Promise<void>}
   */
  async cleanDown() {
    this.log(this.strings.getMessage('final_cleanup'), 'info');
    
    for (const operation of this.cleanupOperations) {
      try {
        await this.executeCleanupOperation(operation);
        this.log(this.strings.getMessage('cleanup_operation', { type: operation.type }), 'info');
      } catch (error) {
        this.log(this.strings.getMessage('cleanup_failed', { error: error.message }), 'warning');
        this.stats.warnings++;
      }
    }
    
    this.cleanupOperations = [];
    
    // Clear template cache
    this.templateCache.clear();
    
    this.log(this.strings.getMessage('final_cleanup_complete'), 'success');
  }

  /**
   * Generate files - to be implemented by subclasses
   * @param {Object} results - Generation results object
   * @returns {Promise<void>}
   */
  async generate(results) {
    throw new Error(this.strings.getMessage('method_not_implemented', { method: 'generate' }));
  }

  /**
   * Register cleanup operations - to be implemented by subclasses
   * @returns {Promise<void>}
   */
  async registerCleanupOperations() {
    // Default implementation - can be overridden
  }

  /**
   * Write a generated file with enhanced features
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
      this.log(this.strings.getMessage('created_directory', { path: path.relative(this.options.outputDir, dir) }), 'info');
    }
    
    // Process content with template variables
    const processedContent = this.processTemplate(content, options.data || {});
    
    // Backup existing file if it exists
    if (fs.existsSync(fullPath) && this.options.backupExisting) {
      await this.backupFile(fullPath);
    }
    
    // Write file (unless dry run)
    if (!this.options.dryRun) {
      fs.writeFileSync(fullPath, processedContent, 'utf8');
      this.log(this.strings.getMessage('generated_file', { path: relativePath }), 'success');
      this.stats.filesGenerated++;
    } else {
      this.log(this.strings.getMessage('dry_run_file', { path: relativePath }), 'info');
    }
    
    this.generatedFiles.add(relativePath);
    
    // Add header if requested
    if (options.addHeader !== false) {
      await this.addGenerationHeader(fullPath);
    }
    
    // Trigger innovation features
    if (this.options.enableInnovations) {
      this.triggerInnovation('fileGenerated', { path: relativePath, size: processedContent.length });
    }
  }

  /**
   * Backup an existing file with timestamp
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
    this.stats.filesBackedUp++;
    
    this.log(this.strings.getMessage('backed_up_file', { filename: path.basename(filePath), backupName: path.basename(backupPath) }), 'info');
  }

  /**
   * Add generation header to a file with fun elements
   * @param {string} filePath - Path to file
   * @returns {Promise<void>}
   */
  async addGenerationHeader(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const jokes = [
      this.strings.getMessage('dark_mode'),
      this.strings.getMessage('broke_developer'),
      this.strings.getMessage('java_glasses'),
      this.strings.getMessage('sad_function'),
      this.strings.getMessage('love_nature')
    ];
    
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    const easterEgg = this.generateEasterEgg();
    
    const header = `/**
 * 🚀 Auto-generated file - DO NOT EDIT MANUALLY
 * Generated by: ${this.constructor.name}
 * Generated at: ${new Date().toISOString()}
 * This file will be overwritten during next generation
 * 
 * 💡 Fun fact: ${randomJoke}
 * ${easterEgg}
 */

`;
    
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('Auto-generated file')) {
      fs.writeFileSync(filePath, header + content, 'utf8');
    }
  }

  /**
   * Process template with function evaluation and language-specific syntax
   * @param {string} template - Template string
   * @param {Object} data - Data to interpolate
   * @returns {string} Processed template
   */
  processTemplate(template, data = {}) {
    let processed = template;
    
    // Use template engine for language-agnostic processing
    if (this.templateEngine && this.templateEngine.isLanguageSupported()) {
      processed = this.templateEngine.renderTemplate(template, data);
    } else {
      // Fallback to original processing if template engine not available
      processed = this.processTemplateFallback(template, data);
    }
    
    return processed;
  }

  /**
   * Fallback template processing when template engine is not available
   * @param {string} template - Template string
   * @param {Object} data - Data to interpolate
   * @returns {string} Processed template
   */
  processTemplateFallback(template, data = {}) {
    let processed = template;
    
    // Process function placeholders like ${function:name}
    processed = processed.replace(/\$\{function:(\w+)\}/g, (match, funcName) => {
      if (this.functionRegistry.has(funcName)) {
        return this.functionRegistry.get(funcName)();
      }
      return match;
    });
    
    // Process variable placeholders like ${variable}
    processed = processed.replace(/\$\{(\w+)\}/g, (match, varName) => {
      if (data[varName] !== undefined) {
        return data[varName];
      }
      return match;
    });
    
    // Process conditional blocks like ${if:condition}...${endif}
    processed = processed.replace(/\$\{if:(\w+)\}([^$]*)\$\{endif\}/g, (match, condition, content) => {
      if (data[condition]) {
        return content;
      }
      return '';
    });
    
    return processed;
  }

  /**
   * Get template engine instance
   * @returns {TemplateEngine} Template engine
   */
  getTemplateEngine() {
    return this.templateEngine;
  }

  /**
   * Set language for template engine
   * @param {string} language - Target language
   * @returns {void}
   */
  setLanguage(language) {
    this.options.language = language;
    if (this.templateEngine) {
      this.templateEngine.setLanguage(language);
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
   * Execute a cleanup operation with error handling
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
        
      case 'cleanCache':
        // Clean cache directory
        const cacheDir = path.join(this.options.outputDir, '.cache');
        if (fs.existsSync(cacheDir)) {
          this.cleanDirectory(cacheDir);
        }
        break;
        
      default:
        throw new Error(this.strings.getMessage('operation_not_found', { type: operation.type }));
    }
  }

  /**
   * Clean a directory recursively
   * @param {string} dirPath - Directory path
   * @returns {void}
   */
  cleanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return;
    }
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        this.cleanDirectory(itemPath);
        fs.rmdirSync(itemPath);
      } else {
        fs.unlinkSync(itemPath);
      }
    }
  }

  /**
   * Initialize function registry for template processing
   * @returns {void}
   */
  initializeFunctionRegistry() {
    // Time functions
    this.functionRegistry.set('getTimestamp', () => new Date().toISOString());
    this.functionRegistry.set('getTime', () => Date.now());
    this.functionRegistry.set('getYear', () => new Date().getFullYear());
    
    // ID functions
    this.functionRegistry.set('generateId', () => 
      Date.now().toString(36) + Math.random().toString(36).substr(2)
    );
    this.functionRegistry.set('generateUuid', () => crypto.randomUUID());
    
    // Math functions
    this.functionRegistry.set('random', (min = 0, max = 100) => 
      Math.floor(Math.random() * (max - min + 1)) + min
    );
    this.functionRegistry.set('calculateVersion', () => 
      Math.floor(Date.now() / 1000).toString()
    );
    
    // String functions
    this.functionRegistry.set('capitalize', (str) => 
      str.charAt(0).toUpperCase() + str.slice(1)
    );
    this.functionRegistry.set('camelCase', (str) => 
      str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    );
    
    // Project functions
    this.functionRegistry.set('projectName', () => this.options.projectName || 'GeneratedProject');
    this.functionRegistry.set('codegenVersion', () => '1.0.0');
  }

  /**
   * Initialize innovation features
   * @returns {void}
   */
  initializeInnovations() {
    this.innovations = {
      fileGenerated: 0,
      linesGenerated: 0,
      classesCreated: 0,
      methodsCreated: 0,
      achievements: new Set()
    };
    
    this.log(this.strings.getMessage('innovation_enabled'), 'info');
  }

  /**
   * Trigger innovation features
   * @param {string} type - Innovation type
   * @param {Object} data - Innovation data
   * @returns {void}
   */
  triggerInnovation(type, data = {}) {
    if (!this.options.enableInnovations || !this.innovations) {
      return;
    }
    
    this.stats.innovationsTriggered++;
    
    switch (type) {
      case 'fileGenerated':
        this.innovations.fileGenerated++;
        this.checkAchievements('fileGenerated', this.innovations.fileGenerated);
        break;
      
      case 'linesGenerated':
        this.innovations.linesGenerated += data.lines || 0;
        this.checkAchievements('linesGenerated', this.innovations.linesGenerated);
        break;
      
      case 'classCreated':
        this.innovations.classesCreated++;
        this.checkAchievements('classesCreated', this.innovations.classesCreated);
        break;
    }
  }

  /**
   * Check and award achievements
   * @param {string} type - Achievement type
   * @param {number} count - Current count
   * @returns {void}
   */
  checkAchievements(type, count) {
    const achievements = {
      fileGenerated: [
        { threshold: 1, name: 'First File', icon: '📄' },
        { threshold: 10, name: 'File Master', icon: '📁' },
        { threshold: 50, name: 'File Legend', icon: '🗂️' },
        { threshold: 100, name: 'File God', icon: '🏆' }
      ],
      linesGenerated: [
        { threshold: 100, name: 'Code Starter', icon: '🌱' },
        { threshold: 1000, name: 'Code Warrior', icon: '⚔️' },
        { threshold: 5000, name: 'Code Master', icon: '🥷' },
        { threshold: 10000, name: 'Code Wizard', icon: '🧙‍♂️' }
      ],
      classesCreated: [
        { threshold: 1, name: 'First Class', icon: '🎓' },
        { threshold: 5, name: 'Class Builder', icon: '🏗️' },
        { threshold: 10, name: 'Class Architect', icon: '🏛️' },
        { threshold: 25, name: 'Class Empire', icon: '👑' }
      ]
    };
    
    const typeAchievements = achievements[type] || [];
    
    for (const achievement of typeAchievements) {
      if (count >= achievement.threshold && !this.innovations.achievements.has(achievement.name)) {
        this.innovations.achievements.add(achievement.name);
        this.displayAchievement(achievement);
      }
    }
  }

  /**
   * Display achievement notification
   * @param {Object} achievement - Achievement object
   * @returns {void}
   */
  displayAchievement(achievement) {
    console.log(this.strings.getMessage('unlocked', { icon: achievement.icon, name: achievement.name }));
    console.log(this.strings.getMessage('keep_going'));
  }

  /**
   * Generate an easter egg
   * @returns {string} Easter egg text
   */
  generateEasterEgg() {
    const easterEggs = [
      this.strings.getMessage('found_me'),
      this.strings.getMessage('unicorn_mode'),
      this.strings.getMessage('ai_watching'),
      this.strings.getMessage('konami_code'),
      this.strings.getMessage('infinity_beyond'),
      this.strings.getMessage('diamond_hands'),
      this.strings.getMessage('rainbow_mode'),
      this.strings.getMessage('all_your_base')
    ];
    
    return easterEggs[Math.floor(Math.random() * easterEggs.length)];
  }

  /**
   * Display welcome message with ASCII art
   * @returns {void}
   */
  displayWelcome() {
    const asciiArt = this.strings.getMessage('revolutionary_logo');
    
    console.log('\x1b[36m' + asciiArt + '\x1b[0m');
    console.log(this.strings.getMessage('welcome_subtitle') + '\n');
  }

  /**
   * Display progress animation
   * @param {string} message - Progress message
   * @param {number} duration - Duration in milliseconds
   * @returns {Promise<void>}
   */
  async displayProgressAnimation(message, duration) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let frame = 0;
    
    const interval = setInterval(() => {
      process.stdout.write(`\r${frames[frame]} ${message}`);
      frame = (frame + 1) % frames.length;
    }, 100);
    
    await new Promise(resolve => setTimeout(resolve, duration));
    clearInterval(interval);
    process.stdout.write(`\r✅ ${message}\n`);
  }

  /**
   * Display completion celebration
   * @param {Object} results - Generation results
   * @returns {void}
   */
  displayCompletion(results) {
    const celebrations = [
      this.strings.getMessage('completion_celebration_1'),
      this.strings.getMessage('completion_celebration_2'),
      this.strings.getMessage('completion_celebration_3'),
      this.strings.getMessage('completion_celebration_4'),
      this.strings.getMessage('completion_celebration_5')
    ];
    
    const celebration = celebrations[Math.floor(Math.random() * celebrations.length)];
    console.log(`\n${celebration}\n`);
    
    // Display stats
    console.log(this.strings.getMessage('stats_files_generated', { count: results.stats.filesGenerated }));
    console.log(this.strings.getMessage('stats_files_backed_up', { count: results.stats.filesBackedUp }));
    console.log(this.strings.getMessage('stats_duration', { duration: Math.round(results.stats.duration) }));
    
    if (this.options.enableInnovations && this.innovations) {
      console.log(this.strings.getMessage('stats_innovations_triggered', { count: results.stats.innovationsTriggered }));
      if (this.innovations.achievements.size > 0) {
        console.log(this.strings.getMessage('stats_achievements_unlocked', { count: this.innovations.achievements.size }));
      }
    }
    
    console.log(`\n${'='.repeat(50)}\n`);
  }

  /**
   * Display error with helpful information
   * @param {Error} error - Error object
   * @returns {void}
   */
  displayError(error) {
    console.log(this.strings.getMessage('oops_something_went_wrong'));
    console.log(this.strings.getMessage('error_message', { error: error.message }));
    console.log(this.strings.getMessage('error_tip_config'));
    console.log(this.strings.getMessage('error_tip_verbose'));
    console.log(this.strings.getMessage('error_tip_reassurance') + '\n');
  }

  /**
   * Log a message with enhanced formatting
   * @param {string} message - Message to log
   * @param {string} level - Log level
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
   * Get comprehensive statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      generatedFiles: this.generatedFiles.size,
      backedUpFiles: this.backupFiles.size,
      cleanupOperations: this.cleanupOperations.length,
      outputDirectory: this.options.outputDir,
      innovations: this.innovations || null
    };
  }

  /**
   * Reset all statistics and state
   * @returns {void}
   */
  reset() {
    this.generatedFiles.clear();
    this.backupFiles.clear();
    this.cleanupOperations = [];
    this.templateCache.clear();
    
    this.stats = {
      startTime: null,
      endTime: null,
      filesGenerated: 0,
      filesBackedUp: 0,
      errors: 0,
      warnings: 0,
      innovationsTriggered: 0
    };
    
    if (this.innovations) {
      this.innovations.achievements.clear();
      this.innovations.fileGenerated = 0;
      this.innovations.linesGenerated = 0;
      this.innovations.classesCreated = 0;
    }
  }
}

module.exports = BaseCodegen;
