#!/usr/bin/env node

/**
 * Dependency Analysis Tool
 * Analyzes dependency relationships across the bootstrap system to identify:
 * - Circular dependencies
 * - Missing dependencies
 * - Broken import/export chains
 * - Orphaned modules
 * - Version conflicts
 */

const fs = require('fs');
const path = require('path');

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

function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

class DependencyAnalyzer {
  constructor() {
    this.bootstrapPath = path.join(__dirname, '..', 'bootstrap');
    this.results = {
      totalFiles: 0,
      circularDependencies: [],
      missingDependencies: [],
      brokenLinks: [],
      orphanedModules: [],
      versionConflicts: [],
      recommendations: [],
      dependencyGraph: new Map(),
      processedFiles: new Set()
    };
  }

  /**
   * Runs comprehensive dependency analysis.
   */
  async analyze() {
    console.log(colorize('\n🔗 Revolutionary Way To Serve Up React Apps', colors.cyan));
    console.log(colorize('📊 Dependency Analysis Tool', colors.blue));
    console.log(colorize('=' .repeat(50), colors.white));
    
    await this._scanAllFiles();
    await this._buildDependencyGraph();
    await this._detectCircularDependencies();
    await this._findMissingDependencies();
    await this._detectBrokenLinks();
    
    this._generateReport();
    return this.results;
  }

  /**
   * Scans all JavaScript files in the bootstrap system.
   */
  async _scanAllFiles() {
    console.log(colorize('\n📂 Scanning Files for Dependencies...', colors.blue));
    
    const jsFiles = await this._findAllJSFiles();
    
    for (const file of jsFiles) {
      await this._analyzeFile(file);
    }
    
    console.log(colorize(`   Analyzed ${this.results.totalFiles} files`, colors.green));
  }

  /**
   * Finds all JavaScript files recursively.
   */
  async _findAllJSFiles() {
    const files = [];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    };
    
    scanDirectory(this.bootstrapPath);
    return files;
  }

  /**
   * Analyzes a single file for dependencies.
   */
  async _analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.bootstrapPath, filePath);
      
      // Extract imports and exports
      const imports = this._extractImports(content);
      const exports = this._extractExports(content);
      
      this.results.processedFiles.add(filePath);
      this.results.totalFiles++;
      
      // Add to dependency graph
      this._addFileToGraph(relativePath, imports, exports);
      
    } catch (error) {
      console.log(colorize(`   ❌ Error analyzing ${filePath}: ${error.message}`, colors.red));
    }
  }

  /**
   * Extracts import statements from file content.
   */
  _extractImports(content) {
    const imports = [];
    const importRegex = /(?:const|let|var)\s+(\w+)\s*=\s*require\s*\(?([''"][^'"]+)['"]\s*\))/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const moduleName = match[1];
      const importPath = match[2] || match[3]; // Handle both 'require' and import paths
      imports.push({
        module: moduleName,
        path: importPath,
        line: content.substring(0, content.indexOf(match[0])).split('\n')[match[0].split('\n').length
      });
    }
    
    return imports;
  }

  /**
   * Extracts export statements from file content.
   */
  _extractExports(content) {
    const exports = [];
    const exportRegex = /module\.exports\s*=\s*require\s*\(?([''"][^'"]+)['"]\s*\))/g;
    
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const moduleName = match[1] || match[2]; // Handle both paths and direct exports
      exports.push({
        module: moduleName,
        path: null, // Direct export
        line: content.substring(0, content.indexOf(match[0])).split('\n')[match[0].split('\n').length
      });
    }
    
    // Check for class exports
    const classExportRegex = /class\s+(\w+)\s*{/g;
    const classMatch = classExportRegex.exec(content);
    if (classMatch) {
      exports.push({
        module: classMatch[1],
        path: null, // Class export
        line: content.substring(0, content.indexOf(classMatch[0])).split('\n')[classMatch[0].split('\n').length
      });
    }
    
    return exports;
  }

  /**
   * Adds a file to the dependency graph.
   */
  _addFileToGraph(filePath, imports, exports) {
    const fileName = path.basename(filePath, '.js');
    
    // Add nodes for imported modules
    for (const imp of imports) {
      if (!this.dependencyGraph.has(imp.module)) {
        this.dependencyGraph.set(imp.module, {
          type: 'module',
          imports: [],
          exportedBy: [],
          importedBy: [fileName]
        });
      }
      
      this.dependencyGraph.get(imp.module).imports.push({
        from: fileName,
        path: imp.path
      });
    }
    
    // Add nodes for exported modules
    for (const exp of exports) {
      if (!this.dependencyGraph.has(exp.module)) {
        this.dependencyGraph.set(exp.module, {
          type: 'module',
          imports: [],
          exportedBy: [fileName],
          importedBy: []
        });
      }
      
      this.dependencyGraph.get(exp.module).exportedBy.push(fileName);
    }
    
    // Link imports to exports
    for (const imp of imports) {
      for (const exp of exports) {
        if (exp.module === imp.module) {
          // Same file - not a dependency
          continue;
        }
        
        if (!this.dependencyGraph.get(imp.module).importedBy.includes(exp.module) &&
            !this.dependencyGraph.get(imp.module).importedBy.includes(fileName)) {
          this.dependencyGraph.get(imp.module).importedBy.push(exp.module);
        }
      }
    }
  }

  /**
   * Builds the dependency graph and detects circular dependencies.
   */
  async _buildDependencyGraph() {
    console.log(colorize('\n🔗 Building Dependency Graph...', colors.blue));
    
    for (const [module, node] of this.dependencyGraph) {
      // Check for circular dependencies
      const visited = new Set();
      const hasCircular = this._detectCircularDependency(module, visited);
      
      if (hasCircular) {
        const cycle = this._getCircularPath(module, visited);
        this.results.circularDependencies.push({
          cycle: cycle.join(' → '),
          file: node.importedBy[0] || 'unknown'
        });
      }
    }
    
    console.log(colorize(`   Processed ${this.dependencyGraph.size} modules`, colors.green));
  }

  /**
   * Detects circular dependencies using DFS.
   */
  _detectCircularDependency(module, visited, path = []) {
    if (visited.has(module)) {
      return true; // Circular detected
    }
    
    visited.add(module);
    
    const node = this.dependencyGraph.get(module);
    
    for (const dependency of node.imports) {
      if (this._detectCircularDependency(dependency.module, visited, [...path, module])) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Gets the circular path for a module.
   */
  _getCircularPath(module, visited) {
    const node = this.dependencyGraph.get(module);
    
    for (const imp of node.imports) {
      if (visited.has(imp.module)) {
        continue;
      }
      
      if (this._detectCircularDependency(imp.module, visited, [...visited, imp.module])) {
        return [...visited, imp.module, module];
      }
    }
    
    return null;
  }

  /**
   * Finds missing dependencies.
   */
  async _findMissingDependencies() {
    console.log(colorize('\n🔍 Checking for Missing Dependencies...', colors.yellow));
    
    for (const [module, node] of this.dependencyGraph) {
      for (const imp of node.imports) {
        const impModule = this.dependencyGraph.get(imp.module);
        
        if (!impModule) {
          this.results.missingDependencies.push({
            requiredIn: module,
            requiredFrom: node.file,
            importPath: imp.path,
            type: 'missing_module'
          });
        }
      }
    }
    
    console.log(colorize(`   Found ${this.results.missingDependencies.length} missing dependencies`, colors.red));
  }

  /**
   * Detects broken import/export links.
   */
  async _detectBrokenLinks() {
    console.log(colorize('\n🔗 Checking for Broken Links...', colors.magenta));
    
    for (const [module, node] of this.dependencyGraph) {
      for (const imp of node.imports) {
        const impModule = this.dependencyGraph.get(imp.module);
        
        if (!impModule) {
          // Try to resolve the import path
          const fullPath = path.resolve(path.dirname(node.file), imp.path);
          
          if (!fs.existsSync(fullPath)) {
            this.results.brokenLinks.push({
              from: node.file,
              to: imp.path,
              type: 'broken_import',
              resolvedPath: fullPath
            });
          }
        }
      }
      
      for (const exp of node.exportedBy) {
        // Check if exported module actually exists in the file
        if (node.file !== exp) {
          this.results.brokenLinks.push({
            from: module,
            to: exp,
            type: 'broken_export',
            reason: 'Exported module not found in file'
          });
        }
      }
    }
    
    console.log(colorize(`   Found ${this.results.brokenLinks.length} broken links`, colors.red));
  }

  /**
   * Detects orphaned modules (modules that are never imported).
   */
  async _detectOrphanedModules() {
    console.log(colorize('\n👻 Checking for Orphaned Modules...', colors.cyan));
    
    const allModules = new Set(this.dependencyGraph.keys());
    const importedModules = new Set();
    
    for (const [, node] of this.dependencyGraph) {
      for (const imp of node.imports) {
        importedModules.add(imp.module);
      }
    }
    
    for (const module of allModules) {
      if (!importedModules.has(module) && node.exportedBy.length === 0) {
        this.results.orphanedModules.push({
          module: module,
          file: node.importedBy[0] || 'unknown',
          exports: node.exportedBy.length,
          reason: 'Never imported but has exports'
        });
      }
    }
    
    console.log(colorize(`   Found ${this.results.orphanedModules.length} orphaned modules`, colors.yellow));
  }

  /**
   * Detects version conflicts in dependencies.
   */
  async _detectVersionConflicts() {
    console.log(colorize('\n⚠ Checking for Version Conflicts...', colors.red));
    
    // This would require package.json analysis
    // For now, just note that we should check this
    this.results.recommendations.push('Implement package.json version conflict detection');
  }

  /**
   * Generates comprehensive dependency analysis report.
   */
  _generateReport() {
    console.log(colorize('\n🔗 DEPENDENCY ANALYSIS REPORT', colors.cyan));
    console.log(colorize('================================', colors.white));
    
    // Summary
    console.log(colorize(`\n📈 SUMMARY:`, colors.green));
    console.log(colorize(`   Total Files Analyzed: ${this.results.totalFiles}`));
    console.log(colorize(`   Total Modules: ${this.dependencyGraph.size}`));
    console.log(colorize(`   Circular Dependencies: ${this.results.circularDependencies.length}`));
    console.log(colorize(`   Missing Dependencies: ${this.results.missingDependencies.length}`));
    console.log(colorize(`   Broken Links: ${this.results.brokenLinks.length}`));
    console.log(colorize(`   Orphaned Modules: ${this.results.orphanedModules.length}`));
    
    // Detailed Issues
    if (this.results.circularDependencies.length > 0) {
      console.log(colorize(`\n🔄 CIRCULAR DEPENDENCIES:`, colors.red));
      for (const issue of this.results.circularDependencies) {
        console.log(colorize(`   ${issue.cycle}`), colors.red);
      }
    }
    
    if (this.results.missingDependencies.length > 0) {
      console.log(colorize(`\n❌ MISSING DEPENDENCIES:`, colors.red));
      for (const issue of this.results.missingDependencies) {
        console.log(colorize(`   ${issue.requiredIn} requires ${issue.requiredFrom} (${issue.importPath})`), colors.red));
      }
    }
    
    if (this.results.brokenLinks.length > 0) {
      console.log(colorize(`\n🔗 BROKEN LINKS:`, colors.magenta));
      for (const issue of this.results.brokenLinks) {
        console.log(colorize(`   ${issue.from} → ${issue.to} (${issue.type})`), colors.red));
        if (issue.resolvedPath) {
          console.log(colorize(`     Expected at: ${issue.resolvedPath}`), colors.yellow));
        }
      }
    }
    
    if (this.results.orphanedModules.length > 0) {
      console.log(colorize(`\n👻 ORPHANED MODULES:`, colors.yellow));
      for (const issue of this.results.orphanedModules) {
        console.log(colorize(`   ${issue.module} (${issue.file}) - ${issue.exports} exports`), colors.yellow));
      }
    }
    
    // Recommendations
    console.log(colorize(`\n🎯 RECOMMENDATIONS:`, colors.green));
    
    if (this.results.circularDependencies.length > 0) {
      this.results.recommendations.push('Resolve circular dependencies by refactoring to use dependency injection');
    }
    
    if (this.results.missingDependencies.length > 0) {
      this.results.recommendations.push('Ensure all required modules are available or provide alternatives');
    }
    
    if (this.results.brokenLinks.length > 0) {
      this.results.recommendations.push('Fix broken import paths and ensure all modules are properly structured');
    }
    
    if (this.results.orphanedModules.length > 0) {
      this.results.recommendations.push('Remove unused exports or add proper imports for orphaned modules');
    }
    
    this.results.recommendations.push('Implement proper package.json management to detect version conflicts');
    this.results.recommendations.push('Use dependency injection pattern to reduce circular dependencies');
    
    for (const recommendation of this.results.recommendations) {
      console.log(colorize(`   - ${recommendation}`), colors.cyan));
    }
    
    // Overall Health
    const totalIssues = this.results.circularDependencies.length + 
                        this.results.missingDependencies.length + 
                        this.results.brokenLinks.length + 
                        this.results.orphanedModules.length;
    
    if (totalIssues === 0) {
      console.log(colorize(`\n✅ DEPENDENCY HEALTH: EXCELLENT`), colors.green));
    } else if (totalIssues <= 5) {
      console.log(colorize(`\n✅ DEPENDENCY HEALTH: GOOD (${totalIssues} issues)`), colors.yellow));
    } else {
      console.log(colorize(`\n❌ DEPENDENCY HEALTH: POOR (${totalIssues} issues)`), colors.red));
    }
  }
}

// CLI execution
if (require.main === module) {
  const analyzer = new DependencyAnalyzer();
  
  analyzer.analyze().then(results => {
    console.log(colorize('\n🎉 Dependency Analysis Complete!', colors.green));
    
    if (results.circularDependencies.length > 0 || results.missingDependencies.length > 0) {
      console.log(colorize('\n⚠️  ACTION REQUIRED: Fix dependency issues before refactoring', colors.yellow));
      process.exit(1);
    } else {
      console.log(colorize('\n✅ Dependencies look clean for refactoring', colors.green));
      process.exit(0);
    }
  }).catch(error => {
    console.error(colorize('❌ Dependency analysis failed:', colors.red), error.message);
    process.exit(1);
  });
}

module.exports = DependencyAnalyzer;
