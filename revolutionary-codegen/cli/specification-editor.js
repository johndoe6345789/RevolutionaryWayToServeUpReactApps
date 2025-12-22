#!/usr/bin/env node

/**
 * SpecificationEditor - Interactive CLI editor for project specifications
 * Provides real-time validation, auto-completion, and guided editing
 * 
 * 🚀 Revolutionary Features:
 * - Interactive specification editing
 * - Real-time validation with error highlighting
 * - Auto-completion and suggestions
 * - Template library integration
 * - Visual specification tree
 * - Import/export functionality
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const BaseCodegen = require('../base/base-codegen');

class SpecificationEditor extends BaseCodegen {
  constructor(options = {}) {
    super({
      ...options,
      enableInnovations: true
    });
    
    this.specification = null;
    this.currentPath = null;
    this.rl = null;
    this.history = [];
    this.historyIndex = -1;
    this.templates = new Map();
    this.validationErrors = [];
  }

  /**
   * Initialize the specification editor
   * @returns {Promise<SpecificationEditor>} The initialized editor
   */
  async initialize() {
    await super.initialize();
    
    this.log('📝 Initializing specification editor...', 'info');
    
    // Load or create specification
    await this.loadSpecification();
    
    // Initialize readline interface
    this.initializeReadline();
    
    // Load templates
    this.loadTemplates();
    
    this.displayWelcome();
    
    return this;
  }

  /**
   * Execute the specification editor (main loop)
   * @returns {Promise<Object>} Edited specification
   */
  async execute() {
    this.log('⚡ Starting interactive specification editor...', 'info');
    
    try {
      await this.mainLoop();
    } catch (error) {
      this.log(`❌ Specification editor failed: ${error.message}`, 'error');
      this.displayError(error);
    } finally {
      this.cleanup();
    }
    
    return this.specification;
  }

  /**
   * Load specification from file or create new one
   * @returns {Promise<void>}
   */
  async loadSpecification() {
    if (this.options.specPath) {
      this.currentPath = this.options.specPath;
      
      if (fs.existsSync(this.currentPath)) {
        try {
          const content = fs.readFileSync(this.currentPath, 'utf8');
          this.specification = JSON.parse(content);
          this.log(`📂 Loaded specification from ${this.currentPath}`, 'success');
        } catch (error) {
          this.log(`⚠️  Failed to load specification: ${error.message}`, 'warning');
          this.specification = this.createNewSpecification();
        }
      } else {
        this.log(`📄 Creating new specification at ${this.currentPath}`, 'info');
        this.specification = this.createNewSpecification();
      }
    } else {
      this.specification = this.createNewSpecification();
      this.currentPath = null;
    }
    
    // Validate loaded specification
    this.validateSpecification();
  }

  /**
   * Create a new default specification
   * @returns {Object} Default specification
   */
  createNewSpecification() {
    return {
      project: {
        name: 'MyRevolutionaryProject',
        version: '1.0.0',
        description: 'A revolutionary project generated with RevolutionaryCodegen',
        author: 'Revolutionary Developer',
        license: 'MIT',
        generated: new Date().toISOString()
      },
      structure: {
        rootDir: './generated-project',
        folders: [
          {
            name: 'src',
            path: 'src',
            description: 'Source code directory',
            subfolders: [
              {
                name: 'business',
                path: 'business',
                description: 'Business logic classes'
              },
              {
                name: 'data',
                path: 'data',
                description: 'Data classes'
              },
              {
                name: 'factories',
                path: 'factories',
                description: 'Factory classes'
              }
            ]
          },
          {
            name: 'test',
            path: 'test',
            description: 'Test files'
          },
          {
            name: 'docs',
            path: 'docs',
            description: 'Documentation'
          }
        ],
        files: []
      },
      classes: {
        businessLogic: [],
        aggregates: [],
        factories: [],
        dataClasses: []
      },
      plugins: {
        groups: [
          {
            name: 'core',
            description: 'Core functionality plugins',
            category: 'generation',
            plugins: []
          }
        ]
      },
      codegen: {
        templates: {},
        rules: {
          enforceTwoMethodLimit: true,
          requireDataclassPattern: true,
          requireSingleConstructorParam: true,
          requireBaseClassInheritance: true,
          maxClassLines: 100,
          maxMethodLines: 20
        },
        validation: {
          strictMode: true,
          autoFix: false,
          warningsAsErrors: false
        },
        output: {
          cleanBeforeGenerate: true,
          backupExisting: true,
          generateTypeScript: true,
          generateTests: true,
          generateDocs: true
        }
      },
      constants: {
        maxNestingLevel: 5,
        defaultAggregateType: 'nested',
        generatedCodeMarker: 'Auto-generated by RevolutionaryCodegen',
        functions: {
          getTimestamp: 'return new Date().toISOString();',
          calculateVersion: 'return Math.floor(Date.now() / 1000).toString();',
          generateId: 'return Date.now().toString(36) + Math.random().toString(36).substr(2);'
        }
      }
    };
  }

  /**
   * Initialize readline interface
   * @returns {void}
   */
  initializeReadline() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '\n🔧 spec> ',
      history: this.history,
      historySize: 100
    });
  }

  /**
   * Load editor templates
   * @returns {void}
   */
  loadTemplates() {
    this.templates.set('basic-web-app', {
      name: 'Basic Web Application',
      description: 'Simple web application structure',
      template: {
        project: {
          name: 'MyWebApp',
          version: '1.0.0',
          description: 'A basic web application'
        },
        structure: {
          folders: [
            {
              name: 'src',
              path: 'src',
              description: 'Source code',
              subfolders: [
                { name: 'components', path: 'components', description: 'React components' },
                { name: 'services', path: 'services', description: 'API services' },
                { name: 'utils', path: 'utils', description: 'Utility functions' }
              ]
            },
            { name: 'public', path: 'public', description: 'Static assets' }
          ]
        }
      }
    });
    
    this.templates.set('microservice', {
      name: 'Microservice',
      description: 'Microservice architecture',
      template: {
        project: {
          name: 'MyMicroservice',
          version: '1.0.0',
          description: 'A microservice application'
        },
        structure: {
          folders: [
            {
              name: 'src',
              path: 'src',
              description: 'Source code',
              subfolders: [
                { name: 'controllers', path: 'controllers', description: 'Request handlers' },
                { name: 'models', path: 'models', description: 'Data models' },
                { name: 'middleware', path: 'middleware', description: 'Request middleware' }
              ]
            }
          ]
        }
      }
    });
  }

  /**
   * Main editor loop
   * @returns {Promise<void>}
   */
  async mainLoop() {
    this.displayMainMenu();
    
    while (true) {
      try {
        const answer = await this.askQuestion('Enter command (type "help" for available commands):');
        
        if (!answer) {
          continue;
        }
        
        const [command, ...args] = answer.trim().split(' ');
        
        switch (command.toLowerCase()) {
          case 'help':
            this.displayHelp();
            break;
            
          case 'status':
            this.displayStatus();
            break;
            
          case 'tree':
            this.displaySpecificationTree();
            break;
            
          case 'edit':
            await this.editSpecification(args);
            break;
            
          case 'validate':
            this.validateSpecification();
            this.displayValidationResults();
            break;
            
          case 'template':
            await this.applyTemplate(args);
            break;
            
          case 'save':
            await this.saveSpecification(args[0]);
            break;
            
          case 'export':
            await this.exportSpecification(args[0]);
            break;
            
          case 'import':
            await this.importSpecification(args[0]);
            break;
            
          case 'new':
            this.specification = this.createNewSpecification();
            this.log('📄 Created new specification', 'success');
            break;
            
          case 'quit':
          case 'exit':
            this.log('👋 Goodbye! Revolutionary coding awaits!', 'success');
            return;
            
          default:
            this.log(`❓ Unknown command: ${command}`, 'warning');
            this.log('💡 Type "help" for available commands', 'info');
            break;
        }
        
        // Add to history
        this.history.push(answer);
        this.historyIndex = this.history.length;
        
      } catch (error) {
        this.log(`❌ Command failed: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Display welcome message and current status
   * @returns {void}
   */
  displayWelcome() {
    const strings = this.strings;
    console.log(strings.getConsole('revolutionary_specification_editor_welcome'));
    console.log(strings.getConsole('specification_editor_separator'));

    if (this.currentPath) {
      console.log(`📂 Current file: ${this.currentPath}`);
    } else {
      console.log(strings.getConsole('working_on_new_specification'));
    }

    console.log(`📋 Project: ${this.specification.project.name}`);
    console.log(`📦 Version: ${this.specification.project.version}\n`);
  }

  /**
   * Display main menu
   * @returns {void}
   */
  displayMainMenu() {
    const strings = this.strings;
    console.log(strings.getConsole('main_menu'));
    console.log(strings.getConsole('help_command'));
    console.log(strings.getConsole('status_command'));
    console.log(strings.getConsole('tree_command'));
    console.log(strings.getConsole('edit_command'));
    console.log(strings.getConsole('validate_command'));
    console.log(strings.getConsole('template_command'));
    console.log(strings.getConsole('save_command'));
    console.log(strings.getConsole('export_command'));
    console.log(strings.getConsole('import_command'));
    console.log(strings.getConsole('new_command'));
    console.log(strings.getConsole('quit_command'));
  }

  /**
   * Display help information
   * @returns {void}
   */
  displayHelp() {
    console.log('\n📚 AVAILABLE COMMANDS:');
    console.log('\n📋 EDITING COMMANDS:');
    console.log('  edit <path>          - Edit specification section');
    console.log('                        path: project.name, structure.folders, classes.businessLogic, etc.');
    console.log('  template <name>        - Apply a predefined template');
    console.log('  new                   - Create new specification');
    
    console.log('\n💾 FILE COMMANDS:');
    console.log('  save [filename]        - Save specification (uses current file if no filename)');
    console.log('  export <filename>        - Export to different format');
    console.log('  import <filename>        - Import specification from file');
    
    console.log('\n🔍 VALIDATION COMMANDS:');
    console.log('  validate               - Validate current specification');
    console.log('  status                 - Show specification summary');
    console.log('  tree                   - Show specification tree view');
    
    console.log('\n📚 TEMPLATES:');
    this.templates.forEach((template, name) => {
      console.log(`  ${name.padEnd(20)} - ${template.description}`);
    });
    
    console.log('\n💡 EXAMPLES:');
    console.log('  edit project.name        - Edit project name');
    console.log('  edit structure.folders    - Edit folder structure');
    console.log('  edit classes.businessLogic - Edit business logic classes');
    console.log('  template basic-web-app  - Apply web app template');
    console.log('  save my-project.json   - Save to specific file');
  }

  /**
   * Display current specification status
   * @returns {void}
   */
  displayStatus() {
    const strings = this.strings;
    console.log(strings.getConsole('specification_status'));
    console.log(`  📝 Project: ${this.specification.project.name} v${this.specification.project.version}`);
    console.log(`  📖 Description: ${this.specification.project.description}`);
    console.log(`  👤 Author: ${this.specification.project.author}`);
    console.log(`  ⚖️  License: ${this.specification.project.license}`);
    console.log(`  📁 Folders: ${this.specification.structure.folders?.length || 0}`);
    console.log(`  📄 Files: ${this.specification.structure.files?.length || 0}`);
    console.log(`  💼 Business Classes: ${this.specification.classes.businessLogic?.length || 0}`);
    console.log(`  🏗️  Aggregates: ${this.specification.classes.aggregates?.length || 0}`);
    console.log(`  🏭 Factories: ${this.specification.classes.factories?.length || 0}`);
    console.log(`  📦 Data Classes: ${this.specification.classes.dataClasses?.length || 0}`);
    console.log(`  🔌 Plugin Groups: ${this.specification.plugins.groups?.length || 0}`);

    if (this.validationErrors.length > 0) {
      console.log(`  ❌ Validation Errors: ${this.validationErrors.length}`);
      this.displayValidationErrors();
    } else {
      console.log(strings.getConsole('validation_passed'));
    }
  }

  /**
   * Display specification as tree
   * @returns {void}
   */
  displaySpecificationTree() {
    console.log('\n🌳 SPECIFICATION TREE:');
    
    const displayTree = (obj, prefix = '', isLast = true) => {
      const keys = Object.keys(obj);
      
      keys.forEach((key, index) => {
        const isLastKey = index === keys.length - 1;
        const currentPrefix = isLastKey ? '└── ' : '├── ';
        const nextPrefix = isLastKey ? '    ' : '│   ';
        
        console.log(`${prefix}${currentPrefix}${key}`);
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (Array.isArray(obj[key])) {
            console.log(`${prefix}${nextPrefix}(${obj[key].length} items)`);
          } else {
            displayTree(obj[key], prefix + nextPrefix, isLastKey);
          }
        }
      });
    };
    
    displayTree(this.specification);
  }

  /**
   * Edit specification section
   * @param {Array} args - Command arguments
   * @returns {Promise<void>}
   */
  async editSpecification(args) {
    if (args.length === 0) {
      this.log('❌ Please specify a path to edit', 'error');
      this.log('💡 Example: edit project.name', 'info');
      return;
    }
    
    const path = args.join('.');
    
    try {
      const currentValue = this.getNestedValue(this.specification, path);
      
      console.log(`\n📝 Editing: ${path}`);
      console.log(`📄 Current value: ${JSON.stringify(currentValue, null, 2)}`);
      
      const newValue = await this.askQuestion('Enter new value (JSON format or "delete" to remove):');
      
      if (newValue.toLowerCase() === 'delete') {
        this.removeNestedValue(this.specification, path);
        this.log(`🗑️  Deleted: ${path}`, 'success');
      } else {
        try {
          const parsedValue = JSON.parse(newValue);
          this.setNestedValue(this.specification, path, parsedValue);
          this.log(`✅ Updated: ${path}`, 'success');
        } catch (error) {
          this.log(`❌ Invalid JSON: ${error.message}`, 'error');
        }
      }
      
      // Validate after edit
      this.validateSpecification();
      
    } catch (error) {
      this.log(`❌ Edit failed: ${error.message}`, 'error');
    }
  }

  /**
   * Apply a template to the current specification
   * @param {Array} args - Command arguments
   * @returns {Promise<void>}
   */
  async applyTemplate(args) {
    if (args.length === 0) {
      this.log('❌ Please specify a template name', 'error');
      this.log('💡 Available templates:');
      this.templates.forEach((template, name) => {
        console.log(`  ${name} - ${template.description}`);
      });
      return;
    }
    
    const templateName = args[0];
    
    if (!this.templates.has(templateName)) {
      this.log(`❌ Template not found: ${templateName}`, 'error');
      return;
    }
    
    const template = this.templates.get(templateName);
    
    console.log(`\n📋 Applying template: ${template.name}`);
    console.log(`📖 ${template.description}`);
    
    // Merge template with current specification
    this.deepMerge(this.specification, template.template);
    
    this.log('✅ Template applied successfully', 'success');
    this.validateSpecification();
    
    // Trigger innovation
    this.triggerInnovation('templateApplied', { name: templateName });
  }

  /**
   * Save specification to file
   * @param {string} filename - Optional filename
   * @returns {Promise<void>}
   */
  async saveSpecification(filename) {
    const filePath = filename || this.currentPath || 'specification.json';
    
    try {
      const content = JSON.stringify(this.specification, null, 2);
      fs.writeFileSync(filePath, content, 'utf8');
      
      this.currentPath = filePath;
      this.log(`💾 Saved specification to ${filePath}`, 'success');
      
      // Trigger innovation
      this.triggerInnovation('specificationSaved', { path: filePath });
      
    } catch (error) {
      this.log(`❌ Save failed: ${error.message}`, 'error');
    }
  }

  /**
   * Export specification in different format
   * @param {string} filename - Target filename
   * @returns {Promise<void>}
   */
  async exportSpecification(filename) {
    const filePath = filename || 'specification-export.json';
    
    try {
      // Add export metadata
      const exportData = {
        ...this.specification,
        _export: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'RevolutionaryCodegen SpecificationEditor',
          version: '1.0.0'
        }
      };
      
      const content = JSON.stringify(exportData, null, 2);
      fs.writeFileSync(filePath, content, 'utf8');
      
      this.log(`📤 Exported specification to ${filePath}`, 'success');
      
    } catch (error) {
      this.log(`❌ Export failed: ${error.message}`, 'error');
    }
  }

  /**
   * Import specification from file
   * @param {string} filename - Source filename
   * @returns {Promise<void>}
   */
  async importSpecification(filename) {
    if (!filename) {
      this.log('❌ Please specify a filename to import', 'error');
      return;
    }
    
    try {
      if (!fs.existsSync(filename)) {
        this.log(`❌ File not found: ${filename}`, 'error');
        return;
      }
      
      const content = fs.readFileSync(filename, 'utf8');
      const importedSpec = JSON.parse(content);
      
      this.specification = importedSpec;
      this.currentPath = filename;
      
      this.log(`📥 Imported specification from ${filename}`, 'success');
      this.validateSpecification();
      
      // Trigger innovation
      this.triggerInnovation('specificationImported', { path: filename });
      
    } catch (error) {
      this.log(`❌ Import failed: ${error.message}`, 'error');
    }
  }

  /**
   * Validate current specification
   * @returns {void}
   */
  validateSpecification() {
    this.validationErrors = [];
    
    // Basic structure validation
    if (!this.specification.project) {
      this.validationErrors.push('Missing project configuration');
    }
    
    if (!this.specification.structure) {
      this.validationErrors.push('Missing structure configuration');
    }
    
    if (!this.specification.classes) {
      this.validationErrors.push('Missing classes configuration');
    }
    
    if (!this.specification.plugins) {
      this.validationErrors.push('Missing plugins configuration');
    }
    
    // Project validation
    const project = this.specification.project;
    if (project) {
      if (!project.name) this.validationErrors.push('Project name is required');
      if (!project.version) this.validationErrors.push('Project version is required');
      if (!project.description) this.validationErrors.push('Project description is required');
      
      if (project.version && !/^\d+\.\d+\.\d+$/.test(project.version)) {
        this.validationErrors.push('Project version must be in format x.y.z');
      }
    }
    
    // Structure validation
    const structure = this.specification.structure;
    if (structure && structure.folders) {
      structure.folders.forEach((folder, index) => {
        if (!folder.name || !folder.path) {
          this.validationErrors.push(`Folder ${index} missing name or path`);
        }
      });
    }
    
    // Classes validation
    const classes = this.specification.classes;
    if (classes) {
      if (classes.businessLogic) {
        classes.businessLogic.forEach((cls, index) => {
          if (!cls.name || !cls.module) {
            this.validationErrors.push(`Business class ${index} missing name or module`);
          }
        });
      }
    }
  }

  /**
   * Display validation results
   * @returns {void}
   */
  displayValidationResults() {
    if (this.validationErrors.length === 0) {
      console.log('\n✅ VALIDATION: PASSED');
      console.log('🎉 Specification is valid and ready for generation!');
    } else {
      console.log('\n❌ VALIDATION: FAILED');
      this.displayValidationErrors();
    }
  }

  /**
   * Display validation errors
   * @returns {void}
   */
  displayValidationErrors() {
    console.log('\n🚨 VALIDATION ERRORS:');
    this.validationErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  /**
   * Ask a question and return the answer
   * @param {string} question - Question to ask
   * @returns {Promise<string>} User's answer
   */
  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Source object
   * @param {string} path - Dot notation path
   * @returns {any} Value at path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set nested value in object using dot notation
   * @param {Object} obj - Target object
   * @param {string} path - Dot notation path
   * @param {any} value - Value to set
   * @returns {void}
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }

  /**
   * Remove nested value from object using dot notation
   * @param {Object} obj - Target object
   * @param {string} path - Dot notation path
   * @returns {void}
   */
  removeNestedValue(obj, path) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
    
    if (target && target[lastKey] !== undefined) {
      delete target[lastKey];
    }
  }

  /**
   * Deep merge two objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {void}
   */
  deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  /**
   * Display error with helpful information
   * @param {Error} error - Error object
   * @returns {void}
   */
  displayError(error) {
    console.log('\n❌ ERROR OCCURRED:');
    console.log(`   Message: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
    console.log('\n💡 TIPS:');
    console.log('   - Check your JSON syntax');
    console.log('   - Validate specification before saving');
    console.log('   - Use "validate" command to check for issues');
    console.log('   - Type "help" for available commands');
  }

  /**
   * Clean up readline interface
   * @returns {void}
   */
  cleanup() {
    if (this.rl) {
      this.rl.close();
    }
  }
}

// CLI interface for direct execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--spec-path':
        options.specPath = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
Revolutionary Specification Editor

Usage: node specification-editor.js [options]

Options:
  --spec-path <file>    Load existing specification file
  --help, -h           Show this help message

Examples:
  node specification-editor.js
  node specification-editor.js --spec-path my-project.json
        `);
        process.exit(0);
    }
  }
  
  try {
    const editor = new SpecificationEditor(options);
    await editor.initialize();
    await editor.execute();
  } catch (error) {
    console.error(`\n❌ Specification editor failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = SpecificationEditor;
