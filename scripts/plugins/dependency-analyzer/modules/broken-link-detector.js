/**
 * Broken Link Detector Module
 * Detects broken import/export links
 */

const path = require('path');
const fs = require('fs');

const BrokenLinkDetector = {
  /**
   * Detects broken import/export links
   * @param {Object} results - Analysis results object
   */
  async detect(results) {
    this.log('Checking for Broken Links...', 'info');
    
    for (const [module, node] of results.dependencyGraph) {
      for (const imp of node.imports) {
        const impModule = results.dependencyGraph.get(imp.module);
        
        if (!impModule) {
          const fullPath = path.resolve(path.dirname(module), imp.path);
          
          if (!fs.existsSync(fullPath)) {
            results.brokenLinks.push({
              from: module,
              to: imp.path,
              type: 'broken_import',
              resolvedPath: fullPath
            });
          }
        }
      }
      
      for (const exp of node.exportedBy) {
        if (node.file !== exp) {
          results.brokenLinks.push({
            from: module,
            to: exp,
            type: 'broken_export',
            reason: 'Exported module not found in file'
          });
        }
      }
    }
    
    results.brokenLinks = this.removeDuplicates(results.brokenLinks);
    this.log(`Found ${results.brokenLinks.length} broken links`, 'warn');
  },

  /**
   * Removes duplicate broken links
   * @param {Array} brokenLinks - Array of broken links
   * @returns {Array} - Deduplicated array
   */
  removeDuplicates(brokenLinks) {
    const seen = new Set();
    const unique = [];
    
    for (const link of brokenLinks) {
      const key = `${link.from}:${link.to}:${link.type}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(link);
      }
    }
    
    return unique;
  }
};

module.exports = BrokenLinkDetector;
