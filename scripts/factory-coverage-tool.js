/**
 * Factory Coverage Analysis Tool
 * Analyzes and reports factory class compliance across the bootstrap system.
 */

const fs = require('fs');
const path = require('path');
const InterfaceCoverageTool = require('./interface-coverage-tool.js');

class FactoryCoverageTool {
  constructor() {
    this.bootstrapPath = path.join(__dirname, '..', 'bootstrap');
    this.interfacesPath = path.join(this.bootstrapPath, 'interfaces');
    this.results = {
      totalFactories: 0,
      compliantFactories: 0,
      factories: {},
      missingBaseFactory: false,
      recommendations: []
    };
  }

  /**
   * Runs a complete factory coverage analysis.
   */
  async analyze() {
    console.log('🏭 Starting Factory Coverage Analysis...\n');
    
    await this._analyzeBaseFactoryInterface();
    await this._analyzeFactoryClasses();
    await this._analyzeCompliance();
    
    this._generateReport();
    return this.results;
  }

  /**
   * Analyzes the BaseFactory interface definition.
   */
  async _analyzeBaseFactoryInterface() {
    console.log('📋 Analyzing BaseFactory Interface...');
    
    const baseFactoryFile = path.join(this.interfacesPath, 'base-factory.d.ts');
    
    if (fs.existsSync(baseFactoryFile)) {
      const content = fs.readFileSync(baseFactoryFile, 'utf8');
      const methods = this._extractInterfaceMethods(content);
      
      this.results.baseFactoryInterface = {
        file: 'base-factory.d.ts',
        methods: methods,
        found: true
      };
      
      console.log(`   Found BaseFactory interface with ${methods.length} methods`);
    } else {
      this.results.missingBaseFactory = true;
      this.results.recommendations.push('Create BaseFactory interface definition');
      console.log('   ❌ BaseFactory interface not found');
    }
  }

  /**
   * Analyzes all factory classes in the codebase.
   */
  async _analyzeFactoryClasses() {
    console.log('🏭 Analyzing Factory Classes...');
    
    const factoryFiles = await this._findFactoryFiles();
    
    for (const file of factoryFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const className = this._extractClassName(content);
      
      this.results.factories[className] = {
        file: path.relative(this.bootstrapPath, file),
        extends: this._extractExtends(content),
        implements: this._extractImplements(content),
        methods: this._extractClassMethods(content),
        category: this._categorizeFactory(file, className)
      };
      
      this.results.totalFactories++;
    }
    
    console.log(`   Found ${Object.keys(this.results.factories).length} factory classes`);
  }

  /**
   * Analyzes compliance of factory classes with BaseFactory pattern.
   */
  async _analyzeCompliance() {
    console.log('✅ Analyzing Factory Compliance...');
    
    for (const [className, classInfo] of Object.entries(this.results.factories)) {
      const isCompliant = this._checkFactoryCompliance(className, classInfo);
      
      if (isCompliant.compliant) {
        this.results.compliantFactories++;
      } else {
        this.results.recommendations.push(`Update ${className} to extend BaseFactory or implement BaseFactory interface`);
      }
    }
  }

  /**
   * Checks if a factory class complies with BaseFactory pattern.
   */
  _checkFactoryCompliance(className, classInfo) {
    const issues = [];
    
    // Check if class extends BaseFactory
    if (classInfo.extends !== 'BaseFactory' && !classInfo.implements) {
      issues.push('Should extend BaseFactory or implement BaseFactory interface');
    }
    
    // Check if BaseFactory exists
    if (this.results.missingBaseFactory) {
      issues.push('BaseFactory interface not available');
    }
    
    return {
      compliant: issues.length === 0,
      issues: issues,
      expectedPattern: 'extends BaseFactory or implements BaseFactory'
    };
  }

  /**
   * Finds all factory files in the bootstrap system.
   */
  async _findFactoryFiles() {
    const factoryFiles = [];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('-factory.js')) {
          factoryFiles.push(fullPath);
        }
      }
    };
    
    // Scan all directories that might contain factories
    const factoryDirs = ['factories', 'factories/cdn', 'factories/core', 'factories/local', 'factories/services'];
    
    for (const dir of factoryDirs) {
      const fullPath = path.join(this.bootstrapPath, dir);
      if (fs.existsSync(fullPath)) {
        scanDirectory(fullPath);
      }
    }
    
    return factoryFiles;
  }

  /**
   * Categorizes a factory class based on its location and name.
   */
  _categorizeFactory(filePath, className) {
    if (filePath.includes('factories/cdn/')) return 'cdn';
    if (filePath.includes('factories/core/')) return 'core';
    if (filePath.includes('factories/local/')) return 'local';
    if (filePath.includes('factories/services/')) return 'services';
    
    // Fallback to naming patterns
    if (className.includes('CDN')) return 'cdn';
    if (className.includes('Core')) return 'core';
    if (className.includes('Local')) return 'local';
    if (className.includes('Service')) return 'services';
    
    return 'unknown';
  }

  /**
   * Generates and displays the factory coverage report.
   */
  _generateReport() {
    console.log('\n🏭 FACTORY COVERAGE REPORT');
    console.log('================================');
    
    // Summary
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Factories: ${this.results.totalFactories}`);
    console.log(`   Compliant Factories: ${this.results.compliantFactories}`);
    
    const coverage = this.results.totalFactories > 0 
      ? Math.round((this.results.compliantFactories / this.results.totalFactories) * 100)
      : 0;
    console.log(`   Coverage: ${coverage}%`);
    
    // Base Factory Interface Status
    if (this.results.baseFactoryInterface) {
      console.log(`\n📋 BASE FACTORY INTERFACE:`);
      console.log(`   Methods: ${this.results.baseFactoryInterface.methods.join(', ')}`);
    } else {
      console.log(`\n❌ BASE FACTORY INTERFACE: Missing`);
    }
    
    // Factory Class Details
    console.log(`\n🏭 FACTORY CLASSES:`);
    for (const [name, info] of Object.entries(this.results.factories)) {
      const status = info.extends === 'BaseFactory' || info.implements ? '✅' : '❌';
      console.log(`   ${status} ${name} (${info.category}): ${info.extends || 'No extends'}`);
    }
    
    // Compliance Issues
    const nonCompliantFactories = Object.entries(this.results.factories)
      .filter(([name, info]) => {
        const compliance = this._checkFactoryCompliance(name, info);
        return !compliance.compliant;
      });
    
    if (nonCompliantFactories.length > 0) {
      console.log(`\n❌ COMPLIANCE ISSUES:`);
      for (const [name, info] of nonCompliantFactories) {
        const compliance = this._checkFactoryCompliance(name, info);
        for (const issue of compliance.issues) {
          console.log(`   ${name}: ${issue}`);
        }
      }
    } else {
      console.log(`\n✅ ALL FACTORIES COMPLIANT!`);
    }
    
    // Recommendations
    console.log(`\n🎯 RECOMMENDATIONS:`);
    for (const recommendation of this.results.recommendations) {
      console.log(`   - ${recommendation}`);
    }
    
    if (this.results.missingBaseFactory) {
      console.log(`\n📋 URGENT: Create BaseFactory interface to enable proper factory patterns`);
    }
    
    // Coverage by Category
    console.log(`\n📊 COVERAGE BY CATEGORY:`);
    const categoryStats = this._calculateCategoryStats();
    for (const [category, stats] of Object.entries(categoryStats)) {
      const percentage = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
      console.log(`   ${category}: ${stats.compliant}/${stats.total} (${percentage}%)`);
    }
  }

  /**
   * Calculates factory compliance statistics by category.
   */
  _calculateCategoryStats() {
    const stats = {
      cdn: { total: 0, compliant: 0 },
      core: { total: 0, compliant: 0 },
      local: { total: 0, compliant: 0 },
      services: { total: 0, compliant: 0 }
    };
    
    for (const [className, classInfo] of Object.entries(this.results.factories)) {
      const category = classInfo.category;
      if (stats[category]) {
        stats[category].total++;
        
        const isCompliant = this._checkFactoryCompliance(className, classInfo).compliant;
        if (isCompliant) {
          stats[category].compliant++;
        }
      }
    }
    
    return stats;
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
  const tool = new FactoryCoverageTool();
  
  tool.analyze().then(results => {
    console.log('\n🎉 Factory Analysis Complete!');
    process.exit(results.missingBaseFactory || results.compliantFactories < results.totalFactories ? 1 : 0);
  }).catch(error => {
    console.error('❌ Factory analysis failed:', error.message);
    process.exit(1);
  });
}

module.exports = FactoryCoverageTool;
