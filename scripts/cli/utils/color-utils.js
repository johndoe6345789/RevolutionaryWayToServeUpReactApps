/**
 * Color Utilities
 * Provides consistent color formatting for CLI output
 */

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

/**
 * Colorizes text with the specified color
 * @param {string} text - Text to colorize
 * @param {string} color - Color to use
 * @returns {string} - Colorized text
 */
function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

/**
 * Gets colors object for use in other modules
 * @returns {Object} - Colors object
 */
function getColors() {
  return colors;
}

module.exports = {
  colors,
  colorize,
  getColors
};
