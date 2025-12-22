/**
 * Report Generator Module
 * Generates comprehensive dependency analysis reports
 */

const fs = require('fs');
const path = require('path');

const ReportGenerator = {
  /**
   * Generates and displays the analysis report
   * @param {Object} results - Analysis results
   * @param {Object} context - Execution context
   */
  async generate(results, context) {
    console.log(context.colors.reset + '\n🔗 DEPENDENCY ANALYSIS REPORT');
    console.log('================================');
    
    this.generateSummary(results, context);
    this.generateDetailedIssues(results, context);
    this.generateRecommendations(results, context);
    this.generateOverallAssessment(results, context);
  },

  /**
   * Generates summary section
   * @param {Object} results - Analysis results
   * @param {Object} context - Execution context
   */
  generateSummary(results, context) {
    console.log('\n📈 SUMMARY:');
    console.log(`   Total Files Analyzed: ${results.totalFiles}`);
    console.log(`   Total Modules: ${results.dependencyGraph.size}`);
    console.log(`   Circular Dependencies: ${results.circularDependencies.length}`);
    console.log(`   Missing Dependencies: ${results.missingDependencies.length}`);
    console.log(`   Broken Links: ${results.brokenLinks.length}`);
    console.log(`   Orphaned Modules: ${results.orphanedModules.length}`);
  },

  /**
   * Generates detailed issues section
   * @param {Object} results - Analysis results
   * @param {Object} context - Execution context
   */
  generateDetailedIssues(results, context) {
    // Circular dependencies
    if (results.circularDependencies.length > 0) {
      console.log('\n🔄 CIRCULAR DEPENDENCIES:');
      for (const issue of results.circularDependencies.slice(0, 10)) {
        console.log(context.colors.red + `   ${issue.cycle}` + context.colors.reset);
      }
      if (results.circularDependencies.length > 10) {
        console.log(`   ... and ${results.circularDependencies.length - 10} more`);
      }
    }
    
    // Missing dependencies
    if (results.missingDependencies.length > 0) {
      console.log('\n❌ MISSING DEPENDENCIES:');
      for (const issue of results.missingDependencies.slice(0, 10)) {
        console.log(context.colors.red + 
          `   ${issue.requiredIn} requires ${issue.requiredFrom} (${issue.importPath})` + 
          context.colors.reset
        );
      }
      if (results.missingDependencies.length > 10) {
        console.log(`   ... and ${results.missingDependencies.length - 10} more`);
      }
    }
    
    // Broken links
    if (results.brokenLinks.length > 0) {
      console.log('\n🔗 BROKEN LINKS:');
      for (const issue of results.brokenLinks.slice(0, 10)) {
        console.log(context.colors.magenta + 
          `   ${issue.from} → ${issue.to} (${issue.type})` + 
          context.colors.reset
        );
        if (issue.resolvedPath) {
          console.log(context.colors.yellow + `     Expected at: ${issue.resolvedPath}` + context.colors.reset);
        }
      }
      if (results.brokenLinks.length > 10) {
        console.log(`   ... and ${results.brokenLinks.length - 10} more`);
      }
    }
    
    // Orphaned modules
    if (results.orphanedModules.length > 0) {
      console.log('\n👻 ORPHANED MODULES:');
      for (const issue of results.orphanedModules.slice(0, 10)) {
        console.log(context.colors.yellow + 
          `   ${issue.module} (${issue.file}) - ${issue.exports} exports` + 
          context.colors.reset
        );
      }
      if (results.orphanedModules.length > 10) {
        console.log(`   ... and ${results.orphanedModules.length - 10} more`);
      }
    }
  },

  /**
   * Generates recommendations section
   * @param {Object} results - Analysis results
   * @param {Object} context - Execution context
   */
  generateRecommendations(results, context) {
    console.log('\n🎯 RECOMMENDATIONS:');
    
    const recommendations = [...results.recommendations];
    
    // Add contextual recommendations
    if (results.circularDependencies.length > 0) {
      recommendations.push('Resolve circular dependencies by refactoring to use dependency injection');
    }
    
    if (results.missingDependencies.length > 0) {
      recommendations.push('Ensure all required modules are available or provide alternatives');
    }
    
    if (results.brokenLinks.length > 0) {
      recommendations.push('Fix broken import paths and ensure all modules are properly structured');
    }
    
    if (results.orphanedModules.length > 0) {
      recommendations.push('Remove unused exports or add proper imports for orphaned modules');
    }
    
    // Add general recommendations
    recommendations.push('Implement proper package.json management to detect version conflicts');
    recommendations.push('Use dependency injection pattern to reduce circular dependencies');
    
    for (const recommendation of recommendations.slice(0, 10)) {
      console.log(context.colors.cyan + `   - ${recommendation}` + context.colors.reset);
    }
    
    if (recommendations.length > 10) {
      console.log(`   ... and ${recommendations.length - 10} more recommendations`);
    }
  },

  /**
   * Generates overall assessment
   * @param {Object} results - Analysis results
   * @param {Object} context - Execution context
   */
  generateOverallAssessment(results, context) {
    const totalIssues = results.circularDependencies.length + 
                     results.missingDependencies.length + 
                     results.brokenLinks.length + 
                     results.orphanedModules.length;
    
    console.log('\n🏥 OVERALL ASSESSMENT:');
    
    if (totalIssues === 0) {
      console.log(context.colors.green + '   ✅ DEPENDENCY HEALTH: EXCELLENT' + context.colors.reset);
    } else if (totalIssues <= 5) {
      console.log(context.colors.green + 
        `   ✅ DEPENDENCY HEALTH: GOOD (${totalIssues} issues)` + 
        context.colors.reset
      );
    } else if (totalIssues <= 15) {
      console.log(context.colors.yellow + 
        `   ⚠️  DEPENDENCY HEALTH: FAIR (${totalIssues} issues)` + 
        context.colors.reset
      );
    } else {
      console.log(context.colors.red + 
        `   ❌ DEPENDENCY HEALTH: POOR (${totalIssues} issues)` + 
        context.colors.reset
      );
    }
    
    // Health score calculation
    const maxPossibleIssues = results.totalFiles * 2; // Estimate max issues
    const healthScore = Math.max(0, 100 - (totalIssues / maxPossibleIssues * 100));
    console.log(`   Health Score: ${healthScore.toFixed(1)}%`);
  },

  /**
   * Saves analysis results to file
   * @param {Object} results - Analysis results
   * @param {Object} context - Execution context
   */
  async saveResults(results, context) {
    const outputDir = context.options['output-dir'] || 
                    path.join(context.projectPath, 'reports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(outputDir, `dependency-analysis-${timestamp}.json`);
    
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: results.totalFiles,
        totalModules: results.dependencyGraph.size,
        circularDependencies: results.circularDependencies.length,
        missingDependencies: results.missingDependencies.length,
        brokenLinks: results.brokenLinks.length,
        orphanedModules: results.orphanedModules.length,
        healthScore: this.calculateHealthScore(results)
      },
      issues: {
        circularDependencies: results.circularDependencies,
        missingDependencies: results.missingDependencies,
        brokenLinks: results.brokenLinks,
        orphanedModules: results.orphanedModules
      },
      recommendations: results.recommendations,
      dependencyGraph: this.serializeGraph(results.dependencyGraph)
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
    console.log(`\n📁 Results saved to: ${resultsPath}`);
  },

  /**
   * Calculates health score
   * @param {Object} results - Analysis results
   * @returns {number} - Health score (0-100)
   */
  calculateHealthScore(results) {
    const totalIssues = results.circularDependencies.length + 
                     results.missingDependencies.length + 
                     results.brokenLinks.length + 
                     results.orphanedModules.length;
    
    const maxPossibleIssues = Math.max(results.totalFiles * 2, 1);
    return Math.max(0, 100 - (totalIssues / maxPossibleIssues * 100));
  },

  /**
   * Serializes dependency graph for JSON output
   * @param {Map} dependencyGraph - Dependency graph
   * @returns {Object} - Serialized graph
   */
  serializeGraph(dependencyGraph) {
    const serialized = {};
    for (const [module, node] of dependencyGraph) {
      serialized[module] = {
        type: node.type,
        imports: node.imports,
        exportedBy: node.exportedBy,
        importedBy: node.importedBy
      };
    }
    return serialized;
  }
};

module.exports = ReportGenerator;
