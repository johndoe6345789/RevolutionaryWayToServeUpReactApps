#!/usr/bin/env node

/**
 * Unified Coverage Tool
 * Combines interface, factory, documentation, and dependency analysis
 * into a single comprehensive analysis suite for the React bootstrap system.
 */

const fs = require('fs');
const path = require('path');

// Import unified tool components
const UnifiedCoverageAnalyzer = require('./unified-coverage-analyzer.js');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

class UnifiedCoverageTool {
  constructor() {
    this.bootstrapPath = path.join(__dirname, '..', 'bootstrap');
    this.results = {
      interface: {},
      factory: {},
      documentation: {},
      dependency: {},
      summary: {},
      recommendations: []
    };
  }

  /**
   * Runs comprehensive unified analysis across all coverage areas.
   */
  async analyze(options = {}) {
    console.log(colorize('\n🔗 Revolutionary Way To Serve Up React Apps', colors.cyan));
    console.log(colorize('🛡️ Unified Coverage Analysis Tool', colors.blue));
    console.log(colorize('=' .repeat(60), colors.white));
    
    const startTime = Date.now();
    
    try {
      // Run unified analysis using the dedicated analyzer
      console.log(colorize('\n📋 Running Unified Analysis...', colors.magenta));
      const analyzer = new UnifiedCoverageAnalyzer();
      this.results = await analyzer.analyze(options);
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(colorize(`\n⏱️ Analysis completed in ${duration}s`, colors.green));
      
      // Determine overall health
      const healthScore = this.results.summary?.overall || 0;
      
      if (this.results.summary?.critical > 0) {
        console.log(colorize('\n⚠️  CRITICAL ISSUES DETECTED - Immediate action required', colors.red));
        process.exit(1);
      }
      
      return this.results;
      
    } catch (error) {
      console.error(colorize('❌ Unified analysis failed:', colors.red), error.message);
      process.exit(1);
    }
  }

  /**
   * Generates comprehensive unified report
   */
  _generateUnifiedReport() {
    console.log(colorize('\n📊 UNIFIED COVERAGE ANALYSIS REPORT', colors.cyan));
    console.log(colorize('='.repeat(60), colors.white));
    
    if (!this.results.summary) {
      console.log(colorize('\n⚠️  No analysis results available', colors.yellow));
      return;
    }
    
    // Print component scores
    console.log(colorize('\n📊 COMPONENT SCORES:', colors.white));
    console.log(colorize(`   Overall Score: ${this.results.summary.overall || 0}/100`, this._getScoreColor(this.results.summary.overall)));
    console.log(colorize(`   Interface: ${this.results.summary.interface || 0}/100`, this._getScoreColor(this.results.summary.interface)));
    console.log(colorize(`   Factory: ${this.results.summary.factory || 0}/100`, this._getScoreColor(this.results.summary.factory)));
    console.log(colorize(`   Documentation: ${this.results.summary.documentation || 0}/100`, this._getScoreColor(this.results.summary.documentation)));
    console.log(colorize(`   Dependencies: ${this.results.summary.dependency || 0}/100`, this._getScoreColor(this.results.summary.dependency)));
    
    // Print critical issues
    if (this.results.summary?.critical > 0) {
      console.log(colorize('\n⚠️  CRITICAL ISSUES DETECTED', colors.red));
      
      // Print first 5 issues
      const allIssues = [
        ...(this.results.interface?.missing || []),
        ...(this.results.factory?.compliance || []),
        ...(this.results.documentation?.missing || []),
        ...(this.results.dependency?.issues || [])
      ];
      
      for (let i = 0; i < Math.min(5, allIssues.length); i++) {
        const issue = allIssues[i];
        console.log(colorize(`   - ${issue.description || issue.type || 'Unknown issue'}`, colors.red));
      }
      
      if (allIssues.length > 5) {
        console.log(colorize(`     ... and ${allIssues.length - 5} more critical issues`, colors.red));
      }
    }
    
    // Print recommendations
    if (this.results.summary?.recommendations?.length > 0) {
      console.log(colorize('\n🎯 RECOMMENDATIONS:', colors.cyan));
      
      const uniqueRecs = [...new Set(this.results.summary.recommendations)];
      for (const rec of uniqueRecs) {
        console.log(colorize(`   - ${rec}`, colors.white));
      }
    }
    
    // Save results to file
    this._saveResults();
  }

  /**
   * Gets color based on score
   */
  _getScoreColor(score) {
    if (score >= 90) return colors.green;
    if (score >= 70) return colors.yellow;
    return colors.red;
  }

  /**
   * Saves analysis results to JSON file
   */
  _saveResults() {
    const resultsPath = path.join(__dirname, '..', 'coverage-results.json');
    const timestamp = new Date().toISOString().replace(/[:.]/, '-');
    
    const reportData = {
      timestamp,
      summary: this.results.summary,
      analysis: {
        interface: this.results.interface,
        factory: this.results.factory,
        documentation: this.results.documentation,
        dependency: this.results.dependency
      }
    };
    
    try {
      fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
      console.log(colorize(`\n💾 Results saved to: ${resultsPath}`, colors.green));
    } catch (error) {
      console.warn(colorize(`⚠️  Failed to save results: ${error.message}`, colors.yellow));
    }
  }
}

// CLI execution
if (require.main === module) {
  const tool = new UnifiedCoverageTool();
  
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    options[key] = value;
  }
  
  tool.analyze(options).then(results => {
    console.log(colorize('\n🎉 Unified Coverage Analysis Complete!', colors.green));
  }).catch(error => {
    console.error(colorize('❌ Analysis failed:', colors.red), error.message);
    process.exit(1);
  });
}

module.exports = UnifiedCoverageTool;

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

class UnifiedCoverageTool {
  constructor() {
    this.bootstrapPath = path.join(__dirname, '..', 'bootstrap');
    this.results = {
      interface: {},
      factory: {},
      documentation: {},
      dependency: {},
      summary: {},
      recommendations: []
    };
  }

  /**
   * Runs comprehensive unified analysis across all coverage areas.
   */
  async analyze(options = {}) {
    console.log(colorize('\n🔗 Revolutionary Way To Serve Up React Apps', colors.cyan));
    console.log(colorize('🛡️ Unified Coverage Analysis Tool', colors.blue));
    console.log(colorize('=' .repeat(60), colors.white));
    
    const startTime = Date.now();
    
    try {
      // Run individual analyses
      console.log(colorize('\n📋 Running Interface Coverage Analysis...', colors.magenta));
      this.results.interface = await new InterfaceCoverageTool().analyze();
      
      console.log(colorize('\n🏭 Running Factory Coverage Analysis...', colors.magenta));
      this.results.factory = await new FactoryCoverageTool().analyze();
      
      console.log(colorize('\n📚 Running Documentation Coverage Analysis...', colors.magenta));
      this.results.documentation = await this._runDocumentationAnalysis();
      
      console.log(colorize('\n🔗 Running Dependency Analysis...', colors.magenta));
      this.results.dependency = await this._runDependencyAnalysis();
      
      // Generate unified report
      this._generateUnifiedReport();
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(colorize(`\n⏱️ Analysis completed in ${duration}s`, colors.green));
      
      // Determine overall health
      const healthScore = this._calculateHealthScore();
      this._printOverallHealth(healthScore);
      
      // Return early if critical issues found
      if (healthScore.critical > 0) {
        console.log(colorize('\n⚠️  CRITICAL ISSUES DETECTED - Immediate action required', colors.red));
        process.exit(1);
      }
      
      return this.results;
      
    } catch (error) {
      console.error(colorize('❌ Unified analysis failed:', colors.red), error.message);
      process.exit(1);
    }
  }

  /**
   * Runs documentation coverage analysis
   */
  async _runDocumentationAnalysis() {
    const { execSync } = require('child_process');
    
    try {
      const result = execSync('python3 scripts/doc_coverage.py --code-root . --doc-root docs', {
        encoding: 'utf8',
        cwd: path.join(__dirname, '..')
      });
      
      // Parse the Python output
      const lines = result.stdout.split('\n');
      const coverageMatch = lines.find(line => line.includes('Overall:'));
      
      if (coverageMatch) {
        const overallLine = coverageMatch;
        const coveragePercent = overallLine.match(/(\d+\.\d+)%/);
        
        return {
          coverage: coveragePercent ? coveragePercent[1] : '0%',
          modules: this._extractModuleCount(lines, 'Modules:'),
          globals: this._extractModuleCount(lines, 'Globals:'),
          functions: this._extractModuleCount(lines, 'Functions / Classes:'),
          missing: this._extractMissingItems(lines),
          overall: overallLine
        };
      }
      
      return { coverage: '0%', modules: 0, globals: 0, functions: 0 };
    } catch (error) {
      console.warn(colorize('⚠️  Documentation analysis failed, using fallback values:', colors.yellow));
      return { coverage: '0%', modules: 0, globals: 0, functions: 0 };
    }
  }

  /**
   * Runs dependency analysis with error handling
   */
  async _runDependencyAnalysis() {
    try {
      return await new DependencyAnalyzer().analyze();
    } catch (error) {
      console.warn(colorize('⚠️  Dependency analysis failed, using fallback values:', colors.yellow));
      return {
        totalFiles: 0,
        totalModules: 0,
        circularDependencies: [],
        missingDependencies: [],
        brokenLinks: [],
        orphanedModules: [],
        recommendations: ['Dependency analysis failed - please check dependency-analyzer.js']
      };
    }
  }

  /**
   * Extracts module counts from documentation analysis output
   */
  _extractModuleCount(lines, prefix) {
    const line = lines.find(l => l.includes(prefix));
    if (line) {
      const match = line.match(/(\d+)\/(\d+)/);
      return match ? { documented: parseInt(match[1]), total: parseInt(match[2]) } : { documented: 0, total: 0 };
    }
    return { documented: 0, total: 0 };
  }

  /**
   * Extracts missing items from documentation analysis
   */
  _extractMissingItems(lines) {
    const missingSection = lines.findIndex(l => l.includes('Missing module docs:'));
    if (missingSection !== -1) {
      const missingItems = [];
      for (let i = missingSection + 1; i < lines.length && !lines[i].includes('Missing documented globals:'); i++) {
        if (lines[i].startsWith('  -')) {
          missingItems.push(lines[i].substring(6).trim());
        }
      }
      return missingItems;
    }
    return [];
  }

  /**
   * Calculates overall health score across all analysis areas
   */
  _calculateHealthScore() {
    const interfaceScore = this.results.interface.coverage ? (this.results.interface.coverage / 100) : 0;
    const factoryScore = this.results.factory.coverage ? (this.results.factory.coverage / 100) : 0;
    const docScore = this.results.documentation.coverage ? (this.results.documentation.coverage / 100) : 0;
    const depScore = this.results.dependency.totalFiles > 0 ? 0.8 : 1; // Penalize if dependency analysis failed
    
    const overallScore = (interfaceScore + factoryScore + docScore + depScore) / 4;
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
   * Prints overall health assessment
   */
  _printOverallHealth(score) {
    console.log(colorize('\n🏥 OVERALL SYSTEM HEALTH', colors.cyan));
    console.log(colorize('='.repeat(40), colors.white));
    
    const healthColor = score.overall >= 80 ? colors.green : 
                     score.overall >= 60 ? colors.yellow : 
                     score.overall >= 40 ? colors.magenta : colors.red;
    
    console.log(colorize(`   Overall Score: ${score.overall}/100`, healthColor));
    
    if (score.critical > 0) {
      console.log(colorize('   🚨 CRITICAL ISSUES DETECTED', colors.red));
    } else if (score.overall >= 80) {
      console.log(colorize('   ✅ EXCELLENT - System is well-structured', colors.green));
    } else if (score.overall >= 60) {
      console.log(colorize('   ⚠️  NEEDS IMPROVEMENT - Some issues found', colors.yellow));
    } else {
      console.log(colorize('   ❌ POOR - Major restructuring needed', colors.red));
    }
    
    console.log(colorize('\n📊 Component Scores:', colors.white));
    console.log(colorize(`   Interface Compliance: ${score.interface}/100`, this._getScoreColor(score.interface)));
    console.log(colorize(`   Factory Patterns: ${score.factory}/100`, this._getScoreColor(score.factory)));
    console.log(colorize(`   Documentation: ${score.documentation}/100`, this._getScoreColor(score.documentation)));
    console.log(colorize(`   Dependencies: ${score.dependency}/100`, this._getScoreColor(score.dependency)));
  }

  /**
   * Gets color based on score
   */
  _getScoreColor(score) {
    return score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red;
  }

  /**
   * Generates comprehensive unified report
   */
  _generateUnifiedReport() {
    console.log(colorize('\n📊 UNIFIED COVERAGE ANALYSIS REPORT', colors.cyan));
    console.log(colorize('='.repeat(60), colors.white));
    
    // Interface Analysis Summary
    console.log(colorize('\n🔗 INTERFACE COMPLIANCE:', colors.blue));
    console.log(colorize(`   Coverage: ${this.results.interface.coverage || 0}%`));
    console.log(colorize(`   Compliant: ${this.results.interface.compliantClasses || 0}/${this.results.interface.totalClasses || 0}`));
    console.log(colorize(`   Issues: ${this.results.interface.missingImplementations?.length || 0}`));
    
    if (this.results.interface.missingImplementations?.length > 0) {
      console.log(colorize('\n   Critical Issues:', colors.red));
      for (const issue of this.results.interface.missingImplementations.slice(0, 5)) {
        console.log(colorize(`     ${issue.class} (${issue.file})`, colors.red));
      for (const problem of issue.issues) {
        console.log(colorize(`       - ${problem}`, colors.red));
      }
      if (this.results.interface.missingImplementations.length > 5) {
        console.log(colorize(`     ... and ${this.results.interface.missingImplementations.length - 5} more`, colors.red));
      }
    }
    
    // Factory Analysis Summary
    console.log(colorize('\n🏭 FACTORY COMPLIANCE:', colors.magenta));
    console.log(colorize(`   Coverage: ${this.results.factory.coverage || 0}%`));
    console.log(colorize(`   Compliant: ${this.results.factory.compliantFactories || 0}/${this.results.factory.totalFactories || 0}`));
    console.log(colorize(`   Issues: ${this.results.factory.complianceIssues?.length || 0}`));
    
    if (this.results.factory.complianceIssues?.length > 0) {
      console.log(colorize('\n   Critical Issues:', colors.red));
      for (const issue of this.results.factory.complianceIssues.slice(0, 5)) {
        console.log(colorize(`     ${issue}`, colors.red));
      }
      if (this.results.factory.complianceIssues.length > 5) {
        console.log(colorize(`     ... and ${this.results.factory.complianceIssues.length - 5} more`, colors.red));
      }
    }
    
    // Documentation Summary
    console.log(colorize('\n📚 DOCUMENTATION COVERAGE:', colors.green));
    console.log(colorize(`   Overall Coverage: ${this.results.documentation.coverage || 0}%`));
    console.log(colorize(`   Modules: ${this.results.documentation.modules?.documented || 0}/${this.results.documentation.modules?.total || 0}`));
    console.log(colorize(`   Globals: ${this.results.documentation.globals?.documented || 0}/${this.results.documentation.globals?.total || 0}`));
    console.log(colorize(`   Functions: ${this.results.documentation.functions?.documented || 0}/${this.results.documentation.functions?.total || 0}`));
    console.log(colorize(`   Missing Items: ${this.results.documentation.missing?.length || 0}`));
    
    // Dependency Summary
    console.log(colorize('\n🔗 DEPENDENCY ANALYSIS:', colors.blue));
    console.log(colorize(`   Files Analyzed: ${this.results.dependency.totalFiles || 0}`));
    console.log(colorize(`   Modules: ${this.results.dependency.totalModules || 0}`));
    console.log(colorize(`   Circular Dependencies: ${this.results.dependency.circularDependencies?.length || 0}`));
    console.log(colorize(`   Missing Dependencies: ${this.results.dependency.missingDependencies?.length || 0}`));
    console.log(colorize(`   Broken Links: ${this.results.dependency.brokenLinks?.length || 0}`));
    console.log(colorize(`   Orphaned Modules: ${this.results.dependency.orphanedModules?.length || 0}`));
    
    // Recommendations
    console.log(colorize('\n🎯 RECOMMENDATIONS:', colors.cyan));
    
    const allRecommendations = [
      ...(this.results.interface.recommendations || []),
      ...(this.results.factory.recommendations || []),
      ...(this.results.dependency.recommendations || [])
    ];
    
    const uniqueRecommendations = [...new Set(allRecommendations)];
    
    for (const rec of uniqueRecommendations) {
      console.log(colorize(`   - ${rec}`, colors.white));
    }
    
    // Save results to file
    this._saveResults();
  }

  /**
   * Saves analysis results to JSON file
   */
  _saveResults() {
    const resultsPath = path.join(__dirname, '..', 'coverage-results.json');
    const timestamp = new Date().toISOString().replace(/[:.]/, '-');
    
    const reportData = {
      timestamp,
      analysis: {
        interface: this.results.interface,
        factory: this.results.factory,
        documentation: this.results.documentation,
        dependency: this.results.dependency
      },
      summary: this._calculateHealthScore()
    };
    
    try {
      fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
      console.log(colorize(`\n💾 Results saved to: ${resultsPath}`, colors.green));
    } catch (error) {
      console.warn(colorize(`⚠️  Failed to save results: ${error.message}`, colors.yellow));
    }
  }
}

// CLI execution
if (require.main === module) {
  const tool = new UnifiedCoverageTool();
  
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    options[key] = value;
  }
  
  tool.analyze(options).then(results => {
    console.log(colorize('\n🎉 Unified Coverage Analysis Complete!', colors.green));
  }).catch(error => {
    console.error(colorize('❌ Analysis failed:', colors.red), error.message);
    process.exit(1);
  });
}

module.exports = UnifiedCoverageTool;
