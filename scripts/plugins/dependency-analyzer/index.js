/**
 * Dependency Analyzer Plugin - Main Entry Point
 * Analyzes dependency relationships and detects issues
 */

const BasePlugin = require('../../lib/base-plugin');
const path = require('path');

class DependencyAnalyzerPlugin extends BasePlugin {
  constructor(metadata) {
    super(metadata);
    
    this.results = {
      totalFiles: 0,
      circularDependencies: [],
      missingDependencies: [],
      brokenLinks: [],
      orphanedModules: [],
      versionConflicts: [],
      recommendations: [],
      dependencyGraph: new Map(),
      processedFiles: new Set()
    };
  }

  /**
   * Main plugin execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Analysis results
   */
  async execute(context) {
    await this.initialize(context);
    
    this.log('Starting dependency analysis...', 'info');
    this.log(this.colorize('\n🔗 Revolutionary Way To Serve Up React Apps', context.colors.cyan));
    this.log(this.colorize('📊 Dependency Analysis Tool', context.colors.blue));
    this.log(this.colorize('='.repeat(50), context.colors.white));
    
    const bootstrapPath = context.options['bootstrap-path'] || 
                       path.join(context.projectPath, 'bootstrap');
    
    // Use modules to perform analysis
    await this.executeModule('file-scanner', 'scanAllFiles', bootstrapPath, this.results);
    await this.executeModule('graph-builder', 'buildGraph', this.results);
    await this.executeModule('circular-detector', 'detect', this.results);
    await this.executeModule('missing-dependency-detector', 'detect', this.results);
    await this.executeModule('broken-link-detector', 'detect', this.results);
    await this.executeModule('orphaned-module-detector', 'detect', this.results);
    await this.executeModule('version-conflict-detector', 'detect', this.results);
    
    // Generate report
    await this.executeModule('report-generator', 'generate', this.results, context);
    
    // Save results if output directory specified
    if (context.options.output) {
      await this.executeModule('report-generator', 'saveResults', this.results, context);
    }
    
    return this.results;
  }
}

module.exports = DependencyAnalyzerPlugin;
