const fs = require('fs');
const path = require('path');

/**
 * StringLoader - Handles loading and parsing of string data files
 * Single responsibility: Load JSON data from filesystem
 */
class StringLoader {
  constructor(config = {}) {
    this.config = config;
    this.filePath = config.filePath || path.resolve(__dirname, 'strings.json');
  }

  /**
   * Load string data from file
   * @returns {Promise<Object>} Parsed string data
   */
  async load() {
    try {
      const rawData = fs.readFileSync(this.filePath, 'utf8');
      const parsedData = JSON.parse(rawData);

      if (!this.isValidStructure(parsedData)) {
        throw new Error('Invalid string data structure');
      }

      return parsedData;
    } catch (error) {
      throw new Error(`Failed to load string data: ${error.message}`);
    }
  }

  /**
   * Validate basic structure of loaded data
   * @param {Object} data - Data to validate
   * @returns {boolean}
   */
  isValidStructure(data) {
    return data && typeof data === 'object' && !Array.isArray(data);
  }

  /**
   * Check if file exists
   * @returns {boolean}
   */
  exists() {
    try {
      return fs.existsSync(this.filePath);
    } catch {
      return false;
    }
  }
}

module.exports = { StringLoader };
