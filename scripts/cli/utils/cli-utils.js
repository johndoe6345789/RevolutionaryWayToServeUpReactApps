/**
 * CLI Utilities
 * Common utility functions for CLI operations
 */

const { colorize, colors } = require('./color-utils');

/**
 * Parses command line arguments into options object
 * @param {Array} args - Command line arguments
 * @returns {Object} - Parsed options
 */
function parseArgs(args) {
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      
      if (value && !value.startsWith('--')) {
        options[key] = value;
        i++; // Skip the value
      } else {
        options[key] = true;
      }
    }
  }
  
  return options;
}

/**
 * Loads package.json for version info
 * @returns {Object} - Package.json content or default
 */
function loadPackageJson() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const packagePath = path.join(__dirname, '..', '..', '..', 'package.json');
    if (fs.existsSync(packagePath)) {
      return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    }
  } catch (error) {
    // Ignore errors
  }
  
  return { version: '1.0.0' };
}

/**
 * Shows error message and exits
 * @param {string} message - Error message
 * @param {boolean} showStack - Whether to show stack trace
 */
function showError(message, showStack = false) {
  console.error(colorize('❌ Error:', colors.red), message);
  if (showStack && process.env.DEBUG) {
    console.error(new Error().stack);
  }
  process.exit(1);
}

/**
 * Shows success message
 * @param {string} message - Success message
 */
function showSuccess(message) {
  console.log(colorize('✅', colors.green), message);
}

/**
 * Shows warning message
 * @param {string} message - Warning message
 */
function showWarning(message) {
  console.log(colorize('⚠️', colors.yellow), message);
}

/**
 * Shows info message
 * @param {string} message - Info message
 */
function showInfo(message) {
  console.log(colorize('ℹ️', colors.blue), message);
}

module.exports = {
  parseArgs,
  loadPackageJson,
  showError,
  showSuccess,
  showWarning,
  showInfo,
  colorize,
  colors
};
