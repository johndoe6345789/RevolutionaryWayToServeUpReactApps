#!/usr/bin/env node

/**
 * String Service Integration Feedback Script
 * Analyzes the current state of string service integration across the project
 * Provides comprehensive feedback on hardcoded strings and integration status
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname);
const STRING_SERVICE_PATH = path.join(ROOT_DIR, 'string', 'string-service.js');
const STRINGS_JSON_PATH = path.join(ROOT_DIR, 'string', 'strings.json');

// Import string service if available
let stringService;
try {
  stringService = require(STRING_SERVICE_PATH);
} catch (error) {
  console.error('❌ Cannot load string service:', error.message);
  process.exit(1);
}

// Statistics tracking
const stats = {
  totalFiles: 0,
  filesWithConsoleLog: 0,
  totalConsoleLogStatements: 0,
  filesUsingStringService: 0,
  filesNotUsingStringService: 0,
  stringKeysUsed: new Set(),
  stringKeysDefined: new Set(),
  hardcodedStrings: [],
  integrationScore: 0
};

// Load strings.json to get defined keys
function loadDefinedStringKeys() {
  try {
    const stringsData = JSON.parse(fs.readFileSync(STRINGS_JSON_PATH, 'utf8'));
    const extractKeys = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          extractKeys(value, prefix ? `${prefix}.${key}` : key);
        } else {
          stats.stringKeysDefined.add(prefix ? `${prefix}.${key}` : key);
        }
      }
    };
    extractKeys(stringsData);
  } catch (error) {
    console.warn('⚠️  Could not load strings.json:', error.message);
  }
}

// Analyze a single file for console.log usage and string service integration
function analyzeFile(filePath) {
  stats.totalFiles++;
  let content;
  let hasConsoleLog = false;
  let usesStringService = false;
  let consoleLogCount = 0;

  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.warn(`⚠️  Could not read file ${filePath}:`, error.message);
    return;
  }

  // Check for console.log usage
  const consoleLogRegex = /console\.(log|error|warn|info)\(/g;
  const matches = content.match(consoleLogRegex);
  if (matches) {
    hasConsoleLog = true;
    consoleLogCount = matches.length;
    stats.totalConsoleLogStatements += consoleLogCount;
  }

  // Check for string service usage
  if (content.includes('string-service') || content.includes('getStringService')) {
    usesStringService = true;
  }

  // Extract hardcoded strings from console.log statements
  if (hasConsoleLog) {
    stats.filesWithConsoleLog++;
    const stringRegex = /console\.(log|error|warn|info)\(['"]([^'"]*)['"]/g;
    let match;
    while ((match = stringRegex.exec(content)) !== null) {
      const hardcodedString = match[2];
      if (hardcodedString && !hardcodedString.includes('{') && !hardcodedString.includes('}')) {
        stats.hardcodedStrings.push({
          file: path.relative(ROOT_DIR, filePath),
          line: getLineNumber(content, match.index),
          string: hardcodedString,
          method: match[1]
        });
      }
    }
  }

  // Update integration statistics
  if (hasConsoleLog && usesStringService) {
    stats.filesUsingStringService++;
  } else if (hasConsoleLog && !usesStringService) {
    stats.filesNotUsingStringService++;
  }

  // Extract used string keys
  const stringKeyRegex = /strings\.get(Console|Message|Error)\(['"]([^'"]*)['"]/g;
  let keyMatch;
  while ((keyMatch = stringKeyRegex.exec(content)) !== null) {
    stats.stringKeysUsed.add(keyMatch[2]);
  }
}

// Get line number from character position
function getLineNumber(content, charIndex) {
  const lines = content.substring(0, charIndex).split('\n');
  return lines.length;
}

// Recursively analyze all JavaScript files
function analyzeProject(dir = ROOT_DIR) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    // Skip node_modules, .git, coverage, etc.
    if (item === 'node_modules' || item === '.git' || item === 'coverage' ||
        item === 'dist' || item === 'build' || item.startsWith('.')) {
      continue;
    }

    if (stat.isDirectory()) {
      analyzeProject(fullPath);
    } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.ts'))) {
      analyzeFile(fullPath);
    }
  }
}

// Calculate integration score
function calculateIntegrationScore() {
  const totalFilesWithConsoleLog = stats.filesWithConsoleLog;
  const filesUsingStringService = stats.filesUsingStringService;

  if (totalFilesWithConsoleLog === 0) {
    stats.integrationScore = 100;
  } else {
    stats.integrationScore = Math.round((filesUsingStringService / totalFilesWithConsoleLog) * 100);
  }
}

// Generate comprehensive feedback report
function generateFeedbackReport() {
  console.log('\n' + '='.repeat(80));
  console.log('🎯 STRING SERVICE INTEGRATION FEEDBACK REPORT');
  console.log('='.repeat(80));

  console.log('\n📊 OVERALL STATISTICS:');
  console.log(`   📁 Total Files Analyzed: ${stats.totalFiles}`);
  console.log(`   📝 Files with console.log: ${stats.filesWithConsoleLog}`);
  console.log(`   🔢 Total console.log statements: ${stats.totalConsoleLogStatements}`);
  console.log(`   ✅ Files using string service: ${stats.filesUsingStringService}`);
  console.log(`   ❌ Files NOT using string service: ${stats.filesNotUsingStringService}`);
  console.log(`   🔑 String keys defined: ${stats.stringKeysDefined.size}`);
  console.log(`   🔗 String keys used: ${stats.stringKeysUsed.size}`);
  console.log(`   🎯 Integration Score: ${stats.integrationScore}%`);

  console.log('\n🏆 INTEGRATION STATUS:');
  if (stats.integrationScore >= 90) {
    console.log('   🏆 EXCELLENT: Nearly complete string service integration!');
  } else if (stats.integrationScore >= 75) {
    console.log('   ✅ GOOD: Majority of console.log statements use string service');
  } else if (stats.integrationScore >= 50) {
    console.log('   ⚠️  FAIR: Half of console.log statements use string service');
  } else {
    console.log('   ❌ POOR: String service integration needs significant improvement');
  }

  if (stats.hardcodedStrings.length > 0) {
    console.log('\n🚨 HARDCODED STRINGS FOUND:');
    console.log(`   Total hardcoded strings: ${stats.hardcodedStrings.length}`);

    // Show top 10 examples
    const topExamples = stats.hardcodedStrings.slice(0, 10);
    topExamples.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.file}:${item.line} - "${item.string}" (${item.method})`);
    });

    if (stats.hardcodedStrings.length > 10) {
      console.log(`   ... and ${stats.hardcodedStrings.length - 10} more`);
    }
  }

  // Check for unused string keys
  const unusedKeys = Array.from(stats.stringKeysDefined).filter(key => !stats.stringKeysUsed.has(key));
  if (unusedKeys.length > 0) {
    console.log('\n🧹 UNUSED STRING KEYS:');
    console.log(`   Total unused keys: ${unusedKeys.length}`);
    const topUnused = unusedKeys.slice(0, 5);
    topUnused.forEach(key => console.log(`   • ${key}`));
    if (unusedKeys.length > 5) {
      console.log(`   ... and ${unusedKeys.length - 5} more`);
    }
  }

  console.log('\n🎯 RECOMMENDATIONS:');

  if (stats.filesNotUsingStringService > 0) {
    console.log(`   1. Fix ${stats.filesNotUsingStringService} files that use console.log without string service`);
  }

  if (stats.hardcodedStrings.length > 0) {
    console.log(`   2. Convert ${stats.hardcodedStrings.length} hardcoded console.log strings to use string service`);
  }

  if (unusedKeys.length > 0) {
    console.log(`   3. Remove or utilize ${unusedKeys.length} unused string keys`);
  }

  console.log('   4. Add string service imports to files that need it');
  console.log('   5. Ensure consistent string key naming conventions');

  console.log('\n💡 NEXT STEPS:');
  console.log('   • Run this script regularly to track progress');
  console.log('   • Focus on high-impact files (generators, plugins)');
  console.log('   • Add new string keys as needed for new features');
  console.log('   • Consider automated testing for string service usage');

  console.log('\n' + '='.repeat(80));
  console.log('🎉 REPORT GENERATED SUCCESSFULLY');
  console.log('='.repeat(80));
}

// Main execution
function main() {
  console.log('🔍 Analyzing string service integration...');

  try {
    // Load defined string keys
    loadDefinedStringKeys();

    // Analyze the entire project
    analyzeProject();

    // Calculate integration score
    calculateIntegrationScore();

    // Generate feedback report
    generateFeedbackReport();

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Run the analysis
if (require.main === module) {
  main();
}

module.exports = { analyzeFile, analyzeProject, stats };
