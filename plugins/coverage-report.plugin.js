#!/usr/bin/env node

/**
 * Coverage Report Plugin
 * Consolidates interface, factory, documentation, and dependency analysis
 * into a single comprehensive analysis suite.
 * Migrated from unified-coverage-tool.js and run-coverage-analysis.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const BasePlugin = require('../lib/base-plugin');

// Import string service
const { getStringService } = require('../string/string-service');

class CoverageReportPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'coverage-report',
      description: 'Consolidates interface, factory, documentation, and dependency analysis',
      version: '1.0.0',
      author: 'RWTRA',
      category: 'analysis',
      commands: [
        {
          name: 'coverage-report',
          description: 'Run comprehensive coverage analysis on the bootstrap system'
        }
      ],
      dependencies: []
    });

    this.results = {
      interface: {},
      factory: {},
      documentation: {},
      dependency: {},
      summary: {},
      analysisTime: 0,
      recommendations: []
    };
  }

  /**
   * Main plugin execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Analysis results
   */
  async execute(context) {
    await this.initialize(context);
    const strings = getStringService();

    this.log(strings.getConsole('starting_comprehensive_coverage_analysis'), 'info');
    this.log(this.colorize('📊 Comprehensive Coverage Analysis', context.colors.cyan));
    this.log(this.colorize('='.repeat(60), context.colors.white));

    const startTime = Date.now();
    const projectRoot = context.options['project-root'] || path.join(context.bootstrapPath, '..');

    try {
      // Run individual analyses
      await this._runInterfaceAnalysis(context);
      await this._runFactoryAnalysis(context);
      await this._runDocumentationAnalysis(context, projectRoot);
      await this._runDependencyAnalysis(context);

      this.results.analysisTime = ((Date.now() - startTime) / 1000).toFixed(2);

      // Generate unified report
      this._generateUnifiedReport(context);

      // Save results if output directory specified
      if (context.options.output) {
        await this._saveResults(context);
      }

      return this.results;

    } catch (error) {
      this.log(strings.getConsole('comprehensive_coverage_analysis_failed', { error: error.message }), 'error');
      this.results.recommendations.push(`Analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Runs interface coverage analysis using existing plugin
   */
  async _runInterfaceAnalysis(context) {
    const strings = getStringService();
    this.log(strings.getConsole('running_interface_coverage_analysis'), 'info');

    try {
      // Execute interface-coverage plugin
      const interfacePlugin = require('./interface-coverage.plugin.js');
      const plugin = new interfacePlugin();
      const pluginContext = {
        ...context,
        options: { ...context.options, output: false } // Don't save individual results
      };

      this.results.interface = await plugin.execute(pluginContext);
      this.log(strings.getConsole('interface_analysis_completed'), 'info');

    } catch (error) {
      this.log(strings.getConsole('interface_analysis_failed', { error: error.message }), 'warn');
      this.results.interface = {
        totalClasses: 0,
        compliantClasses: 0,
        coverage: 0,
        error: error.message
      };
    }
  }

  /**
   * Runs factory coverage analysis using existing plugin
   */
  async _runFactoryAnalysis(context) {
    this.log('Running Factory Coverage Analysis...', 'info');
    
    try {
      // Execute factory-coverage plugin
      const factoryPlugin = require('./factory-coverage.plugin.js');
      const plugin = new factoryPlugin();
      const pluginContext = {
        ...context,
        options: { ...context.options, output: false }
      };
      
      this.results.factory = await plugin.execute(pluginContext);
      this.log('Factory analysis completed', 'info');
      
    } catch (error) {
      this.log(`Factory analysis failed: ${error.message}`, 'warn');
      this.results.factory = {
        totalFactories: 0,
        compliantFactories: 0,
        coverage: 0,
        error: error.message
      };
    }
  }

  /**
   * Runs documentation coverage analysis using existing plugin
   */
  async _runDocumentationAnalysis(context, projectRoot) {
    this.log('Running Documentation Coverage Analysis...', 'info');
    
    try {
      // Execute doc-coverage plugin
      const docPlugin = require('./doc-coverage.plugin.js');
      const plugin = new docPlugin();
      const pluginContext = {
        ...context,
        options: { 
          ...context.options, 
          output: false,
          'project-root': projectRoot
        }
      };
      
      this.results.documentation = await plugin.execute(pluginContext);
      this.log('Documentation analysis completed', 'info');
      
    } catch (error) {
      this.log(`Documentation analysis failed: ${error.message}`, 'warn');
      this.results.documentation = {
        coverage: '0%',
        modules: { documented: 0, total: 0 },
        globals: { documented: 0, total: 0 },
        functions: { documented: 0, total: 0 },
        error: error.message
      };
    }
  }

  /**
   * Runs dependency analysis using existing plugin
   */
  async _runDependencyAnalysis(context) {
    this.log('Running Dependency Analysis...', 'info');
    
    try {
      // Execute dependency-analyzer plugin
      const depPlugin = require('./dependency-analyzer.plugin.js');
      const plugin = new depPlugin();
      const pluginContext = {
        ...context,
        options: { ...context.options, output: false }
      };
      
      this.results.dependency = await plugin.execute(pluginContext);
      this.log('Dependency analysis completed', 'info');
      
    } catch (error) {
      this.log(`Dependency analysis failed: ${error.message}`, 'warn');
      this.results.dependency = {
        totalFiles: 0,
        totalModules: 0,
        circularDependencies: [],
        missingDependencies: [],
        brokenLinks: [],
        orphanedModules: [],
        error: error.message
      };
    }
  }

  /**
   * Calculates overall health score across all analysis areas
   */
  _calculateHealthScore() {
    const interfaceScore = this.results.interface.coverage ? 
      parseFloat(this.results.interface.coverage) / 100 : 0;
    const factoryScore = this.results.factory.coverage ? 
      parseFloat(this.results.factory.coverage) / 100 : 0;
    const docScore = this.results.documentation.coverage ? 
      parseFloat(this.results.documentation.coverage) / 100 : 0;
    
    // Dependency score: penalize heavily if issues exist
    let depScore = 1; // Start with perfect score
    if (this.results.dependency.circularDependencies?.length > 0) depScore -= 0.3;
    if (this.results.dependency.missingDependencies?.length > 0) depScore -= 0.2;
    if (this.results.dependency.brokenLinks?.length > 0) depScore -= 0.2;
    if (this.results.dependency.orphanedModules?.length > 0) depScore -= 0.1;
    
    const overallScore = (interfaceScore + factoryScore + docScore + depScore) / 4;
    
    // Count critical issues
    const criticalIssues = (this.results.interface.missingImplementations?.length || 0) + 
                          (this.results.factory.compliantFactories === 0 ? 1 : 0);
    
    return {
      overall: Math.round(overallScore * 100),
      interface: Math.round(interfaceScore * 100),
      factory: Math.round(factoryScore * 100),
      documentation: Math.round(docScore * 100),
      dependency: Math.round(depScore * 100),
      critical: criticalIssues
    };
  }

  /**
   * Generates and displays the comprehensive unified report
   */
  _generateUnifiedReport(context) {
    const strings = getStringService();
    console.log(context.colors.reset + strings.getConsole('comprehensive_coverage_analysis_report'));
    console.log(strings.getConsole('report_separator'));

    // Calculate health scores
    const healthScore = this._calculateHealthScore();
    this.results.summary = healthScore;

    // Component scores
    console.log(strings.getConsole('component_scores'));
    console.log(strings.getConsole('overall_score', { score: healthScore.overall }));
    console.log(strings.getConsole('interface_score', { score: healthScore.interface }));
    console.log(strings.getConsole('factory_score', { score: healthScore.factory }));
    console.log(strings.getConsole('documentation_score', { score: healthScore.documentation }));
    console.log(strings.getConsole('dependency_score', { score: healthScore.dependency }));

    // Overall health assessment
    this._printOverallHealth(healthScore, context);

    // Detailed analysis results
    this._printInterfaceDetails(context);
    this._printFactoryDetails(context);
    this._printDocumentationDetails(context);
    this._printDependencyDetails(context);

    // Generate recommendations
    this._generateRecommendations(context, healthScore);
  }

  /**
   * Prints overall health assessment
   */
  _printOverallHealth(score, context) {
    const strings = getStringService();
    console.log(strings.getConsole('overall_system_health'));
    console.log(strings.getConsole('report_separator'));

    const healthColor = score.overall >= 80 ? context.colors.green :
                     score.overall >= 60 ? context.colors.yellow :
                     score.overall >= 40 ? context.colors.magenta : context.colors.red;

    console.log(strings.getConsole('overall_score', { score: score.overall }));

    if (score.critical > 0) {
      console.log(context.colors.red + strings.getConsole('critical_issues_detected') + context.colors.reset);
    } else if (score.overall >= 80) {
      console.log(context.colors.green + strings.getConsole('excellent_system') + context.colors.reset);
    } else if (score.overall >= 60) {
      console.log(context.colors.yellow + strings.getConsole('needs_improvement') + context.colors.reset);
    } else {
      console.log(context.colors.red + strings.getConsole('poor_system') + context.colors.reset);
    }
  }

  /**
   * Prints interface analysis details
   */
  _printInterfaceDetails(context) {
    const strings = getStringService();
    console.log(strings.getConsole('interface_compliance'));
    if (this.results.interface.error) {
      console.log(context.colors.red + strings.getConsole('analysis_failed', { error: this.results.interface.error }) + context.colors.reset);
    } else {
      console.log(strings.getConsole('coverage', { coverage: this.results.interface.coverage || 0 }));
      console.log(strings.getConsole('compliant', {
        compliant: this.results.interface.compliantClasses || 0,
        total: this.results.interface.totalClasses || 0
      }));
      console.log(strings.getConsole('issues', { count: this.results.interface.missingImplementations?.length || 0 }));
    }
  }

  /**
   * Prints factory analysis details
   */
  _printFactoryDetails(context) {
    const strings = getStringService();
    console.log(strings.getConsole('factory_compliance'));
    if (this.results.factory.error) {
      console.log(context.colors.red + strings.getConsole('analysis_failed', { error: this.results.factory.error }) + context.colors.reset);
    } else {
      console.log(strings.getConsole('coverage', { coverage: this.results.factory.coverage || 0 }));
      console.log(strings.getConsole('compliant', {
        compliant: this.results.factory.compliantFactories || 0,
        total: this.results.factory.totalFactories || 0
      }));
      console.log(strings.getConsole('base_interface', { status: this.results.factory.missingBaseFactory ? 'Missing' : 'Available' }));
    }
  }

  /**
   * Prints documentation analysis details
   */
  _printDocumentationDetails(context) {
    const strings = getStringService();
    console.log(strings.getConsole('documentation_coverage'));
    if (this.results.documentation.error) {
      console.log(context.colors.red + strings.getConsole('analysis_failed', { error: this.results.documentation.error }) + context.colors.reset);
    } else {
      console.log(strings.getConsole('overall_coverage', { coverage: this.results.documentation.coverage || 0 }));
      console.log(strings.getConsole('analysis_mode', { mode: this.results.documentation.fallbackUsed ? 'Fallback' : 'Python' }));
      if (this.results.documentation.modules) {
        console.log(strings.getConsole('modules_coverage', {
          documented: this.results.documentation.modules.documented || 0,
          total: this.results.documentation.modules.total || 0
        }));
        console.log(strings.getConsole('globals_coverage', {
          documented: this.results.documentation.globals.documented || 0,
          total: this.results.documentation.globals.total || 0
        }));
        console.log(strings.getConsole('functions_coverage', {
          documented: this.results.documentation.functions.documented || 0,
          total: this.results.documentation.functions.total || 0
        }));
      }
    }
  }

  /**
   * Prints dependency analysis details
   */
  _printDependencyDetails(context) {
    const strings = getStringService();
    console.log(strings.getConsole('dependency_analysis'));
    if (this.results.dependency.error) {
      console.log(context.colors.red + strings.getConsole('analysis_failed', { error: this.results.dependency.error }) + context.colors.reset);
    } else {
      console.log(strings.getConsole('files_analyzed', { count: this.results.dependency.totalFiles || 0 }));
      console.log(strings.getConsole('modules_analyzed', { count: this.results.dependency.totalModules || 0 }));
      console.log(strings.getConsole('circular_dependencies', { count: this.results.dependency.circularDependencies?.length || 0 }));
      console.log(strings.getConsole('missing_dependencies', { count: this.results.dependency.missingDependencies?.length || 0 }));
      console.log(strings.getConsole('broken_links', { count: this.results.dependency.brokenLinks?.length || 0 }));
      console.log(strings.getConsole('orphaned_modules', { count: this.results.dependency.orphanedModules?.length || 0 }));
    }
  }

  /**
   * Generates comprehensive recommendations
   */
  _generateRecommendations(context, healthScore) {
    const strings = getStringService();
    console.log(strings.getConsole('comprehensive_recommendations'));

    // Priority-based recommendations
    if (healthScore.overall < 40) {
      console.log(context.colors.red + strings.getConsole('urgent_restructuring') + context.colors.reset);
      console.log(context.colors.red + strings.getConsole('create_missing_skeleton_classes') + context.colors.reset);
      console.log(context.colors.red + strings.getConsole('implement_base_factory') + context.colors.reset);
      console.log(context.colors.red + strings.getConsole('add_jsdoc_comments') + context.colors.reset);
      console.log(context.colors.red + strings.getConsole('resolve_circular_dependencies') + context.colors.reset);
    } else if (healthScore.overall < 60) {
      console.log(context.colors.yellow + strings.getConsole('high_priority_improvements') + context.colors.reset);
      console.log(context.colors.yellow + '   - Focus on interface compliance' + context.colors.reset);
      console.log(context.colors.yellow + '   - Standardize factory patterns' + context.colors.reset);
      console.log(context.colors.yellow + '   - Boost documentation coverage' + context.colors.reset);
    } else if (healthScore.overall < 80) {
      console.log(context.colors.cyan + strings.getConsole('medium_priority_polish') + context.colors.reset);
      console.log(context.colors.cyan + '   - Address remaining compliance gaps' + context.colors.reset);
      console.log(context.colors.cyan + '   - Complete documentation for edge cases' + context.colors.reset);
      console.log(context.colors.cyan + '   - Optimize dependency structure' + context.colors.reset);
    } else {
      console.log(context.colors.green + strings.getConsole('maintenance_good_practices') + context.colors.reset);
      console.log(context.colors.green + '   - Maintain current compliance levels' + context.colors.reset);
      console.log(context.colors.green + '   - Keep documentation up to date' + context.colors.reset);
      console.log(context.colors.green + '   - Monitor dependency health' + context.colors.reset);
    }

    // Specific actionable recommendations
    if (healthScore.interface < 70) {
      console.log(context.colors.cyan + strings.getConsole('create_missing_skeleton_classes') + context.colors.reset);
    }

    if (healthScore.factory < 70) {
      console.log(context.colors.cyan + strings.getConsole('implement_base_factory') + context.colors.reset);
    }

    if (healthScore.documentation < 70) {
      console.log(context.colors.cyan + strings.getConsole('add_jsdoc_comments') + context.colors.reset);
    }

    if (healthScore.dependency < 70) {
      console.log(context.colors.cyan + strings.getConsole('resolve_circular_dependencies') + context.colors.reset);
    }

    // Analysis time and performance
    console.log(context.colors.magenta + strings.getConsole('analysis_completed_in', { time: this.results.analysisTime }) + context.colors.reset);

    // Next steps
    const totalIssues = (this.results.interface.missingImplementations?.length || 0) +
                      (this.results.factory.totalFactories - this.results.factory.compliantFactories) +
                      (this.results.dependency.circularDependencies?.length || 0) +
                      (this.results.dependency.missingDependencies?.length || 0);

    if (totalIssues > 0) {
      console.log(context.colors.yellow + strings.getConsole('total_issues_identified', { count: totalIssues }) + context.colors.reset);
    }
  }

  /**
   * Saves comprehensive analysis results to file
   */
  async _saveResults(context) {
    const outputDir = context.options['output-dir'] || path.join(context.bootstrapPath, 'reports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(outputDir, `comprehensive-coverage-${timestamp}.json`);
    
    const reportData = {
      timestamp,
      analysisTime: this.results.analysisTime,
      summary: this.results.summary,
      components: {
        interface: this.results.interface,
        factory: this.results.factory,
        documentation: this.results.documentation,
        dependency: this.results.dependency
      },
      recommendations: this.results.recommendations
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
    this.log(`Comprehensive results saved to: ${resultsPath}`, 'info');
  }
}

module.exports = CoverageReportPlugin;
