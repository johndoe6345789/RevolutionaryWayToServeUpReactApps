/**
 * Circular Dependency Detector Module
 * Detects circular dependencies in the dependency graph
 */

const CircularDetector = {
  /**
   * Detects circular dependencies across the entire graph
   * @param {Object} results - Analysis results object
   */
  async detect(results) {
    this.log('Detecting Circular Dependencies...', 'info');
    
    for (const [module, node] of results.dependencyGraph) {
      const visited = new Set();
      const hasCircular = this.detectCircularDependency(module, visited, results.dependencyGraph);
      
      if (hasCircular) {
        const cycle = this.getCircularPath(module, visited, results.dependencyGraph);
        results.circularDependencies.push({
          cycle: cycle.join(' → '),
          file: node.importedBy[0] || 'unknown'
        });
      }
    }
    
    // Remove duplicates
    results.circularDependencies = this.removeDuplicates(results.circularDependencies);
    this.log(`Detected ${results.circularDependencies.length} circular dependencies`, 'warn');
  },

  /**
   * Detects circular dependency using DFS
   * @param {string} module - Current module
   * @param {Set} visited - Visited modules
   * @param {Map} dependencyGraph - Full dependency graph
   * @returns {boolean} - True if circular detected
   */
  detectCircularDependency(module, visited, dependencyGraph) {
    if (visited.has(module)) {
      return true; // Circular detected
    }
    
    visited.add(module);
    
    const node = dependencyGraph.get(module);
    if (!node) return false;
    
    for (const dependency of node.imports) {
      if (this.detectCircularDependency(dependency.module, new Set(visited), dependencyGraph)) {
        return true;
      }
    }
    
    return false;
  },

  /**
   * Gets the circular path for a module
   * @param {string} module - Starting module
   * @param {Set} visited - Visited modules
   * @param {Map} dependencyGraph - Full dependency graph
   * @returns {Array} - Circular path
   */
  getCircularPath(module, visited, dependencyGraph) {
    const path = [...visited, module];
    const node = dependencyGraph.get(module);
    
    if (!node) return path;
    
    for (const imp of node.imports) {
      if (visited.has(imp.module)) {
        // Found the cycle, trim to cycle start
        const cycleStart = path.indexOf(imp.module);
        return path.slice(cycleStart).concat([module]);
      }
      
      const subPath = this.getCircularPath(imp.module, new Set(path), dependencyGraph);
      if (subPath.length > 0) {
        return subPath;
      }
    }
    
    return [];
  },

  /**
   * Removes duplicate cycles from results
   * @param {Array} cycles - Array of cycle objects
   * @returns {Array} - Deduplicated cycles
   */
  removeDuplicates(cycles) {
    const seen = new Set();
    const unique = [];
    
    for (const cycle of cycles) {
      const normalized = this.normalizeCycle(cycle.cycle);
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(cycle);
      }
    }
    
    return unique;
  },

  /**
   * Normalizes cycle string for comparison
   * @param {string} cycle - Cycle string
   * @returns {string} - Normalized cycle
   */
  normalizeCycle(cycle) {
    // Sort alphabetically and join for consistent comparison
    const modules = cycle.split(' → ').map(m => m.trim()).sort();
    return modules.join(' → ');
  },

  /**
   * Validates circular dependency results
   * @param {Array} circularDependencies - Array of circular dependencies
   * @returns {Object} - Validation summary
   */
  validateResults(circularDependencies) {
    const summary = {
      total: circularDependencies.length,
      severity: 'low',
      affectedModules: new Set(),
      recommendations: []
    };
    
    // Classify severity
    if (circularDependencies.length === 0) {
      summary.severity = 'none';
      summary.recommendations.push('Excellent! No circular dependencies found.');
    } else if (circularDependencies.length <= 3) {
      summary.severity = 'low';
      summary.recommendations.push('Few circular dependencies found. Consider refactoring.');
    } else if (circularDependencies.length <= 10) {
      summary.severity = 'medium';
      summary.recommendations.push('Moderate circular dependencies. Refactoring recommended.');
    } else {
      summary.severity = 'high';
      summary.recommendations.push('High number of circular dependencies. Immediate refactoring required.');
    }
    
    // Track affected modules
    for (const cycle of circularDependencies) {
      const modules = cycle.cycle.split(' → ');
      modules.forEach(m => summary.affectedModules.add(m.trim()));
    }
    
    // Add specific recommendations
    if (summary.severity !== 'none') {
      summary.recommendations.push('Use dependency injection pattern to reduce circular dependencies.');
      summary.recommendations.push('Extract common functionality into shared modules.');
      summary.recommendations.push('Consider event-driven architecture for loose coupling.');
    }
    
    return summary;
  }
};

module.exports = CircularDetector;
