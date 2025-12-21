#!/usr/bin/env node

/**
 * Unit tests for Dependency Analyzer
 * Tests the dependency analysis functionality with various scenarios
 */

const fs = require('fs');
const path = require('path');
const DependencyAnalyzer = require('../dependency-analyzer.js');

class TestDependencyAnalyzer {
  constructor() {
    this.testResults = [];
    this.tempDir = null;
  }

  /**
   * Run all tests and return results
   */
  async runAllTests() {
    console.log('🧪 Running Dependency Analyzer Unit Tests...\n');
    
    await this.testExtractImports();
    await this.testExtractExports();
    await this.testCircularDependencyDetection();
    await this.testMissingDependencyDetection();
    await this.testOrphanedModuleDetection();
    await this.testBrokenLinkDetection();
    await this.testDependencyGraphBuilding();
    
    this.printResults();
    return this.testResults;
  }

  /**
   * Test import extraction functionality
   */
  async testExtractImports() {
    const testName = 'Extract Imports';
    const testCases = [
      {
        name: 'Simple require',
        code: 'const fs = require("fs");',
        expected: [{ module: 'fs', path: '"fs"' }]
      },
      {
        name: 'Multiple requires',
        code: 'const path = require("path");\nconst utils = require("./utils");',
        expected: [
          { module: 'path', path: '"path"' },
          { module: 'utils', path: '"./utils"' }
        ]
      },
      {
        name: 'No imports',
        code: 'const localVar = 1;',
        expected: []
      }
    ];

    for (const testCase of testCases) {
      try {
        const analyzer = new DependencyAnalyzer();
        const imports = analyzer._extractImports(testCase.code);
        
        if (this.arraysEqual(imports, testCase.expected, (a, b) => a.module === b.module && a.path === b.path)) {
          this.addTestResult(`${testName} - ${testCase.name}`, true);
        } else {
          this.addTestResult(`${testName} - ${testCase.name}`, false, 
            `Expected ${JSON.stringify(testCase.expected)}, got ${JSON.stringify(imports)}`);
        }
      } catch (error) {
        this.addTestResult(`${testName} - ${testCase.name}`, false, error.message);
      }
    }
  }

  /**
   * Test export extraction functionality
   */
  async testExtractExports() {
    const testName = 'Extract Exports';
    const testCases = [
      {
        name: 'Class export',
        code: 'class MyClass {}',
        expected: [{ module: 'MyClass', path: null }]
      },
      {
        name: 'Module export',
        code: 'module.exports = require("./other");',
        expected: [{ module: './other', path: null }]
      },
      {
        name: 'No exports',
        code: 'const localVar = 1;',
        expected: []
      }
    ];

    for (const testCase of testCases) {
      try {
        const analyzer = new DependencyAnalyzer();
        const exports = analyzer._extractExports(testCase.code);
        
        if (this.arraysEqual(exports, testCase.expected, (a, b) => a.module === b.module && a.path === b.path)) {
          this.addTestResult(`${testName} - ${testCase.name}`, true);
        } else {
          this.addTestResult(`${testName} - ${testCase.name}`, false,
            `Expected ${JSON.stringify(testCase.expected)}, got ${JSON.stringify(exports)}`);
        }
      } catch (error) {
        this.addTestResult(`${testName} - ${testCase.name}`, false, error.message);
      }
    }
  }

  /**
   * Test circular dependency detection
   */
  async testCircularDependencyDetection() {
    const testName = 'Circular Dependency Detection';
    
    try {
      const tempDir = await this.createTempDirectory();
      await this.createTestFiles(tempDir, [
        { name: 'a.js', content: 'const b = require("./b");' },
        { name: 'b.js', content: 'const a = require("./a");' }
      ]);

      const analyzer = new DependencyAnalyzer();
      analyzer.bootstrapPath = tempDir;
      
      await analyzer._scanAllFiles();
      await analyzer._buildDependencyGraph();
      await analyzer._detectCircularDependencies();

      const hasCircular = analyzer.results.circularDependencies.length > 0;
      this.addTestResult(testName, hasCircular, 
        hasCircular ? 'Correctly detected circular dependency' : 'Failed to detect circular dependency');
      
      await this.cleanupTempDirectory(tempDir);
    } catch (error) {
      this.addTestResult(testName, false, error.message);
    }
  }

  /**
   * Test missing dependency detection
   */
  async testMissingDependencyDetection() {
    const testName = 'Missing Dependency Detection';
    
    try {
      const tempDir = await this.createTempDirectory();
      await this.createTestFiles(tempDir, [
        { name: 'main.js', content: 'const missing = require("./nonexistent");' }
      ]);

      const analyzer = new DependencyAnalyzer();
      analyzer.bootstrapPath = tempDir;
      
      await analyzer._scanAllFiles();
      await analyzer._buildDependencyGraph();
      await analyzer._findMissingDependencies();

      const hasMissing = analyzer.results.missingDependencies.length > 0;
      this.addTestResult(testName, hasMissing,
        hasMissing ? 'Correctly detected missing dependency' : 'Failed to detect missing dependency');
      
      await this.cleanupTempDirectory(tempDir);
    } catch (error) {
      this.addTestResult(testName, false, error.message);
    }
  }

  /**
   * Test orphaned module detection
   */
  async testOrphanedModuleDetection() {
    const testName = 'Orphaned Module Detection';
    
    try {
      const tempDir = await this.createTempDirectory();
      await this.createTestFiles(tempDir, [
        { name: 'orphaned.js', content: 'class OrphanedClass {}' },
        { name: 'main.js', content: 'const used = require("./used");' }
      ]);

      const analyzer = new DependencyAnalyzer();
      analyzer.bootstrapPath = tempDir;
      
      await analyzer._scanAllFiles();
      await analyzer._buildDependencyGraph();
      await analyzer._detectOrphanedModules();

      const hasOrphaned = analyzer.results.orphanedModules.length > 0;
      this.addTestResult(testName, hasOrphaned,
        hasOrphaned ? 'Correctly detected orphaned module' : 'Failed to detect orphaned module');
      
      await this.cleanupTempDirectory(tempDir);
    } catch (error) {
      this.addTestResult(testName, false, error.message);
    }
  }

  /**
   * Test broken link detection
   */
  async testBrokenLinkDetection() {
    const testName = 'Broken Link Detection';
    
    try {
      const tempDir = await this.createTempDirectory();
      await this.createTestFiles(tempDir, [
        { name: 'main.js', content: 'const missing = require("./nonexistent.js");' }
      ]);

      const analyzer = new DependencyAnalyzer();
      analyzer.bootstrapPath = tempDir;
      
      await analyzer._scanAllFiles();
      await analyzer._buildDependencyGraph();
      await analyzer._detectBrokenLinks();

      const hasBroken = analyzer.results.brokenLinks.length > 0;
      this.addTestResult(testName, hasBroken,
        hasBroken ? 'Correctly detected broken link' : 'Failed to detect broken link');
      
      await this.cleanupTempDirectory(tempDir);
    } catch (error) {
      this.addTestResult(testName, false, error.message);
    }
  }

  /**
   * Test dependency graph building
   */
  async testDependencyGraphBuilding() {
    const testName = 'Dependency Graph Building';
    
    try {
      const tempDir = await this.createTempDirectory();
      await this.createTestFiles(tempDir, [
        { name: 'a.js', content: 'const b = require("./b"); class A {}' },
        { name: 'b.js', content: 'const c = require("./c"); class B {}' },
        { name: 'c.js', content: 'class C {}' }
      ]);

      const analyzer = new DependencyAnalyzer();
      analyzer.bootstrapPath = tempDir;
      
      await analyzer._scanAllFiles();
      await analyzer._buildDependencyGraph();

      const graphSize = analyzer.dependencyGraph.size;
      const expectedSize = 4; // a, b, c modules plus b dependency
      
      this.addTestResult(testName, graphSize >= 3,
        `Expected at least 3 nodes in dependency graph, got ${graphSize}`);
      
      await this.cleanupTempDirectory(tempDir);
    } catch (error) {
      this.addTestResult(testName, false, error.message);
    }
  }

  /**
   * Create a temporary directory for testing
   */
  async createTempDirectory() {
    const os = require('os');
    const tempDir = path.join(os.tmpdir(), `dep-analyzer-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    return tempDir;
  }

  /**
   * Create test files in the specified directory
   */
  async createTestFiles(dir, files) {
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      fs.writeFileSync(filePath, file.content, 'utf8');
    }
  }

  /**
   * Clean up temporary directory
   */
  async cleanupTempDirectory(dir) {
    const rimraf = require('rimraf');
    return new Promise((resolve, reject) => {
      rimraf(dir, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  /**
   * Add test result
   */
  addTestResult(testName, passed, message = '') {
    this.testResults.push({
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Compare arrays with custom comparator
   */
  arraysEqual(arr1, arr2, comparator) {
    if (arr1.length !== arr2.length) return false;
    
    for (let i = 0; i < arr1.length; i++) {
      if (!comparator(arr1[i], arr2[i])) return false;
    }
    
    return true;
  }

  /**
   * Print test results
   */
  printResults() {
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    console.log(`\n📊 Test Results: ${passed}/${total} passed\n`);
    
    for (const result of this.testResults) {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
      if (result.message) {
        console.log(`   ${result.message}`);
      }
    }
    
    console.log(`\n🎯 Overall: ${passed === total ? 'ALL TESTS PASSED' : `${total - passed} tests failed`}`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new TestDependencyAnalyzer();
  tester.runAllTests().then(results => {
    const failed = results.filter(r => !r.passed).length;
    process.exit(failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = TestDependencyAnalyzer;
