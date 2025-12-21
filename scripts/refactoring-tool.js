#!/usr/bin/env node

/**
 * Unified Refactoring Tool
 * Analyzes and reports interface compliance across the entire bootstrap system.
 * Provides specialized analysis for different class types (factories, services, configs, etc.).
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

class UnifiedRefactoringTool {
  constructor() {
    this.bootstrapPath = path.join(__dirname, '..', 'bootstrap');
    this.interfacesPath = path.join(this.bootstrapPath, 'interfaces');
    this.results = {
      total: 0,
      compliant: 0,
      byCategory: {
        config: { total: 0, compliant: 0, percentage: 0 },
        registry: { total: 0, compliant: 0, percentage: 0 },
        service: { total: 0, compliant: 0, percentage: 0 },
        factory: { total: 0, compliant: 0, percentage: 0 },
        controller: { total: 0, compliant: 0, percentage: 0 },
        helper: { total: 0, compliant: 0, percentage: 0 },
        initializer: { total: 0, compliant: 0, percentage: 0 },
        environment: { total: 0, compliant: 0, percentage: 0 },
        global: { total: 0, compliant: 0, percentage: 0 }
      },
      interfaces: {},
      skeletonClasses: {},
      recommendations: [],
      coverage: 0
    };
  }

  /**
   * Runs comprehensive refactoring analysis.
   */
  async analyze(options = {}) {
    console.log(colorize('\n🔧 Revolutionary Way To Serve Up React Apps', colors.cyan));
    console.log(colorize('📊 Unified Refactoring Tool', colors.blue));
    console.log(colorize('=' .repeat(50), colors.white));
    
    console.log(colorize(`\n🎯 Analysis Mode: ${options.factoryOnly ? 'Factory-Only' : 'Complete'}`, colors.magenta));
    
    await this._analyzeInterfaces();
    
    if (options.factoryOnly) {
      await this._analyzeFactories();
    } else {
      await this._analyzeAllClasses();
    }
    
    await this._generateReport();
    return this.results;
  }

  /**
   * Analyzes all interface definitions.
   */
  async _analyzeInterfaces() {
    console.log(colorize('\n📋 Analyzing Interface Definitions...', colors.blue));
    
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
    
    console.log(colorize(`   Found ${Object.keys(this.results.interfaces).length} interfaces`, colors.green));
  }

  /**
   * Analyzes all skeleton classes.
   */
  async _analyzeSkeletonClasses() {
    console.log(colorize('\n🦴 Analyzing Skeleton Classes...', colors.yellow));
    
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
    
    console.log(colorize(`   Found ${Object.keys(this.results.skeletonClasses).length} skeleton classes`, colors.green));
  }

  /**
   * Analyzes all concrete classes in the system.
   */
  async _analyzeAllClasses() {
    console.log(colorize('\n🏗️ Analyzing All Classes...', colors.cyan));
    
    const allFiles = await this._getAllJavaScriptFiles();
    
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const className = this._extractClassName(content);
      
      if (className && !className.startsWith('Base') && className !== 'UnifiedRefactoringTool') {
        const category = this._categorizeClass(file, className);
        const expectedInterface = this._getExpectedInterface(className, category);
        const isCompliant = this._checkClassCompliance(className, category, expectedInterface);
        
        // Update category totals
        if (!this.results.byCategory[category]) {
          this.results.byCategory[category] = { total: 0, compliant: 0 };
        }
        this.results.byCategory[category].total++;
        this.results.total++;
        
        if (isCompliant.compliant) {
          this.results.byCategory[category].compliant++;
          this.results.compliant++;
        }
        
        this.results.byCategory[category][className] = {
          file: path.relative(this.bootstrapPath, file),
          extends: this._extractExtends(content),
          implements: this._extractImplements(content),
          methods: this._extractClassMethods(content),
          category: category,
          compliant: isCompliant.compliant
        };
      }
    }
    
    console.log(colorize(`   Analyzed ${this.results.total} classes across all categories`, colors.green));
  }

  /**
   * Analyzes factory classes specifically.
   */
  async _analyzeFactories() {
    console.log(colorize('\n🏭 Analyzing Factory Classes...', colors.magenta));
    
    const factoryFiles = await this._findFactoryFiles();
    
    for (const file of factoryFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const className = this._extractClassName(content);
      
      this.results.byCategory.factory.total++;
      this.results.total++;
      
      const isCompliant = this._checkFactoryCompliance(className, content);
      
      this.results.byCategory.factory[className] = {
        file: path.relative(this.bootstrapPath, file),
        extends: this._extractExtends(content),
        implements: this._extractImplements(content),
        methods: this._extractClassMethods(content),
        category: 'factory',
        compliant: isCompliant.compliant
      };
      
      if (isCompliant.compliant) {
        this.results.byCategory.factory.compliant++;
        this.results.compliant++;
      }
    }
    
    console.log(colorize(`   Found ${this.results.byCategory.factory.total} factory classes`, colors.green));
  }

  /**
   * Checks factory class compliance.
   */
  _checkFactoryCompliance(className, content) {
    const issues = [];
    
    // Check if extends BaseFactory
    if (!content.includes('extends BaseFactory')) {
      issues.push('Should extend BaseFactory');
    }
    
    // Check if implements interface (alternative to extending BaseFactory)
    if (!content.includes('implements BaseFactory') && !content.includes('extends BaseFactory')) {
      issues.push('Should extend BaseFactory or implement BaseFactory interface');
    }
    
    // Check for required factory methods
    const requiredMethods = ['initialize', 'create', 'getDependency'];
    for (const method of requiredMethods) {
      if (!content.includes(`${method}(`)) {
        issues.push(`Missing required method: ${method}`);
      }
    }
    
    return {
      compliant: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Finds all factory files in the system.
   */
  async _findFactoryFiles() {
    const factoryFiles = [];
    
    const factoryDirs = ['factories', 'factories/cdn', 'factories/core', 'factories/local', 'factories/services'];
    
    for (const dir of factoryDirs) {
      const fullPath = path.join(this.bootstrapPath, dir);
      if (fs.existsSync(fullPath)) {
        const items = fs.readdirSync(fullPath);
        for (const item of items) {
          if (item.endsWith('-factory.js')) {
            factoryFiles.push(path.join(fullPath, item));
          }
        }
      }
    }
    
    return factoryFiles;
  }

  /**
   * Generates comprehensive refactoring report.
   */
  async _generateReport() {
    console.log(colorize('\n📊 UNIFIED REFACTORING REPORT', colors.cyan));
    console.log(colorize('================================', colors.white));
    
    // Calculate overall coverage
    for (const category of Object.keys(this.results.byCategory)) {
      const cat = this.results.byCategory[category];
      cat.percentage = cat.total > 0 ? Math.round((cat.compliant / cat.total) * 100) : 0;
    }
    
    this.results.coverage = this.results.total > 0 
      ? Math.round((this.results.compliant / this.results.total) * 100)
      : 0;
    
    // Summary
    console.log(colorize(`\n📈 SUMMARY:`, colors.green));
    console.log(colorize(`   Total Classes: ${this.results.total}`, colors.white));
    console.log(colorize(`   Compliant: ${this.results.compliant}`, colors.green));
    console.log(colorize(`   Coverage: ${this.results.coverage}%`, colors.yellow));
    
    // Interface Status
    console.log(colorize(`\n🔗 INTERFACES:`, colors.blue));
    for (const [name, info] of Object.entries(this.results.interfaces)) {
      console.log(colorize(`   ${name}: ${info.methods.length} methods`, colors.cyan));
    }
    
    // Skeleton Classes
    console.log(colorize(`\n🦴 SKELETON CLASSES:`, colors.yellow));
    for (const [name, info] of Object.entries(this.results.skeletonClasses)) {
      console.log(colorize(`   ${name}: implements ${info.implements}`, colors.cyan));
    }
    
    // Coverage by Category
    console.log(colorize(`\n📊 COVERAGE BY CATEGORY:`, colors.magenta));
    for (const [category, stats] of Object.entries(this.results.byCategory)) {
      const percentage = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
      const bar = this._createProgressBar(stats.compliant, stats.total, 20);
      console.log(colorize(`   ${category.charAt(0).toUpperCase() + category.slice(1)}: ${stats.compliant}/${stats.total} (${percentage}%) ${bar}`, colors.white));
    }
    
    // Recommendations
    console.log(colorize(`\n🎯 RECOMMENDATIONS:`, colors.green));
    if (this.results.recommendations.length > 0) {
      for (const recommendation of this.results.recommendations) {
        console.log(colorize(`   - ${recommendation}`, colors.cyan));
      }
    }
    
    // Success/Failure Status
    if (this.results.coverage === 100) {
      console.log(colorize(`\n🎉 SUCCESS: All classes comply with interface patterns!`, colors.green));
    } else if (this.results.coverage >= 80) {
      console.log(colorize(`\n✅ GOOD: ${this.results.coverage}% coverage achieved`, colors.yellow));
    } else if (this.results.coverage >= 50) {
      console.log(colorize(`\n⚠️  MODERATE: ${this.results.coverage}% coverage - room for improvement`, colors.yellow));
    } else {
      console.log(colorize(`\n❌ POOR: ${this.results.coverage}% coverage - significant refactoring needed`, colors.red));
    }
  }

  /**
   * Creates a visual progress bar.
   */
  _createProgressBar(completed, total, width = 20) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const filled = Math.round((width * percentage) / 100);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}%`;
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
    if (filePath.includes('constants/')) return 'global';
    if (filePath.includes('helpers/')) return 'helper';
    if (filePath.includes('factories/')) return 'factory';
    if (filePath.includes('entrypoints/')) return 'entrypoint';
    return 'unknown';
  }

  /**
   * Determines the expected interface for a class category.
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
      environment: 'IEnvironment',
      global: 'IGlobalHandler'
    };
    
    // Check class name patterns
    if (className.includes('Config') && category === 'config') return 'IConfig';
    if (className.includes('Registry') && category === 'registry') return 'IRegistry';
    if (className.includes('Factory')) return 'BaseFactory';
    
    return interfaceMap[category];
  }

  /**
   * Checks if a class complies with expected interface pattern.
   */
  _checkClassCompliance(className, category, expectedInterface) {
    const issues = [];
    
    if (!expectedInterface) {
      return { compliant: false, issues: ['No expected interface determined'] };
    }
    
    // Check if class extends appropriate base class
    const skeletonBase = `Base${expectedInterface.replace('I', '')}`;
    const classInfo = this.results.byCategory[category]?.[className];
    
    if (!classInfo || (classInfo.extends !== skeletonBase && !classInfo.implements)) {
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
  const args = process.argv.slice(2);
  const options = {
    factoryOnly: args.includes('--factory-only')
  };
  
  const tool = new UnifiedRefactoringTool();
  
  tool.analyze(options).then(results => {
    console.log(colorize('\n🎉 Refactoring Analysis Complete!', colors.green));
    
    if (results.coverage === 100) {
      console.log(colorize('🎉 PERFECT: All classes comply with interface patterns!', colors.green));
      process.exit(0);
    } else {
      console.log(colorize(`📋 NEXT STEPS: ${results.total - results.compliant} classes need refactoring`, colors.yellow));
      process.exit(1);
    }
  }).catch(error => {
    console.error(colorize('❌ Analysis failed:', colors.red), error.message);
    process.exit(1);
  });
}

module.exports = UnifiedRefactoringTool;
