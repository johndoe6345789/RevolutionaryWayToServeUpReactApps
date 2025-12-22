/**
 * Orphaned Module Detector Module
 * Detects modules that are never imported
 */

const OrphanedModuleDetector = {
  /**
   * Detects orphaned modules (never imported)
   * @param {Object} results - Analysis results object
   */
  async detect(results) {
    this.log('Checking for Orphaned Modules...', 'info');
    
    const allModules = new Set(results.dependencyGraph.keys());
    const importedModules = new Set();
    
    for (const [, node] of results.dependencyGraph) {
      for (const imp of node.imports) {
        importedModules.add(imp.module);
      }
    }
    
    for (const module of allModules) {
      if (!importedModules.has(module)) {
        const node = results.dependencyGraph.get(module);
        if (node.exportedBy.length > 0) {
          results.orphanedModules.push({
            module: module,
            file: node.importedBy[0] || 'unknown',
            exports: node.exportedBy.length,
            reason: 'Never imported but has exports'
          });
        }
      }
    }
    
    this.log(`Found ${results.orphanedModules.length} orphaned modules`, 'warn');
  }
};

module.exports = OrphanedModuleDetector;
