/**
 * Graph Builder Module
 * Builds dependency graph and detects circular dependencies
 */

const GraphBuilder = {
  /**
   * Builds the dependency graph and detects circular dependencies
   * @param {Object} results - Analysis results object
   */
  async buildGraph(results) {
    this.log('Building Dependency Graph...', 'info');
    
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
    
    this.log(`Processed ${results.dependencyGraph.size} modules`, 'info');
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
    const node = dependencyGraph.get(module);
    if (!node) return [];
    
    for (const imp of node.imports) {
      if (visited.has(imp.module)) {
        const cycleStart = Array.from(visited).indexOf(imp.module);
        return Array.from(visited).slice(cycleStart).concat([module]);
      }
      
      const subPath = this.getCircularPath(imp.module, new Set([...visited, imp.module]), dependencyGraph);
      if (subPath.length > 0) {
        return subPath;
      }
    }
    
    return [];
  }
};

module.exports = GraphBuilder;
