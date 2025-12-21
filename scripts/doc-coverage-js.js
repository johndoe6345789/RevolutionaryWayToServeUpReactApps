#!/usr/bin/env node

/**
 * JavaScript version of Documentation Coverage Tool
 * Provides the same functionality as the Python version but in Node.js
 * for better integration with the unified coverage tool
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

class DocumentationCoverageTool {
  constructor() {
    this.bootstrapPath = path.join(__dirname, '..', 'bootstrap');
    this.docsPath = path.join(__dirname, '..', 'docs');
    this.apiDocsPath = path.join(this.docsPath, 'api');
  }

  /**
   * Runs documentation coverage analysis using Node.js APIs
   */
  async analyze(options = {}) {
    console.log(colorize('\n📚 Node.js Documentation Coverage Analysis', colors.cyan));
    console.log(colorize('=' .repeat(50), colors.white));
    
    const startTime = Date.now();
    
    try {
      // Use Python script for consistency with existing setup
      const result = execSync('python3 scripts/doc_coverage.py --code-root . --doc-root docs', {
        encoding: 'utf8',
        cwd: path.join(__dirname, '..')
      });
      
      // Parse the results
      const analysis = this._parsePythonOutput(result.stdout);
      
      console.log(colorize(`   Analysis completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s`, colors.green));
      
      return analysis;
      
    } catch (error) {
      console.warn(colorize('⚠️  Documentation analysis failed, using fallback:', colors.yellow));
      return this._getFallbackAnalysis();
    }
  }

  /**
   * Parses Python script output
   */
  _parsePythonOutput(output) {
    const lines = output.split('\n');
    const analysis = {};
    
    // Parse coverage percentage
    const coverageMatch = lines.find(line => line.includes('Overall:'));
    if (coverageMatch) {
      const coveragePercent = coverageMatch.match(/(\d+\.\d+)%/);
      analysis.coverage = coveragePercent ? coveragePercent[1] : '0%';
    }
    
    // Parse modules
    analysis.modules = this._parseModuleCount(lines, 'Modules:');
    
    // Parse globals
    analysis.globals = this._parseModuleCount(lines, 'Globals:');
    
    // Parse functions/classes
    analysis.functions = this._parseModuleCount(lines, 'Functions / Classes:');
    
    // Parse missing items
    analysis.missing = this._extractMissingItems(lines);
    
    return analysis;
  }

  /**
   * Parses module count from lines
   */
  _parseModuleCount(lines, prefix) {
    const line = lines.find(l => l.includes(prefix));
    if (line) {
      const match = line.match(/(\d+)\/(\d+)/);
      return match ? { documented: parseInt(match[1]), total: parseInt(match[2]) } : { documented: 0, total: 0 };
    }
    return { documented: 0, total: 0 };
  }

  /**
   * Extracts missing items from lines
   */
  _extractMissingItems(lines) {
    const missingSection = lines.findIndex(l => l.includes('Missing'));
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
   * Gets fallback analysis if Python script fails
   */
  _getFallbackAnalysis() {
    return {
      coverage: '0%',
      modules: { documented: 0, total: 0 },
      globals: { documented: 0, total: 0 },
      functions: { documented: 0, total: 0 },
      missing: []
    };
  }

  /**
   * Saves analysis results to JSON file
   */
  saveResults(analysis) {
    const resultsPath = path.join(__dirname, '..', 'doc-coverage-results.json');
    const reportData = {
      timestamp: new Date().toISOString().replace(/[:.]/, '-'),
      analysis
    };
    
    try {
      fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
      console.log(colorize(`\n💾 Results saved to: ${resultsPath}`, colors.green));
    } catch (error) {
      console.warn(colorize(`⚠️  Failed to save results: ${error.message}`, colors.yellow));
    }
  }

  /**
   * Prints analysis results to console
   */
  printResults(analysis) {
    console.log(colorize('\n📊 DOCUMENTATION COVERAGE REPORT', colors.cyan));
    console.log(colorize('================================', colors.white));
    
    // Summary
    console.log(colorize(`\n📈 SUMMARY:`, colors.green));
    console.log(colorize(`   Overall Coverage: ${analysis.coverage}`));
    console.log(colorize(`   Modules: ${analysis.modules.documented}/${analysis.modules.total}`));
    console.log(colorize(`   Globals: ${analysis.globals.documented}/${analysis.globals.total}`));
    console.log(colorize(`   Functions: ${analysis.functions.documented}/${analysis.functions.total}`));
    
    // Missing items
    if (analysis.missing.length > 0) {
      console.log(colorize('\n📚 MISSING DOCUMENTED ITEMS:', colors.red));
      for (const item of analysis.missing.slice(0, 10)) {
        console.log(colorize(`   - ${item}`, colors.red));
      }
      if (analysis.missing.length > 10) {
        console.log(colorize(`   ... and ${analysis.missing.length - 10} more items`, colors.red));
      }
    }
    
    console.log(colorize('\n🎯 RECOMMENDATIONS:', colors.green));
    
    if (analysis.coverage === '100%') {
      console.log(colorize('   ✅ Excellent documentation coverage!', colors.green));
    } else if (analysis.coverage >= '80%') {
      console.log(colorize('   ✅ Good documentation coverage!', colors.green));
    } else if (analysis.coverage >= '60%') {
      console.log(colorize('   ⚠️  Documentation coverage needs improvement', colors.yellow));
    } else {
      console.log(colorize('   ❌ Poor documentation coverage', colors.red));
    }
  }
}

// CLI execution
if (require.main === module) {
  const tool = new DocumentationCoverageTool();
  
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    options[key] = value;
  }
  
  tool.analyze(options).then(results => {
    console.log(colorize('\n🎉 Documentation Coverage Analysis Complete!', colors.green));
  }).catch(error => {
    console.error(colorize('❌ Analysis failed:', colors.red), error.message);
    process.exit(1);
  });
}

module.exports = DocumentationCoverageTool;
