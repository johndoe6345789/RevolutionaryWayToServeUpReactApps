#!/usr/bin/env node

/**
 * Runner script for interface coverage analysis.
 * Provides easy execution of the coverage tool with colored output.
 */

const InterfaceCoverageTool = require('./interface-coverage-tool.js');

// Color utilities for better output
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

async function main() {
  console.log(colorize('\n🔍 Revolutionary Way To Serve Up React Apps', colors.cyan));
  console.log(colorize('📊 Interface Coverage Analysis Tool', colors.blue));
  console.log(colorize('=' .repeat(50), colors.white));
  
  try {
    const tool = new InterfaceCoverageTool();
    const results = await tool.analyze();
    
    // Final summary with colors
    console.log('\n' + colorize('🎯 FINAL RESULTS:', colors.green));
    console.log(colorize(`   Coverage: ${results.coverage}%`, colors.yellow));
    console.log(colorize(`   Compliant: ${results.compliantClasses}/${results.totalClasses}`, colors.green));
    
    if (results.missingImplementations.length === 0) {
      console.log('\n' + colorize('✅ SUCCESS: All classes comply with interface patterns!', colors.green));
    } else {
      console.log('\n' + colorize(`❌ ACTION NEEDED: ${results.missingImplementations.length} classes need updates`, colors.red));
    }
    
    // Exit with appropriate code
    process.exit(results.missingImplementations.length > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(colorize(`❌ ERROR: ${error.message}`, colors.red));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, colorize };
