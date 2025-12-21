/**
 * Interface Coverage Analysis Tool
 * Analyzes and reports interface compliance across the bootstrap system.
 */

const fs = require('fs');
const path = require('path');

class InterfaceCoverageTool {
  constructor() {
    this.bootstrapPath = path.join(__dirname, '..', 'bootstrap');
    this.interfacesPath = path.join(this.bootstrapPath, 'interfaces');
    this.results = {
      totalClasses: 0,
      compliantClasses: 0,
      interfaces: {},
      skeletonClasses: {},
      concreteClasses: {},
      missingImplementations: [],
      coverage: 0
    };
  }

  /**
   * Runs the complete interface coverage analysis.
   */
  async analyze() {
    console.log('🔍 Starting Interface Coverage Analysis...\n');
    
    await this._analyzeInterfaces();
    await this._analyzeSkeletonClasses();
    await this._analyzeConcreteClasses();
    await this._analyzeCompliance();
    
    this._generateReport();
    return this.results;
  }

  /**
   * Analyzes all interface definitions.
   */
  async _analyzeInterfaces() {
    console.log('📋 Analyzing Interface Definitions...');
    
    const interfaceFiles = await this._findFiles(this.interfacesPath, '.d.ts');
    
    for (const file of interfaceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const interfaceName = this._extractInterfaceName(content);
      
      this.results.interfaces[interfaceName] = {
        file: path.relative(this.bootstrapPath, file),
        methods: this._extractInterfaceMethods(content),
        type: 'interface'
      };
    }
    
    console.log(`   Found ${Object.keys(this.results.interfaces).length} interfaces`);
  }

  /**
   * Analyzes all skeleton class implementations.
   */
  async _analyzeSkeletonClasses() {
    console.log('🦴 Analyzing Skeleton Classes...');
    
    const interfaceFiles = await this._findFiles(this.interfacesPath, '.js');
    
    for (const file of interfaceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const className = this._extractClassName(content);
      
      if (className && className.startsWith('Base')) {
        this.results.skeletonClasses[className] = {
          file: path.relative(this.bootstrapPath, file),
          implements: this._extractImplements(content),
          methods: this._extractClassMethods(content)
        };
      }
    }
    
    console.log(`   Found ${Object.keys(this.results.skeletonClasses).length} skeleton classes`);
  }

  /**
   * Analyzes all concrete class implementations.
   */
  async _analyzeConcreteClasses() {
    console.log('🏗️ Analyzing Concrete Classes...');
    
    const allFiles = await this._getAllJavaScriptFiles();
    
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const className = this._extractClassName(content);
      
      if (className && !className.startsWith('Base') && className !== 'InterfaceCoverageTool') {
        this.results.concreteClasses[className] = {
          file: path.relative(this.bootstrapPath, file),
          extends: this._extractExtends(content),
          implements: this._extractImplements(content),
          methods: this._extractClassMethods(content),
          category: this._categorizeClass(file, className)
        };
        this.results.totalClasses++;
      }
    }
    
    console.log(`   Found ${Object.keys(this.results.concreteClasses).length} concrete classes`);
  }

  /**
   * Analyzes interface compliance across all classes.
   */
  async _analyzeCompliance() {
    console.log('✅ Analyzing Interface Compliance...');
    
    for (const [className, classInfo] of Object.entries(this.results.concreteClasses)) {
      const isCompliant = this._checkClassCompliance(className, classInfo);
      
      if (isCompliant.compliant) {
        this.results.compliantClasses++;
      } else {
        this.results.missingImplementations.push({
          class: className,
          file: classInfo.file,
          issues: isCompliant.issues
        });
      }
    }
    
    this.results.coverage = this.results.totalClasses > 0 
      ? Math.round((this.results.compliantClasses / this.results.totalClasses) * 100)
      : 0;
  }

  /**
   * Checks if a class complies with expected interface pattern.
   */
  _checkClassCompliance(className, classInfo) {
    const issues = [];
    const expectedInterface = this._getExpectedInterface(className, classInfo.category);
    
    if (!expectedInterface) {
      return { compliant: false, issues: ['No expected interface determined'] };
    }
    
    // Check if class extends appropriate base class
    const skeletonBase = `Base${expectedInterface.replace('I', '')}`;
    if (classInfo.extends !== skeletonBase && !classInfo.implements) {
      issues.push(`Should extend ${skeletonBase} or implement ${expectedInterface}`);
    }
    
    // Check if skeleton class exists
    if (!this.results.skeletonClasses[skeletonBase]) {
      issues.push(`Skeleton class ${skeletonBase} not found`);
    }
    
    return {
      compliant: issues.length === 0,
      issues: issues,
      expectedInterface: expectedInterface,
      skeletonBase: skeletonBase
    };
  }

  /**
   * Determines the expected interface for a class based on its category.
   */
  _getExpectedInterface(className, category) {
    const interfaceMap = {
      config: 'IConfig',
      registry: 'IRegistry',
      service: 'BaseService',
      factory: 'BaseFactory',
      controller: 'BaseController',
      helper: 'BaseHelper',
      initializer: 'IInitializer',
      environment: 'IEnvironment'
    };
    
    // Check class name patterns
    if (className.includes('Config') && category === 'config') return 'IConfig';
    if (className.includes('Registry') && category === 'registry') return 'IRegistry';
    if (className.includes('Initializer') && category === 'initializer') return 'IInitializer';
    if (className.includes('Handler') && category === 'global') return 'IGlobalHandler';
    if (className.includes('Controller') && category === 'controller') return 'BaseController';
    if (className.includes('Environment') && category === 'environment') return 'IEnvironment';
    
    return interfaceMap[category];
  }

  /**
   * Categorizes a class based on its file path and name.
   */
  _categorizeClass(filePath, className) {
    if (filePath.includes('configs/')) return 'config';
    if (filePath.includes('registries/')) return 'registry';
    if (filePath.includes('services/')) {
      if (className.includes('Initializer')) return 'initializer';
      if (className.includes('Environment')) return 'environment';
      return 'service';
    }
    if (filePath.includes('controllers/')) return 'controller';
    if (filePath.includes('constants/') && className.includes('Handler')) return 'global';
    if (filePath.includes('helpers/')) return 'helper';
    if (filePath.includes('factories/')) return 'factory';
    if (filePath.includes('entrypoints/')) return 'entrypoint';
    return 'unknown';
  }

  /**
   * Generates and displays the coverage report.
   */
  _generateReport() {
    console.log('\n📊 INTERFACE COVERAGE REPORT');
    console.log('================================');
    
    // Summary
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Classes: ${this.results.totalClasses}`);
    console.log(`   Compliant Classes: ${this.results.compliantClasses}`);
    console.log(`   Coverage: ${this.results.coverage}%`);
    console.log(`   Interfaces: ${Object.keys(this.results.interfaces).length}`);
    console.log(`   Skeleton Classes: ${Object.keys(this.results.skeletonClasses).length}`);
    
    // Interface Details
    console.log(`\n🔗 INTERFACES:`);
    for (const [name, info] of Object.entries(this.results.interfaces)) {
      console.log(`   ${name}: ${info.methods.length} methods`);
    }
    
    // Skeleton Class Details
    console.log(`\n🦴 SKELETON CLASSES:`);
    for (const [name, info] of Object.entries(this.results.skeletonClasses)) {
      console.log(`   ${name}: implements ${info.implements}`);
    }
    
    // Compliance Issues
    if (this.results.missingImplementations.length > 0) {
      console.log(`\n❌ COMPLIANCE ISSUES:`);
      for (const issue of this.results.missingImplementations) {
        console.log(`   ${issue.class} (${issue.file}):`);
        for (const problem of issue.issues) {
          console.log(`     - ${problem}`);
        }
      }
    } else {
      console.log(`\n✅ ALL CLASSES COMPLIANT!`);
    }
    
    // Coverage by Category
    console.log(`\n📋 COVERAGE BY CATEGORY:`);
    const categoryStats = this._calculateCategoryStats();
    for (const [category, stats] of Object.entries(categoryStats)) {
      const percentage = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
      console.log(`   ${category}: ${stats.compliant}/${stats.total} (${percentage}%)`);
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    this._generateRecommendations();
  }

  /**
   * Generates recommendations based on analysis results.
   */
  _generateRecommendations() {
    if (this.results.coverage < 50) {
      console.log('   - Priority: Update remaining classes to extend skeleton classes');
    }
    
    if (this.results.missingImplementations.length > 0) {
      console.log('   - Fix compliance issues in identified classes');
      console.log('   - Update TypeScript declarations to implement interfaces');
    }
    
    if (Object.keys(this.results.interfaces).length === 0) {
      console.log('   - Create missing interface definitions');
    }
    
    if (Object.keys(this.results.skeletonClasses).length === 0) {
      console.log('   - Create skeleton class implementations');
    }
  }

  /**
   * Calculates compliance statistics by category.
   */
  _calculateCategoryStats() {
    const stats = {};
    
    for (const [className, classInfo] of Object.entries(this.results.concreteClasses)) {
      const category = classInfo.category;
      if (!stats[category]) {
        stats[category] = { total: 0, compliant: 0 };
      }
      stats[category].total++;
      
      const isCompliant = this._checkClassCompliance(className, classInfo).compliant;
      if (isCompliant) {
        stats[category].compliant++;
      }
    }
    
    return stats;
  }

  /**
   * Gets all JavaScript files in the bootstrap directory.
   */
  async _getAllJavaScriptFiles() {
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
   * Finds files matching a pattern in a directory.
   */
  async _findFiles(dir, pattern) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (item.endsWith(pattern)) {
        files.push(path.join(dir, item));
      }
    }
    
    return files;
  }

  /**
   * Extracts interface name from TypeScript content.
   */
  _extractInterfaceName(content) {
    const match = content.match(/export interface (\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Extracts class name from JavaScript content.
   */
  _extractClassName(content) {
    const match = content.match(/class (\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Extracts extends clause from class definition.
   */
  _extractExtends(content) {
    const match = content.match(/class \w+ extends (\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Extracts implements clause from class definition.
   */
  _extractImplements(content) {
    const match = content.match(/implements (\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Extracts method names from TypeScript interface.
   */
  _extractInterfaceMethods(content) {
    const methodMatches = content.matchAll(/(\w+)\([^)]*\):/g);
    return methodMatches ? methodMatches.map(match => match[1]) : [];
  }

  /**
   * Extracts method names from JavaScript class.
   */
  _extractClassMethods(content) {
    const methodMatches = content.matchAll(/(\w+)\([^)]*\):/g);
    return methodMatches ? methodMatches.map(match => match[1]) : [];
  }
}

// CLI execution
if (require.main === module) {
  const tool = new InterfaceCoverageTool();
  
  tool.analyze().then(results => {
    console.log('\n🎉 Analysis Complete!');
    process.exit(results.missingImplementations.length > 0 ? 1 : 0);
  }).catch(error => {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  });
}

module.exports = InterfaceCoverageTool;
