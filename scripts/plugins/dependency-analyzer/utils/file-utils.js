/**
 * File Utilities Module
 * Common file operations for dependency analysis
 */

const fs = require('fs');
const path = require('path');

const FileUtils = {
  /**
   * Checks if file exists and is readable
   * @param {string} filePath - File path to check
   * @returns {boolean} - True if file exists and readable
   */
  existsAndReadable(filePath) {
    try {
      return fs.existsSync(filePath) && 
             fs.statSync(filePath).isFile();
    } catch (error) {
      return false;
    }
  },

  /**
   * Reads file content safely
   * @param {string} filePath - File path to read
   * @returns {string|null} - File content or null if error
   */
  readSafe(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.warn(`Failed to read ${filePath}: ${error.message}`);
      return null;
    }
  },

  /**
   * Gets relative path from base directory
   * @param {string} basePath - Base directory path
   * @param {string} filePath - File path
   * @returns {string} - Relative path
   */
  getRelativePath(basePath, filePath) {
    return path.relative(basePath, filePath);
  },

  /**
   * Gets file extension
   * @param {string} filePath - File path
   * @returns {string} - File extension
   */
  getExtension(filePath) {
    return path.extname(filePath);
  },

  /**
   * Gets file name without extension
   * @param {string} filePath - File path
   * @returns {string} - File name without extension
   */
  getBaseName(filePath) {
    return path.basename(filePath, path.extname(filePath));
  },

  /**
   * Joins path segments safely
   * @param {...string} segments - Path segments
   * @returns {string} - Joined path
   */
  joinPath(...segments) {
    return path.join(...segments);
  },

  /**
   * Resolves path to absolute
   * @param {string} fromPath - Base path
   * @param {string} toPath - Target path
   * @returns {string} - Resolved absolute path
   */
  resolvePath(fromPath, toPath) {
    return path.resolve(fromPath, toPath);
  }
};

module.exports = FileUtils;
