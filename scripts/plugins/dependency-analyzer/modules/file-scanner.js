/**
 * File Scanner Module
 * Scans directory for JavaScript files and analyzes dependencies
 */

const fs = require('fs');
const path = require('path');

const FileScanner = {
  /**
   * Scans all JavaScript files in directory
   * @param {string} directory - Directory to scan
   * @param {Object} results - Results object to update
   */
  async scanAllFiles(directory, results) {
    this.log('Scanning Files for Dependencies...', 'info');
    
    const jsFiles = this.findAllJSFiles(directory);
    
    for (const file of jsFiles) {
      await this.analyzeFile(file, directory, results);
    }
    
    results.totalFiles = results.processedFiles.size;
    this.log(`Analyzed ${results.totalFiles} files`, 'info');
  },

  /**
   * Finds all JavaScript files recursively
   * @param {string} directory - Base directory
   * @returns {Array} - Array of file paths
   */
  findAllJSFiles(directory) {
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
    
    scanDirectory(directory);
    return files;
  },

  /**
   * Analyzes a single file for dependencies
   * @param {string} filePath - File path
   * @param {string} basePath - Base path for relative calculations
   * @param {Object} results - Results object
   */
  async analyzeFile(filePath, basePath, results) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(basePath, filePath);
      
      const imports = this.extractImports(content);
      const exports = this.extractExports(content);
      
      results.processedFiles.add(filePath);
      
      this.addFileToGraph(relativePath, imports, exports, results);
      
    } catch (error) {
      console.error(`Error analyzing ${filePath}: ${error.message}`);
    }
  },

  /**
   * Extracts import statements from content
   * @param {string} content - File content
   * @returns {Array} - Array of imports
   */
  extractImports(content) {
    const imports = [];
    const importRegex = /(?:const|let|var)\s+(\w+)\s*=\s*require\s*\((['"])([^'"]+)\1\s*\)/g;
    
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
  },

  /**
   * Extracts export statements from content
   * @param {string} content - File content
   * @returns {Array} - Array of exports
   */
  extractExports(content) {
    const exports = [];
    
    // module.exports = require(...)
    const exportRegex = /module\.exports\s*=\s*require\s*\((['"])([^'"]+)\1\s*\)/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const moduleName = match[1];
      const lineNumber = content.substring(0, content.indexOf(match[0])).split('\n').length;
      
      exports.push({
        module: moduleName,
        path: null,
        line: lineNumber
      });
    }
    
    // Class exports
    const classExportRegex = /class\s+(\w+)\s*{/g;
    const classMatch = classExportRegex.exec(content);
    if (classMatch) {
      const lineNumber = content.substring(0, content.indexOf(classMatch[0])).split('\n').length;
      exports.push({
        module: classMatch[1],
        path: null,
        line: lineNumber
      });
    }
    
    return exports;
  },

  /**
   * Adds file to dependency graph
   * @param {string} filePath - File path
   * @param {Array} imports - Import statements
   * @param {Array} exports - Export statements
   * @param {Object} results - Results object
   */
  addFileToGraph(filePath, imports, exports, results) {
    const fileName = path.basename(filePath, '.js');
    
    // Add imported modules
    for (const imp of imports) {
      if (!results.dependencyGraph.has(imp.module)) {
        results.dependencyGraph.set(imp.module, {
          type: 'module',
          imports: [],
          exportedBy: [],
          importedBy: [fileName]
        });
      }
      
      results.dependencyGraph.get(imp.module).imports.push({
        from: fileName,
        path: imp.path,
        line: imp.line
      });
    }
    
    // Add exported modules
    for (const exp of exports) {
      if (!results.dependencyGraph.has(exp.module)) {
        results.dependencyGraph.set(exp.module, {
          type: 'module',
          imports: [],
          exportedBy: [fileName],
          importedBy: []
        });
      }
      
      results.dependencyGraph.get(exp.module).exportedBy.push(fileName);
    }
  }
};

module.exports = FileScanner;
