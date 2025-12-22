/**
 * Metadata Loader
 * Handles loading and parsing of plugin metadata JSON files
 */

const fs = require('fs');
const path = require('path');

class MetadataLoader {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Loads metadata from a plugin directory
   * @param {string} pluginDir - Path to plugin directory
   * @returns {Object} - Parsed metadata
   */
  loadMetadata(pluginDir) {
    // Check cache first
    if (this.cache.has(pluginDir)) {
      return this.cache.get(pluginDir);
    }

    const metadataPath = path.join(pluginDir, 'plugin.json');
    
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Plugin metadata not found: ${metadataPath}`);
    }

    try {
      const metadataContent = fs.readFileSync(metadataPath, 'utf8');
      const metadata = JSON.parse(metadataContent);
      
      // Validate required fields
      this.validateMetadata(metadata, metadataPath);
      
      // Resolve relative paths
      this.resolvePaths(metadata, pluginDir);
      
      // Cache the result
      this.cache.set(pluginDir, metadata);
      
      return metadata;
    } catch (error) {
      throw new Error(`Failed to load plugin metadata from ${metadataPath}: ${error.message}`);
    }
  }

  /**
   * Validates metadata structure
   * @param {Object} metadata - Parsed metadata
   * @param {string} metadataPath - Path to metadata file
   */
  validateMetadata(metadata, metadataPath) {
    const required = ['name', 'version', 'description', 'entry'];
    
    for (const field of required) {
      if (!metadata[field]) {
        throw new Error(`Missing required field '${field}' in ${metadataPath}`);
      }
    }

    // Validate version format (semver)
    if (!this.isValidVersion(metadata.version)) {
      throw new Error(`Invalid version format in ${metadataPath}: ${metadata.version}`);
    }

    // Validate entry file exists
    const entryPath = path.join(path.dirname(metadataPath), metadata.entry);
    if (!fs.existsSync(entryPath)) {
      throw new Error(`Entry file not found: ${entryPath}`);
    }
  }

  /**
   * Resolves relative paths in metadata
   * @param {Object} metadata - Metadata object
   * @param {string} pluginDir - Plugin directory path
   */
  resolvePaths(metadata, pluginDir) {
    // Resolve entry path
    metadata.resolvedEntry = path.resolve(pluginDir, metadata.entry);
    
    // Resolve module paths
    if (metadata.modules) {
      metadata.resolvedModules = metadata.modules.map(module => 
        path.resolve(pluginDir, module)
      );
    }
  }

  /**
   * Checks if version string is valid semver
   * @param {string} version - Version string
   * @returns {boolean} - True if valid
   */
  isValidVersion(version) {
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
    return semverRegex.test(version);
  }

  /**
   * Clears the metadata cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Gets all metadata fields for a plugin
   * @param {string} pluginDir - Plugin directory
   * @returns {Object} - Complete metadata info
   */
  getPluginInfo(pluginDir) {
    const metadata = this.loadMetadata(pluginDir);
    
    return {
      ...metadata,
      directory: pluginDir,
      loadedAt: new Date().toISOString(),
      fileSize: this.getDirectorySize(pluginDir)
    };
  }

  /**
   * Gets total size of plugin directory
   * @param {string} dirPath - Directory path
   * @returns {number} - Size in bytes
   */
  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    if (!fs.existsSync(dirPath)) {
      return 0;
    }

    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  }
}

module.exports = MetadataLoader;
