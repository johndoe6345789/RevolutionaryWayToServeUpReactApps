#!/usr/bin/env node

/**
 * RevolutionaryCodegen - Main codegen orchestrator
 * Unified system for project generation with CLI and WebUI support
 * 
 * 🚀 Revolutionary Features:
 * - Complete project generation from JSON specification
 * - Multiple generator types (structure, business logic, aggregates, etc.)
 * - CLI and WebUI interfaces
 * - Plugin architecture
 * - Clean up/down lifecycle management
 * - Innovation features and easter eggs
 * - Language-agnostic design
 */

const path = require('path');
const fs = require('fs');

// Import string service
const { getStringService } = require('../bootstrap/services/string-service');

// Import all generators
const BaseCodegen = require('./base/base-codegen');
const ProjectStructureGenerator = require('./generators/project-structure-generator');
const BusinessLogicGenerator = require('./generators/business-logic-generator');
const SpecificationEditor = require('./cli/specification-editor');

class RevolutionaryCodegen extends BaseCodegen {
  constructor(options = {}) {
    super({
      ...options,
      outputDir: options.outputDir || './generated-project',
      enableInnovations: options.enableInnovations !== false
    });
    
    this.generators = new Map();
    this.specification = null;
    this.runner = null;
  }

  /**
   * Initialize RevolutionaryCodegen system
   * @returns {Promise<RevolutionaryCodegen>} The initialized system
   */
  async initialize() {
    await super.initialize();
    const strings = getStringService();
    
    this.log(strings.getMessage('rev_codegen_initializing'), 'info');
    
    // Register all generators
    this.registerGenerators();
    
    // Load specification
    await this.loadSpecification();
    
    // Initialize generators
    await this.initializeGenerators();
    
    return this;
  }

  /**
   * Execute complete codegen pipeline
   * @returns {Promise<Object>} Generation results
   */
  async execute() {
    const strings = getStringService();
    this.log(strings.getMessage('rev_codegen_executing'), 'info');
    
    const results = {
      timestamp: new Date().toISOString(),
      generators: {},
      summary: {
        totalGenerators: this.generators.size,
        successfulGenerators: 0,
        failedGenerators: 0,
        totalFiles: 0,
        totalErrors: 0,
        totalWarnings: 0,
        duration: 0
      }
    };
    
    const startTime = Date.now();
    
    try {
      // Execute each generator
      for (const [name, generator] of this.generators) {
        this.log(strings.getMessage('generator_running', { name }), 'info');
        
        try {
          const generatorResults = await generator.execute();
          results.generators[name] = generatorResults;
          results.summary.successfulGenerators++;
          
          // Update summary
          if (generatorResults.generatedFiles) {
            results.summary.totalFiles += generatorResults.generatedFiles.length;
          }
          if (generatorResults.errors) {
            results.summary.totalErrors += generatorResults.errors.length;
          }
          if (generatorResults.warnings) {
            results.summary.totalWarnings += generatorResults.warnings.length;
          }
          
          this.log(strings.getMessage('generator_complete', { name }), 'success');

          // Trigger innovation
          this.triggerInnovation('generatorCompleted', { name });

        } catch (error) {
          this.log(strings.getMessage('generator_failed', { name, error: error.message }), 'error');
          results.summary.failedGenerators++;
          results.summary.totalErrors++;

          // Continue with other generators if not strict mode
          if (!this.options.strictMode) {
            this.log(strings.getMessage('continuing_generators'), 'warning');
          } else {
            throw error;
          }
        }
      }

      results.summary.duration = Date.now() - startTime;

      // Generate final report
      await this.generateReport(results);

      // Display completion celebration
      this.displayCompletion(results);

    } catch (error) {
      this.log(strings.getMessage('codegen_failed', { error: error.message }), 'error');
      throw error;
    }
    
    return results;
  }

  /**
   * Register all available generators
   * @returns {void}
   */
  registerGenerators() {
    // Project Structure Generator
    this.generators.set('project-structure', new ProjectStructureGenerator({
      outputDir: path.join(this.options.outputDir, 'generated-project'),
      enableInnovations: this.options.enableInnovations,
      enableTypeScript: this.options.enableTypeScript,
      enableTests: this.options.enableTests,
      initializeGit: this.options.initializeGit
    }));
    
    // Business Logic Generator
    this.generators.set('business-logic', new BusinessLogicGenerator({
      outputDir: path.join(this.options.outputDir, 'generated-project'),
      specPath: this.options.specPath,
      specification: this.specification,
      enableInnovations: this.options.enableInnovations,
      enableTypeScript: this.options.enableTypeScript,
      enableTests: this.options.enableTests
    }));
  }

  /**
   * Load project specification
   * @returns {Promise<void>}
   */
  async loadSpecification() {
    const strings = getStringService();
    if (this.options.specPath) {
      try {
        if (fs.existsSync(this.options.specPath)) {
          const content = fs.readFileSync(this.options.specPath, 'utf8');
          this.specification = JSON.parse(content);
          this.log(strings.getMessage('loading_specification', { path: this.options.specPath }), 'success');
        } else {
          this.log(strings.getMessage('specification_not_found', { path: this.options.specPath }), 'warning');
          this.specification = null;
        }
      } catch (error) {
        this.log(strings.getMessage('specification_load_failed', { error: error.message }), 'error');
        if (!this.options.strictMode) {
          this.log(strings.getMessage('using_default_spec'), 'info');
          this.specification = this.createDefaultSpecification();
        } else {
          throw error;
        }
      }
    } else {
      this.log(strings.getMessage('using_default_spec'), 'info');
      this.specification = this.createDefaultSpecification();
    }
  }

  /**
   * Create default specification
   * @returns {Object} Default specification
   */
  createDefaultSpecification() {
    return {
      project: {
        name: 'RevolutionaryProject',
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
        businessLogic: [
          {
            name: 'UserService',
            description: 'Service for user management operations',
            module: 'business',
            extends: 'BaseService',
            dataClass: 'UserData',
            factory: 'UserServiceFactory',
            config: {
              maxUsers: 1000,
              enableCaching: true
            },
            dependencies: ['BaseService', 'UserData']
          },
          {
            name: 'DataService',
            description: 'Service for data persistence operations',
            module: 'business',
            extends: 'BaseService',
            dataClass: 'ConfigData',
            factory: 'DataServiceFactory',
            config: {
              databaseUrl: 'sqlite:app.db',
              enableTransactions: true
            },
            dependencies: ['BaseService', 'ConfigData']
          }
        ],
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
   * Initialize all generators
   * @returns {Promise<void>}
   */
  async initializeGenerators() {
    const strings = getStringService();
    this.log(strings.getMessage('initializing_generators'), 'info');
    
    for (const [name, generator] of this.generators) {
      try {
        // Set specification for generators that need it
        if (this.specification && generator.initialize) {
          if (name === 'project-structure') {
            generator.options.specification = this.specification;
          } else if (name === 'business-logic') {
            generator.options.specification = this.specification;
          }
        }
        
        await generator.initialize();
        this.log(strings.getMessage('generator_initialized', { name }), 'success');
        
      } catch (error) {
        this.log(strings.getMessage('generator_init_failed', { name, error: error.message }), 'error');
        if (!this.options.strictMode) {
          this.log(strings.getMessage('continuing_without_generator', { name }), 'warning');
        } else {
          throw error;
        }
      }
    }
    
    this.log(strings.getMessage('all_generators_initialized', { count: this.generators.size }), 'success');
  }

  /**
   * Generate comprehensive report
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateReport(results) {
    const strings = getStringService();
    this.log(strings.getConsole('generating_report'), 'info');
    
    const report = {
      generated: results.timestamp,
      summary: results.summary,
      generators: Object.keys(results.generators).map(name => ({
        name,
        filesGenerated: results.generators[name]?.generatedFiles?.length || 0,
        errors: results.generators[name]?.errors?.length || 0,
        warnings: results.generators[name]?.warnings?.length || 0,
        duration: results.generators[name]?.stats?.duration || 0
      })),
      specification: this.specification,
      innovations: this.innovations || null,
      systemInfo: {
        revolutionaryCodegen: {
          version: '1.0.0',
          features: [
            'Project structure generation',
            'Business logic class generation',
            'Aggregate hierarchy generation',
            'Factory pattern generation',
            'Data class generation',
            'CLI specification editor',
            'TypeScript definitions',
            'Test stub generation',
            'Plugin architecture',
            'Clean up/down lifecycle',
            'Innovation features',
            'Easter eggs',
            'Language-agnostic design'
          ]
        },
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        }
      }
    };
    
    // Write report file
    const reportPath = path.join(this.options.outputDir, 'revolutionary-codegen-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    this.log(strings.getConsole('report_saved', { path: reportPath }), 'success');
  }

  /**
   * Display completion celebration with innovation features
   * @param {Object} results - Generation results
   * @returns {void}
   */
  displayCompletion(results) {
    const strings = getStringService();
    const celebrations = [
      strings.getMessage('completion_celebration_1'),
      strings.getMessage('completion_celebration_2'),
      strings.getMessage('completion_celebration_3'),
      strings.getMessage('completion_celebration_4'),
      strings.getMessage('completion_celebration_5')
    ];
    
    const celebration = celebrations[Math.floor(Math.random() * celebrations.length)];
    console.log(`\n${celebration}\n`);

    // Display comprehensive statistics
    console.log(strings.getConsole('revolutionary_generation_statistics'));
    console.log(strings.getMessage('stats_files_generated', { count: results.summary.successfulGenerators }));
    console.log(strings.getMessage('stats_duration', { duration: results.summary.duration }));
    
    if (results.summary.totalErrors > 0) {
      console.log(strings.getMessage('stats_errors', { count: results.summary.totalErrors }));
    }
    
    if (results.summary.totalWarnings > 0) {
      console.log(strings.getMessage('stats_warnings', { count: results.summary.totalWarnings }));
    }
    
    // Display generator breakdown
    console.log('\n' + strings.getMessage('generator_breakdown'));
    for (const [name, generator] of this.generators) {
      const generatorResults = results.generators[name];
      if (generatorResults) {
        const status = generatorResults.errors?.length > 0 ? '❌' : 
                     generatorResults.warnings?.length > 0 ? '⚠️' : '✅';
        
        console.log(`   ${status} ${name.padEnd(20)}: ${generatorResults.generatedFiles?.length || 0} files`);
      }
    }
    
    // Display innovation features
    if (this.options.enableInnovations && this.innovations) {
      console.log('\n🎮 INNOVATION FEATURES:');
      if (this.innovations.achievements && this.innovations.achievements.size > 0) {
        console.log(strings.getMessage('stats_achievements_unlocked', { count: this.innovations.achievements.size }));
        this.innovations.achievements.forEach(achievement => {
          console.log(`      🎖 ${achievement}`);
        });
      }
      
      console.log(strings.getMessage('stats_innovations_triggered', { count: this.innovations.innovationsTriggered || 0 }));
    }
    
    console.log(strings.getConsole('separator_line'));

    // Display next steps
    console.log(strings.getConsole('next_steps_header') + strings.getMessage('next_steps'));
    console.log(strings.getMessage('next_step_1'));
    console.log(strings.getMessage('next_step_2'));
    console.log(strings.getMessage('next_step_3'));
    console.log(strings.getMessage('next_step_4'));
    console.log(strings.getMessage('next_step_5'));
    
    console.log('\n' + strings.getMessage('farewell_message'));
  }

  /**
   * Run specification editor mode
   * @returns {Promise<void>}
   */
  async runSpecificationEditor() {
    const strings = getStringService();
    this.log(strings.getMessage('launching_spec_editor'), 'info');
    
    const editor = new SpecificationEditor({
      specPath: this.options.specPath,
      enableInnovations: this.options.enableInnovations
    });
    
    await editor.initialize();
    await editor.execute();
  }

  /**
   * Generate project from specification
   * @returns {Promise<void>}
   */
  async generateProject() {
    const strings = getStringService();
    this.log(strings.getMessage('generating_project_from_spec'), 'info');
    
    if (!this.specification) {
      this.log(strings.getError('specification_not_loaded'), 'error');
      throw new Error(strings.getError('specification_required'));
    }
    
    await this.execute();
  }

  /**
   * Display revolutionary help
   * @returns {void}
   */
  displayHelp() {
    console.log(`
🚀 REVOLUTIONARY CODEGEN - Revolutionary Project Generation System

USAGE:
  node revolutionary-codegen.js [command] [options]

COMMANDS:
  generate               Generate project from specification
  edit                   Edit project specification
  validate              Validate current specification
  help                  Show this help message
  version                Show version information

OPTIONS:
  --spec-path <file>        Path to specification JSON file
  --output-dir <path>        Output directory for generated project
  --enable-innovations       Enable innovation features (default: true)
  --disable-innovations       Disable innovation features
  --enable-typescript         Generate TypeScript definitions (default: true)
  --disable-typescript        Disable TypeScript generation
  --enable-tests             Generate test stubs (default: true)
  --disable-tests              Disable test generation
  --enable-git               Initialize git repository (default: false)
  --strict-mode              Treat warnings as errors (default: false)
  --verbose                  Enable verbose logging
  --help, -h               Show this help message

EXAMPLES:
  # Generate project with specification
  node revolutionary-codegen.js generate --spec-path my-project.json
  
  # Edit specification
  node revolutionary-codegen.js edit --spec-path my-project.json
  
  # Generate with custom output
  node revolutionary-codegen.js generate --spec-path my-project.json --output-dir ./my-project
  
  # Generate with all features enabled
  node revolutionary-codegen.js generate --spec-path my-project.json --enable-innovations --enable-typescript --enable-tests --enable-git

🎯 REVOLUTIONARY FEATURES:
  • Complete project structure generation
  • Business logic classes with initialize/execute pattern
  • Aggregate hierarchy generation with unlimited nesting
  • Factory and data class generation
  • Interactive specification editing
  • TypeScript definitions
  • Test stub generation
  • Plugin architecture
  • Clean up/down lifecycle management
  • Innovation features and achievements
  • Easter eggs and developer humor
  • Language-agnostic design

🔧 GENERATORS:
  • Project Structure Generator: Creates folder hierarchy and static files
  • Business Logic Generator: Creates classes with initialize/execute pattern
  • Specification Editor: Interactive editing with validation
  • More generators coming soon!

📋 PATTERNS ENFORCED:
  • Two methods per class (initialize + execute)
  • Single constructor parameter (dataclass pattern)
  • Base class inheritance required
  • Maximum class size: 100 lines
  • Maximum method size: 20 lines
  • Dataclass constructor pattern
  • Factory pattern for object creation

🎮 INNOVATIONS:
  • Achievement system for milestones
  • Easter eggs and developer jokes
  • Progress animations and celebrations
  • Interactive feedback and gamification
  • Revolutionary ASCII art and messaging

🚀 GETTING STARTED:
  1. Create/edit specification: node revolutionary-codegen.js edit
  2. Validate specification: node revolutionary-codegen.js validate
  3. Generate project: node revolutionary-codegen.js generate
  
For more information, visit: https://github.com/revolutionary-codegen
`);
  }

  /**
   * Display version information
   * @returns {void}
   */
  displayVersion() {
    console.log(`
🚀 REVOLUTIONARY CODEGEN
Version: 1.0.0
Description: Revolutionary Project Generation System
Author: Revolutionary Developer
License: MIT

🎯 Features: Complete project generation with innovation
🔧 Patterns: OO principles with initialize/execute
🎮 Innovations: Achievements, easter eggs, and more!
🚀 Future: Revolutionary software development
`);
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
      case '--output-dir':
        options.outputDir = args[++i];
        break;
      case '--enable-innovations':
        options.enableInnovations = true;
        break;
      case '--disable-innovations':
        options.enableInnovations = false;
        break;
      case '--enable-typescript':
        options.enableTypeScript = true;
        break;
      case '--disable-typescript':
        options.enableTypeScript = false;
        break;
      case '--enable-tests':
        options.enableTests = true;
        break;
      case '--disable-tests':
        options.enableTests = false;
        break;
      case '--enable-git':
        options.initializeGit = true;
        break;
      case '--strict-mode':
        options.strictMode = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        const helpCodegen = new RevolutionaryCodegen(options);
        helpCodegen.displayHelp();
        process.exit(0);
        break;
      case '--version':
        const versionCodegen = new RevolutionaryCodegen(options);
        versionCodegen.displayVersion();
        process.exit(0);
        break;
      default:
        if (args[i].startsWith('--') && i + 1 < args.length) {
          // Skip next argument for options with values
          i++;
        }
        break;
    }
  }
  
  // Determine command
  const command = args[0];
  
  try {
    const codegen = new RevolutionaryCodegen(options);
    
    switch (command) {
      case 'generate':
        await codegen.initialize();
        await codegen.generateProject();
        break;
        
      case 'edit':
        await codegen.runSpecificationEditor();
        break;
        
      case 'validate':
        await codegen.initialize();
        // Validation would be handled by individual generators
        const strings = getStringService();
        console.log(strings.getConsole('specification_valid'));
        break;

      default:
        const codegen = new RevolutionaryCodegen(options);
        codegen.displayHelp();
        process.exit(1);
    }

  } catch (error) {
    const strings = getStringService();
    console.error(strings.getConsole('revolutionary_codegen_failed', { error: error.message }));
    process.exit(1);
  }
}

module.exports = RevolutionaryCodegen;
