/**
 * Missing Dependency Detector Module
 * Detects missing dependencies in the dependency graph
 */

const MissingDependencyDetector = {
  /**
   * Detects missing dependencies
   * @param {Object} results - Analysis results object
   */
  async detect(results) {
    this.log('Checking for Missing Dependencies...', 'info');
    
    for (const [module, node] of results.dependencyGraph) {
      for (const imp of node.imports) {
        const impModule = results.dependencyGraph.get(imp.module);
        
        if (!impModule) {
          results.missingDependencies.push({
            requiredIn: module,
            requiredFrom: node.importedBy[0] || 'unknown',
            importPath: imp.path,
            type: 'missing_module'
          });
        }
      }
    }
    
    // Remove duplicates
    results.missingDependencies = this.removeDuplicates(results.missingDependencies);
    this.log(`Found ${results.missingDependencies.length} missing dependencies`, 'warn');
  },

  /**
   * Removes duplicate missing dependencies
   * @param {Array} missingDeps - Array of missing dependencies
   * @returns {Array} - Deduplicated array
   */
  removeDuplicates(missingDeps) {
    const seen = new Set();
    const unique = [];
    
    for (const dep of missingDeps) {
      const key = `${dep.requiredIn}:${dep.requiredFrom}:${dep.importPath}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(dep);
      }
    }
    
    return unique;
  }
};

module.exports = MissingDependencyDetector;
