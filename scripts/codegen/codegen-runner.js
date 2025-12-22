#!/usr/bin/env node

/**
 * CodegenRunner - Orchestrates all code generators
 * Runs complete codegen pipeline with clean up/down functions
 */

const { fileURLToPath } = require('url');
const BaseCodegen = require('./base-codegen');
const AggregateGetMethodsGenerator = require('./aggregate-get-methods-generator');
const FactoryGenerator = require('./factory-generator');
const DataClassGenerator = require('./data-class-generator');
const path = require('path');
const fs = require('fs');

// CommonJS imports
const BaseCodegenClass = BaseCodegen;
const AggregateGetMethodsGeneratorClass = AggregateGetMethodsGenerator;
const FactoryGeneratorClass = FactoryGenerator;
const DataClassGeneratorClass = DataClassGenerator;

class CodegenRunner extends BaseCodegen {
  constructor(options = {}) {
    super({
      ...options,
      outputDir: options.outputDir || './bootstrap/generated'
    });
    
    this.constantsPath = options.constantsPath || './bootstrap/aggregate/class-constants.json';
    this.bootstrapPath = options.bootstrapPath || './bootstrap';
    this.generators = [];
    this.results = {
      aggregateGetMethods: null,
      factories: null,
      dataClasses: null,
      summary: {
        totalGenerated: 0,
        totalErrors: 0,
        totalWarnings: 0,
        startTime: null,
        endTime: null,
        duration: 0
      }
    };
  }

  /**
   * Initialize the codegen runner and all generators
   * @returns {Promise<CodegenRunner>} The initialized runner
   */
  async initialize() {
    await super.initialize();
    
    this.log('Initializing codegen runner...', 'info');
    
    // Initialize all generators
    await this.initializeGenerators();
    
    return this;
  }

  /**
   * Initialize all individual generators
   * @returns {Promise<void>}
   */
  async initializeGenerators() {
    this.log('Initializing individual generators...', 'info');
    
    // Initialize aggregate get methods generator
    const aggregateGenerator = new AggregateGetMethodsGenerator({
      outputDir: path.join(this.options.outputDir, 'aggregate'),
      constantsPath: this.constantsPath,
      verbose: this.options.verbose
    });
    await aggregateGenerator.initialize();
    this.generators.push(aggregateGenerator);
    
    // Initialize factory generator
    const factoryGenerator = new FactoryGenerator({
      outputDir: path.join(this.options.outputDir, 'factories'),
      constantsPath: this.constantsPath,
      bootstrapPath: this.bootstrapPath,
      verbose: this.options.verbose
    });
    await factoryGenerator.initialize();
    this.generators.push(factoryGenerator);
    
    // Initialize data class generator
    const dataClassGenerator = new DataClassGenerator({
      outputDir: path.join(this.options.outputDir, 'data'),
      constantsPath: this.constantsPath,
      bootstrapPath: this.bootstrapPath,
      verbose: this.options.verbose
    });
    await dataClassGenerator.initialize();
    this.generators.push(dataClassGenerator);
    
    this.log(`Initialized ${this.generators.length} generators`, 'success');
  }

  /**
   * Execute the complete codegen pipeline
   * @returns {Promise<Object>} Complete generation results
   */
  async execute() {
    this.log('Executing complete codegen pipeline...', 'info');
    
    this.results.summary.startTime = new Date();
    
    try {
      // Execute all generators
      await this.executeAllGenerators();
      
      // Generate master index
      await this.generateMasterIndex();
      
      // Generate comprehensive report
      await this.generateGenerationReport();
      
      // Perform final cleanup
      await this.performFinalCleanup();
      
      this.results.summary.endTime = new Date();
      this.results.summary.duration = this.results.summary.endTime - this.results.summary.startTime;
      
      this.log('Codegen pipeline completed successfully', 'success');
      
    } catch (error) {
      this.results.summary.totalErrors++;
      this.log(`Codegen pipeline failed: ${error.message}`, 'error');
      throw error;
    }
    
    return this.results;
  }

  /**
   * Execute all generators in sequence
   * @returns {Promise<void>}
   */
  async executeAllGenerators() {
    for (const generator of this.generators) {
      this.log(`Executing ${generator.constructor.name}...`, 'info');
      
      try {
        const generatorResults = await generator.execute();
        
        // Store results
        if (generator.constructor.name === 'AggregateGetMethodsGenerator') {
          this.results.aggregateGetMethods = generatorResults;
        } else if (generator.constructor.name === 'FactoryGenerator') {
          this.results.factories = generatorResults;
        } else if (generator.constructor.name === 'DataClassGenerator') {
          this.results.dataClasses = generatorResults;
        }
        
        // Update summary
        this.results.summary.totalGenerated += generatorResults.generatedFiles?.length || 0;
        this.results.summary.totalErrors += generatorResults.errors?.length || 0;
        this.results.summary.totalWarnings += generatorResults.warnings?.length || 0;
        
        this.log(`${generator.constructor.name} completed`, 'success');
        
      } catch (error) {
        this.results.summary.totalErrors++;
        this.log(`${generator.constructor.name} failed: ${error.message}`, 'error');
        throw error;
      }
    }
  }

  /**
   * Generate master index file for all generated code
   * @returns {Promise<void>}
   */
  async generateMasterIndex() {
    this.log('Generating master index...', 'info');
    
    const indexContent = `/**
 * Master index for all auto-generated code
 * Generated by CodegenRunner
 * DO NOT EDIT MANUALLY
 */

// Aggregate get methods
try {
  module.exports.aggregateGetMethods = require('./aggregate/index.js');
} catch (error) {
  module.exports.aggregateGetMethods = {};
}

// Factories
try {
  module.exports.factories = require('./factories/index.js');
} catch (error) {
  module.exports.factories = {};
}

// Data classes
try {
  module.exports.dataClasses = require('./data/index.js');
} catch (error) {
  module.exports.dataClasses = {};
}

// Registry information
try {
  module.exports.registry = require('./factories/factory-registry.json');
} catch (error) {
  module.exports.registry = {};
}

// Validation schemas
try {
  module.exports.schemas = require('./data/validation-schemas.json');
} catch (error) {
  module.exports.schemas = {};
}

module.exports.generatedAt = '${new Date().toISOString()}';
module.exports.generatedBy = 'CodegenRunner';
`;
    
    await this.writeFile('index.js', indexContent, { addHeader: false });
  }

  /**
   * Generate comprehensive generation report
   * @returns {Promise<void>}
   */
  async generateGenerationReport() {
    this.log('Generating generation report...', 'info');
    
    const report = {
      generated: new Date().toISOString(),
      generators: this.generators.map(g => g.constructor.name),
      results: this.results,
      summary: {
        totalGenerators: this.generators.length,
        totalGeneratedFiles: this.results.summary.totalGenerated,
        totalErrors: this.results.summary.totalErrors,
        totalWarnings: this.results.summary.totalWarnings,
        success: this.results.summary.totalErrors === 0,
        duration: this.results.summary.duration
      },
      coverage: {
        aggregateGetMethods: this.calculateCoverage('aggregateGetMethods'),
        factories: this.calculateCoverage('factories'),
        dataClasses: this.calculateCoverage('dataClasses')
      },
      statistics: {
        aggregateGetMethods: this.results.aggregateGetMethods ? 
          this.results.aggregateGetMethods.generatedFiles?.length || 0 : 0,
        factories: this.results.factories ? 
          this.results.factories.generatedFiles?.length || 0 : 0,
        dataClasses: this.results.dataClasses ? 
          this.results.dataClasses.generatedFiles?.length || 0 : 0
      }
    };
    
    const reportContent = `/**
 * Complete Codegen Generation Report
 * Generated by CodegenRunner
 */

module.exports = ${JSON.stringify(report, null, 2)};
`;
    
    await this.writeFile('generation-report.json', reportContent, { addHeader: false });
    
    // Display summary to console
    this.displayGenerationSummary(report);
  }

  /**
   * Calculate coverage statistics for a generator type
   * @param {string} type - Generator type
   * @returns {Object} Coverage statistics
   */
  calculateCoverage(type) {
    const results = this.results[type];
    if (!results) return { coverage: 0, total: 0 };
    
    if (results.generatedFiles && results.scanResults) {
      const coverage = Math.round((results.generatedFiles.length / results.scanResults.totalClasses) * 100);
      return {
        coverage: coverage,
        total: results.scanResults.totalClasses,
        generated: results.generatedFiles.length
      };
    }
    
    return { coverage: 0, total: 0 };
  }

  /**
   * Display generation summary to console
   * @param {Object} report - Generation report
   * @returns {void}
   */
  displayGenerationSummary(report) {
    console.log('\n🏗️  CODEGEN GENERATION REPORT');
    console.log('================================');
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Generators: ${report.summary.totalGenerators}`);
    console.log(`   Generated Files: ${report.summary.totalGeneratedFiles}`);
    console.log(`   Errors: ${report.summary.totalErrors}`);
    console.log(`   Warnings: ${report.summary.totalWarnings}`);
    console.log(`   Success: ${report.summary.success ? '✓' : '✗'}`);
    console.log(`   Duration: ${Math.round(report.summary.duration / 1000)}s`);
    
    console.log('\n📊 COVERAGE:');
    for (const [type, stats] of Object.entries(report.coverage)) {
      const percentage = stats.coverage || 0;
      const color = percentage >= 90 ? '\x1b[32m' : 
                   percentage >= 70 ? '\x1b[33m' : 
                   '\x1b[31m';
      console.log(`   ${type}: ${percentage}% (${stats.generated}/${stats.total}) ${color}${percentage}%\x1b[0m`);
    }
    
    console.log('\n📋 STATISTICS:');
    for (const [type, count] of Object.entries(report.statistics)) {
      console.log(`   ${type}: ${count} files`);
    }
    
    if (report.summary.totalErrors > 0) {
      console.log('\n❌ ERRORS DETECTED');
      console.log('Check generation-report.json for details');
    } else if (report.summary.totalWarnings > 0) {
      console.log('\n⚠️  WARNINGS DETECTED');
      console.log('Check generation-report.json for details');
    } else {
      console.log('\n✅ GENERATION SUCCESSFUL');
      console.log('All components generated without issues');
    }
  }

  /**
   * Perform final cleanup across all generators
   * @returns {Promise<void>}
   */
  async performFinalCleanup() {
    this.log('Performing final cleanup...', 'info');
    
    for (const generator of this.generators) {
      try {
        await generator.cleanDown();
      } catch (error) {
        this.log(`Cleanup failed for ${generator.constructor.name}: ${error.message}`, 'warning');
      }
    }
    
    // Perform master cleanup
    await this.cleanDown();
  }

  /**
   * Get complete generation statistics
   * @returns {Object} Comprehensive statistics
   */
  getCompleteStats() {
    const stats = {
      summary: this.results.summary,
      generators: {},
      coverage: {},
      combined: {
        totalGeneratedFiles: 0,
        totalErrors: 0,
        totalWarnings: 0,
        overallSuccess: false
      }
    };
    
    for (const generator of this.generators) {
      const genStats = generator.getStats ? generator.getStats() : {};
      stats.generators[generator.constructor.name] = genStats;
      
      if (genStats.generatedFiles) {
        stats.combined.totalGeneratedFiles += genStats.generatedFiles;
      }
    }
    
    stats.combined.totalErrors = this.results.summary.totalErrors;
    stats.combined.totalWarnings = this.results.summary.totalWarnings;
    stats.combined.overallSuccess = stats.combined.totalErrors === 0;
    
    return stats;
  }

  /**
   * Clean up all generated files
   * @returns {Promise<void>}
   */
  async cleanUp() {
    await super.cleanUp();
    
    // Clean up all generator outputs
    for (const generator of this.generators) {
      if (generator.cleanUp) {
        try {
          await generator.cleanUp();
        } catch (error) {
          this.log(`Cleanup failed for ${generator.constructor.name}: ${error.message}`, 'warning');
        }
      }
    }
  }

  /**
   * Clean down all generators
   * @returns {Promise<void>}
   */
  async cleanDown() {
    // Register master cleanup operations
    this.registerCleanupOperation({
      type: 'deleteFile',
      path: path.join(this.options.outputDir, '.cache')
    });
    
    this.registerCleanupOperation({
      type: 'runCommand',
      command: `find ${this.options.outputDir} -name "*.backup.*" -mtime +7 -delete 2>/dev/null || true`
    });
    
    // Execute master cleanup
    await super.cleanDown();
  }

  /**
   * Validate that all generators are properly configured
   * @returns {boolean} True if valid
   */
  validateConfiguration() {
    const requiredPaths = [
      this.constantsPath,
      this.bootstrapPath,
      this.options.outputDir
    ];
    
    for (const requiredPath of requiredPaths) {
      if (!fs.existsSync(requiredPath)) {
        throw new Error(`Required path does not exist: ${requiredPath}`);
      }
    }
    
    return true;
  }
}

// CLI interface for direct execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    
    switch (flag) {
      case '--output-dir':
        options.outputDir = value;
        break;
      case '--constants-path':
        options.constantsPath = value;
        break;
      case '--bootstrap-path':
        options.bootstrapPath = value;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        console.log(`
Usage: node codegen-runner.js [options]

Options:
  --output-dir <path>     Output directory for generated files (default: ./bootstrap/generated)
  --constants-path <path>  Path to class constants JSON (default: ./bootstrap/aggregate/class-constants.json)
  --bootstrap-path <path>  Path to bootstrap directory (default: ./bootstrap)
  --verbose               Enable verbose logging
  --help                 Show this help message

Examples:
  node codegen-runner.js --verbose
  node codegen-runner.js --output-dir ./generated --constants-path ./config/constants.json
        `);
        process.exit(0);
    }
  }
  
  try {
    const runner = new CodegenRunner(options);
    await runner.initialize();
    await runner.execute();
    
    const stats = runner.getCompleteStats();
    if (stats.combined.overallSuccess) {
      console.log('\n✅ Codegen completed successfully!');
    } else {
      console.log('\n❌ Codegen completed with errors!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`\n❌ Codegen failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = CodegenRunner;
