#!/usr/bin/env node

/**
 * Dependency Analyzer Plugin
 * Analyzes dependency relationships across the bootstrap system to identify:
 * - Circular dependencies
 * - Missing dependencies
 * - Broken import/export chains
 * - Orphaned modules
 * - Version conflicts
 */

const fs = require('fs');
const path = require('path');
const BasePlugin = require('../lib/base-plugin');

class DependencyAnalyzerPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'dependency-analyzer',
      description: 'Analyzes dependency relationships and detects issues',
      version: '1.0.0',
      author: 'RWTRA',
      category: 'analysis',
      commands: [
        {
          name: 'dependency-analyze',
          description: 'Run dependency analysis on the bootstrap system'
        }
      ],
      dependencies: []
    });

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
   * Main plugin execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Analysis results
   */
  async execute(context) {
    await this.initialize(context);
    
    this.log('Starting dependency analysis...', 'info');
    this.log(this.colorize('\n🔗 Revolutionary Way To Serve Up React Apps', context.colors.cyan));
    this.log(this.colorize('📊 Dependency Analysis Tool', context.colors.blue));
    this.log(this.colorize('='.repeat(50), context.colors.white));
    
    const bootstrapPath = context.options['bootstrap-path'] || path.join(context.bootstrapPath, 'bootstrap');
    this.bootstrapPath = bootstrapPath;
    
    await this._scanAllFiles();
    await this._buildDependencyGraph();
    await this._detectCircularDependencies();
    await this._findMissingDependencies();
    await this._detectBrokenLinks();
    await this._detectOrphanedModules();
    await this._detectVersionConflicts();
    
    this._generateReport(context);
    
    // Save results if output directory specified
    if (context.options.output) {
      await this._saveResults(context);
    }
    
    return this.results;
  }

  /**
   * Scans all JavaScript files in the bootstrap system.
   */
  async _scanAllFiles() {
    this.log('Scanning Files for Dependencies...', 'info');
    
    const jsFiles = await this._findAllJSFiles();
    
    for (const file of jsFiles) {
      await this._analyzeFile(file);
    }
    
    this.log(`Analyzed ${this.results.totalFiles} files`, 'info');
  }

  /**
   * Finds all JavaScript files recursively.
   */
  async _findAllJSFiles() {
    const files = [];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
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
      this.log(`Error analyzing ${filePath}: ${error.message}`, 'error');
    }
  }

  /**
   * Extracts import statements from file content.
   */
  _extractImports(content) {
    const imports = [];
    const importRegex = /(?:const|let|var)\s+(\w+)\s*=\s*require\s*\((['"][^'"]+)['"]\s*\)/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const moduleName = match[1];
      const importPath = match[2];
      const lineNumber = content.substring(0, content.indexOf(match[0])).split('\n').length;
      
      imports.push({
        module: moduleName,
        path: importPath,
        line: lineNumber
      });
    }
    
    return imports;
  }

  /**
   * Extracts export statements from file content.
   */
  _extractExports(content) {
    const exports = [];
    
    // Check for module.exports
    const exportRegex = /module\.exports\s*=\s*require\s*\((['"][^'"]+)['"]\s*\)/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const moduleName = match[1];
      const lineNumber = content.substring(0, content.indexOf(match[0])).split('\n').length;
      
      exports.push({
        module: moduleName,
        path: null, // Direct export
        line: lineNumber
      });
    }
    
    // Check for class exports
    const classExportRegex = /class\s+(\w+)\s*{/g;
    const classMatch = classExportRegex.exec(content);
    if (classMatch) {
      const lineNumber = content.substring(0, content.indexOf(classMatch[0])).split('\n').length;
      exports.push({
        module: classMatch[1],
        path: null, // Class export
        line: lineNumber
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
      if (!this.results.dependencyGraph.has(imp.module)) {
        this.results.dependencyGraph.set(imp.module, {
          type: 'module',
          imports: [],
          exportedBy: [],
          importedBy: [fileName]
        });
      }
      
      this.results.dependencyGraph.get(imp.module).imports.push({
        from: fileName,
        path: imp.path,
        line: imp.line
      });
    }
    
    // Add nodes for exported modules
    for (const exp of exports) {
      if (!this.results.dependencyGraph.has(exp.module)) {
        this.results.dependencyGraph.set(exp.module, {
          type: 'module',
          imports: [],
          exportedBy: [fileName],
          importedBy: []
        });
      }
      
      this.results.dependencyGraph.get(exp.module).exportedBy.push(fileName);
    }
    
    // Link imports to exports
    for (const imp of imports) {
      for (const exp of exports) {
        if (exp.module === imp.module) {
          // Same file - not a dependency
          continue;
        }
        
        const node = this.results.dependencyGraph.get(imp.module);
        if (node && !node.importedBy.includes(exp.module) && !node.importedBy.includes(fileName)) {
          node.importedBy.push(exp.module);
        }
      }
    }
  }

  /**
   * Detects circular dependencies across the entire graph.
   */
  async _detectCircularDependencies() {
    this.log('Detecting Circular Dependencies...', 'info');
    
    for (const [module, node] of this.results.dependencyGraph) {
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
    
    this.log(`Detected ${this.results.circularDependencies.length} circular dependencies`, 'warn');
  }

  /**
   * Builds the dependency graph and detects circular dependencies.
   */
  async _buildDependencyGraph() {
    this.log('Building Dependency Graph...', 'info');
    
    for (const [module, node] of this.results.dependencyGraph) {
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
    
    this.log(`Processed ${this.results.dependencyGraph.size} modules`, 'info');
  }

  /**
   * Detects circular dependencies using DFS.
   */
  _detectCircularDependency(module, visited, path = []) {
    if (visited.has(module)) {
      return true; // Circular detected
    }
    
    visited.add(module);
    
    const node = this.results.dependencyGraph.get(module);
    if (!node) return false;
    
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
    const node = this.results.dependencyGraph.get(module);
    if (!node) return [];
    
    for (const imp of node.imports) {
      if (visited.has(imp.module)) {
        continue;
      }
      
      if (this._detectCircularDependency(imp.module, visited, [...visited, imp.module])) {
        return [...visited, imp.module, module];
      }
    }
    
    return [];
  }

  /**
   * Finds missing dependencies.
   */
  async _findMissingDependencies() {
    this.log('Checking for Missing Dependencies...', 'info');
    
    for (const [module, node] of this.results.dependencyGraph) {
      for (const imp of node.imports) {
        const impModule = this.results.dependencyGraph.get(imp.module);
        
        if (!impModule) {
          this.results.missingDependencies.push({
            requiredIn: module,
            requiredFrom: node.importedBy[0] || 'unknown',
            importPath: imp.path,
            type: 'missing_module'
          });
        }
      }
    }
    
    this.log(`Found ${this.results.missingDependencies.length} missing dependencies`, 'warn');
  }

  /**
   * Detects broken import/export links.
   */
  async _detectBrokenLinks() {
    this.log('Checking for Broken Links...', 'info');
    
    for (const [module, node] of this.results.dependencyGraph) {
      for (const imp of node.imports) {
        const impModule = this.results.dependencyGraph.get(imp.module);
        
        if (!impModule) {
          // Try to resolve the import path
          const fullPath = path.resolve(path.dirname(module), imp.path);
          
          if (!fs.existsSync(fullPath)) {
            this.results.brokenLinks.push({
              from: module,
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
    
    this.log(`Found ${this.results.brokenLinks.length} broken links`, 'warn');
  }

  /**
   * Detects orphaned modules (modules that are never imported).
   */
  async _detectOrphanedModules() {
    this.log('Checking for Orphaned Modules...', 'info');
    
    const allModules = new Set(this.results.dependencyGraph.keys());
    const importedModules = new Set();
    
    for (const [, node] of this.results.dependencyGraph) {
      for (const imp of node.imports) {
        importedModules.add(imp.module);
      }
    }
    
    for (const module of allModules) {
      if (!importedModules.has(module)) {
        const node = this.results.dependencyGraph.get(module);
        if (node.exportedBy.length > 0) {
          this.results.orphanedModules.push({
            module: module,
            file: node.importedBy[0] || 'unknown',
            exports: node.exportedBy.length,
            reason: 'Never imported but has exports'
          });
        }
      }
    }
    
    this.log(`Found ${this.results.orphanedModules.length} orphaned modules`, 'warn');
  }

  /**
   * Detects version conflicts in dependencies.
   */
  async _detectVersionConflicts() {
    this.log('Checking for Version Conflicts...', 'info');
    
    // This would require package.json analysis
    // For now, just note that we should check this
    this.results.recommendations.push('Implement package.json version conflict detection');
  }

  /**
   * Generates comprehensive dependency analysis report.
   */
  _generateReport(context) {
    console.log(context.colors.reset + '\n🔗 DEPENDENCY ANALYSIS REPORT');
    console.log('================================');
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`   Total Files Analyzed: ${this.results.totalFiles}`);
    console.log(`   Total Modules: ${this.results.dependencyGraph.size}`);
    console.log(`   Circular Dependencies: ${this.results.circularDependencies.length}`);
    console.log(`   Missing Dependencies: ${this.results.missingDependencies.length}`);
    console.log(`   Broken Links: ${this.results.brokenLinks.length}`);
    console.log(`   Orphaned Modules: ${this.results.orphanedModules.length}`);
    
    // Detailed Issues
    if (this.results.circularDependencies.length > 0) {
      console.log('\n🔄 CIRCULAR DEPENDENCIES:');
      for (const issue of this.results.circularDependencies) {
        console.log(context.colors.red + `   ${issue.cycle}` + context.colors.reset);
      }
    }
    
    if (this.results.missingDependencies.length > 0) {
      console.log('\n❌ MISSING DEPENDENCIES:');
      for (const issue of this.results.missingDependencies) {
        console.log(context.colors.red + `   ${issue.requiredIn} requires ${issue.requiredFrom} (${issue.importPath})` + context.colors.reset);
      }
    }
    
    if (this.results.brokenLinks.length > 0) {
      console.log('\n🔗 BROKEN LINKS:');
      for (const issue of this.results.brokenLinks) {
        console.log(context.colors.magenta + `   ${issue.from} → ${issue.to} (${issue.type})` + context.colors.reset);
        if (issue.resolvedPath) {
          console.log(context.colors.yellow + `     Expected at: ${issue.resolvedPath}` + context.colors.reset);
        }
      }
    }
    
    if (this.results.orphanedModules.length > 0) {
      console.log('\n👻 ORPHANED MODULES:');
      for (const issue of this.results.orphanedModules) {
        console.log(context.colors.yellow + `   ${issue.module} (${issue.file}) - ${issue.exports} exports` + context.colors.reset);
      }
    }
    
    // Recommendations
    console.log('\n🎯 RECOMMENDATIONS:');
    
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
      console.log(context.colors.cyan + `   - ${recommendation}` + context.colors.reset);
    }
    
    // Overall Health
    const totalIssues = this.results.circularDependencies.length + 
                        this.results.missingDependencies.length + 
                        this.results.brokenLinks.length + 
                        this.results.orphanedModules.length;
    
    if (totalIssues === 0) {
      console.log('\n✅ DEPENDENCY HEALTH: EXCELLENT');
    } else if (totalIssues <= 5) {
      console.log('\n✅ DEPENDENCY HEALTH: GOOD (' + totalIssues + ' issues)');
    } else {
      console.log('\n❌ DEPENDENCY HEALTH: POOR (' + totalIssues + ' issues)');
    }
  }

  /**
   * Saves analysis results to file
   */
  async _saveResults(context) {
    const outputDir = context.options['output-dir'] || path.join(context.bootstrapPath, 'reports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const resultsPath = path.join(outputDir, 'dependency-analysis-results.json');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const reportData = {
      timestamp,
      summary: {
        totalFiles: this.results.totalFiles,
        totalModules: this.results.dependencyGraph.size,
        circularDependencies: this.results.circularDependencies.length,
        missingDependencies: this.results.missingDependencies.length,
        brokenLinks: this.results.brokenLinks.length,
        orphanedModules: this.results.orphanedModules.length
      },
      issues: {
        circularDependencies: this.results.circularDependencies,
        missingDependencies: this.results.missingDependencies,
        brokenLinks: this.results.brokenLinks,
        orphanedModules: this.results.orphanedModules
      },
      recommendations: this.results.recommendations
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
    this.log(`Results saved to: ${resultsPath}`, 'info');
  }
}

module.exports = DependencyAnalyzerPlugin;
