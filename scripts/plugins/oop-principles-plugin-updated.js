#!/usr/bin/env node

/**
 * OOP Principles Plugin - Updated with new rules
 * Analyzes and enforces Object-Oriented Programming principles and best practices
 * including SOLID, DRY, KISS, and enterprise-level coding standards
 * NEW: Enforces class-based structure, one-method limit, JSON constants, factory pattern
 */

const fs = require('fs');
const path = require('path');
const BasePlugin = require('../lib/base-plugin');

class OOPPrinciplesPluginUpdated extends BasePlugin {
  constructor() {
    super({
      name: 'oop-principles-updated',
      description: 'Analyzes and enforces OOP principles with new class-based rules',
      version: '2.0.0',
      author: 'RWTRA',
      category: 'analysis',
      commands: [
        {
          name: 'oop-analyze-updated',
          description: 'Run comprehensive OOP principles analysis with new rules'
        }
      ],
      dependencies: []
    });

    this.results = {
      summary: {
        totalFiles: 0,
        totalClasses: 0,
        totalMethods: 0,
        compliantClasses: 0,
        criticalIssues: 0,
        warnings: 0,
        info: 0,
        overallHealth: 'UNKNOWN'
      },
      violations: {
        critical: [],
        warning: [],
        info: []
      },
      byPrinciple: {
        constructorRules: { violations: 0, maxSeverity: 'none' },
        methodComplexity: { violations: 0, maxSeverity: 'none' },
        sizeLimits: { violations: 0, maxSeverity: 'none' },
        inheritanceRules: { violations: 0, maxSeverity: 'none' },
        dependencyInjection: { violations: 0, maxSeverity: 'none' },
        solidPrinciples: { violations: 0, maxSeverity: 'none' },
        codeQuality: { violations: 0, maxSeverity: 'none' },
        classBasedStructure: { violations: 0, maxSeverity: 'none' },
        methodLimit: { violations: 0, maxSeverity: 'none' },
        jsonConstants: { violations: 0, maxSeverity: 'none' },
        factoryPattern: { violations: 0, maxSeverity: 'none' }
      },
      recommendations: [],
      classDetails: new Map(),
      processedFiles: new Set()
    };

    this.principles = {
      // Core OOP principles from requirements
      DATACLASS_CONSTRUCTOR: 'Every class has a dataclass in its constructor',
      SINGLE_CONSTRUCTOR_PARAM: 'Only one constructor parameter allowed',
      INITIALIZE_METHOD: 'Every class has an initialize method',
      BASE_CLASS_INHERITANCE: 'Every class extends a base class with TypeScript interface',
      CLASS_SIZE_LIMIT: 'Classes should be ≤ 100 lines of code',
      METHOD_ATOMICITY: 'Methods should be small and atomic',
      SINGLE_METHOD_LIMIT: 'Only one business method allowed besides constructor and initialize',
      PARAMETER_LIMIT: 'No more than 4 arguments per function',
      DEPENDENCY_INJECTION: 'Classes should use dependency injection',
      CLASS_BASED_STRUCTURE: 'All files must use class-based structure',
      JSON_CONSTANTS: 'Class constants must be defined in JSON files',
      FACTORY_PATTERN: 'Every class must have a corresponding factory',
      DATA_CLASS_PATTERN: 'Data classes must be used for data transport',
      
      // Additional enterprise/academic principles
      SOLID_SINGLE_RESPONSIBILITY: 'SOLID: Single Responsibility Principle',
      SOLID_OPEN_CLOSED: 'SOLID: Open/Closed Principle',
      SOLID_LISKOV: 'SOLID: Liskov Substitution Principle',
      SOLID_INTERFACE_SEGREGATION: 'SOLID: Interface Segregation Principle',
      SOLID_DEPENDENCY_INVERSION: 'SOLID: Dependency Inversion Principle',
      DRY_PRINCIPLE: 'DRY: Don\'t Repeat Yourself',
      KISS_PRINCIPLE: 'KISS: Keep It Simple, Stupid',
      YAGNI_PRINCIPLE: 'YAGNI: You Aren\'t Gonna Need It',
      LAW_OF_DEMETER: 'Law of Demeter: Don\'t talk to strangers',
      COMPOSITION_OVER_INHERITANCE: 'Prefer composition over inheritance'
    };

    this.config = {
      maxClassLines: 100,
      maxMethodLines: 20,
      maxParameters: 4,
      maxCyclomaticComplexity: 10,
      maxNestingDepth: 3,
      minMethodLength: 2,
      enableDryDetection: true,
      enableSOLIDAnalysis: true,
      enableAutoFixSuggestions: true,
      enableNewRules: true
    };
  }

  /**
   * Main plugin execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Analysis results
   */
  async execute(context) {
    await this.initialize(context);
    
    this.log('Starting OOP principles analysis with new rules...', 'info');
    this.log(this.colorize('🏗️  Enhanced OOP Principles Analysis', context.colors.cyan));
    this.log(this.colorize('='.repeat(60), context.colors.white));
    
    const bootstrapPath = context.options['bootstrap-path'] || path.join(context.bootstrapPath, 'bootstrap');
    this.bootstrapPath = bootstrapPath;
    
    // Override config with options
    this._applyConfiguration(context.options);
    
    await this._scanAllFiles();
    await this._analyzeAllClasses();
    this._calculateOverallHealth();
    this._generateRecommendations();
    this._generateReport(context);
    
    // Save results if output directory specified
    if (context.options.output) {
      await this._saveResults(context);
    }
    
    return this.results;
  }

  /**
   * Analyzes a single class against all OOP principles including new rules
   */
  _analyzeClass(className, classInfo) {
    let isCompliant = true;
    
    // Core requirements analysis
    this._checkConstructorRules(className, classInfo);
    this._checkInitializeMethod(className, classInfo);
    this._checkInheritanceRules(className, classInfo);
    this._checkSizeLimits(className, classInfo);
    this._checkMethodComplexity(className, classInfo);
    this._checkParameterLimits(className, classInfo);
    this._checkDependencyInjection(className, classInfo);
    
    // NEW: Check class-based structure
    this._checkClassBasedStructure(className, classInfo);
    
    // NEW: Check one-method limit
    this._checkMethodLimit(className, classInfo);
    
    // NEW: Check JSON constants
    this._checkJsonConstants(className, classInfo);
    
    // NEW: Check factory pattern
    this._checkFactoryPattern(className, classInfo);
    
    // Advanced principles
    if (this.config.enableSOLIDAnalysis) {
      this._checkSOLIDPrinciples(className, classInfo);
    }
    
    if (this.config.enableDryDetection) {
      this._checkCodeQuality(className, classInfo);
    }
    
    // Determine if class is compliant
    isCompliant = classInfo.violations.filter(v => v.severity === 'critical').length === 0;
    
    if (isCompliant) {
      this.results.summary.compliantClasses++;
    }
  }

  /**
   * NEW: Checks if file uses class-based structure
   */
  _checkClassBasedStructure(className, classInfo) {
    // Check if this is actually a class (not just functions/module.exports)
    if (!classInfo.name || classInfo.name === '') {
      this._addViolation(className, {
        type: 'NOT_CLASS_BASED',
        principle: this.principles.CLASS_BASED_STRUCTURE,
        severity: 'critical',
        message: 'File does not use class-based structure',
        recommendation: 'Convert to class extending BaseClass'
      });
    }
  }

  /**
   * NEW: Checks one-method limit rule
   */
  _checkMethodLimit(className, classInfo) {
    const nonInitializeMethods = classInfo.methods.filter(m => m.name !== 'initialize');
    
    if (nonInitializeMethods.length > 1) {
      this._addViolation(className, {
        type: 'TOO_MANY_METHODS',
        principle: this.principles.SINGLE_METHOD_LIMIT,
        severity: 'critical',
        message: `Class has ${nonInitializeMethods.length} methods (max 1 allowed besides initialize)`,
        recommendation: 'Split into multiple classes or consolidate logic'
      });
    }
  }

  /**
   * NEW: Checks if class constants are defined in JSON
   */
  _checkJsonConstants(className, classInfo) {
    // For now, check if class name appears in class-constants.json
    try {
      const constantsPath = path.join(this.bootstrapPath, 'aggregate', 'class-constants.json');
      if (fs.existsSync(constantsPath)) {
        const constants = JSON.parse(fs.readFileSync(constantsPath, 'utf8'));
        const classExists = constants.classes && constants.classes.some(cls => cls.name === className);
        
        if (!classExists && className.endsWith('Data')) {
          this._addViolation(className, {
            type: 'CONSTANTS_NOT_IN_JSON',
            principle: this.principles.JSON_CONSTANTS,
            severity: 'warning',
            message: 'Class constants not defined in JSON file',
            recommendation: 'Add class definition to class-constants.json'
          });
        }
      }
    } catch (error) {
      // If we can't check the JSON file, skip this validation
    }
  }

  /**
   * NEW: Checks if class has corresponding factory
   */
  _checkFactoryPattern(className, classInfo) {
    const factoryName = `${className.toLowerCase()}-factory`;
    const factoryPath = path.join(this.bootstrapPath, 'factories', `${factoryName}.js`);
    
    if (!fs.existsSync(factoryPath) && !className.endsWith('Factory')) {
      this._addViolation(className, {
        type: 'NO_FACTORY',
        principle: this.principles.FACTORY_PATTERN,
        severity: 'warning',
        message: 'Class does not have a corresponding factory',
        recommendation: `Create ${factoryName}.js for ${className}`
      });
    }
  }

  /**
   * Updated principle key mapping to include new rules
   */
  _getPrincipleKey(principle) {
    if (principle.includes('constructor')) return 'constructorRules';
    if (principle.includes('method') || principle.includes('atomic')) return 'methodComplexity';
    if (principle.includes('lines') || principle.includes('size')) return 'sizeLimits';
    if (principle.includes('extend') || principle.includes('inherit')) return 'inheritanceRules';
    if (principle.includes('dependency')) return 'dependencyInjection';
    if (principle.includes('SOLID')) return 'solidPrinciples';
    if (principle.includes('class-based') || principle.includes('structure')) return 'classBasedStructure';
    if (principle.includes('one method') || principle.includes('method limit')) return 'methodLimit';
    if (principle.includes('JSON') || principle.includes('constants')) return 'jsonConstants';
    if (principle.includes('factory')) return 'factoryPattern';
    return 'codeQuality';
  }

  /**
   * Enhanced recommendations including new rules
   */
  _generateRecommendations() {
    const recommendations = [];
    
    // Critical issues first
    if (this.results.summary.criticalIssues > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Critical Issues',
        message: `Address ${this.results.summary.criticalIssues} critical issues immediately`,
        actions: [
          'Add missing constructors with dataclass patterns',
          'Implement required initialize methods',
          'Ensure all classes extend base classes',
          'Fix inheritance violations',
          'Convert non-class files to class-based structure',
          'Enforce one-method limit per class'
        ]
      });
    }
    
    // NEW: Class-based structure issues
    const structureIssues = this.results.byPrinciple.classBasedStructure.violations;
    if (structureIssues > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Class-Based Structure',
        message: `${structureIssues} files need class-based refactoring`,
        actions: [
          'Convert function-based modules to classes',
          'Ensure all classes extend BaseClass',
          'Use dataclass constructor pattern',
          'Implement initialize methods'
        ]
      });
    }
    
    // NEW: Method limit violations
    const methodLimitViolations = this.results.byPrinciple.methodLimit.violations;
    if (methodLimitViolations > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Method Limit',
        message: `${methodLimitViolations} classes exceed one-method limit`,
        actions: [
          'Split complex classes into multiple focused classes',
          'Consolidate logic into single business method',
          'Use helper classes for additional functionality'
        ]
      });
    }
    
    // Factory pattern issues
    const factoryIssues = this.results.byPrinciple.factoryPattern.violations;
    if (factoryIssues > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Factory Pattern',
        message: `${factoryIssues} classes missing factories`,
        actions: [
          'Create corresponding factory for each class',
          'Use factory pattern for object creation',
          'Implement proper dependency injection'
        ]
      });
    }
    
    // JSON constants issues
    const jsonIssues = this.results.byPrinciple.jsonConstants.violations;
    if (jsonIssues > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'JSON Constants',
        message: `${jsonIssues} classes not in JSON constants`,
        actions: [
          'Add class definitions to class-constants.json',
          'Use JS for complex constant calculations',
          'Enforce JSON-based constant management'
        ]
      });
    }
    
    // Size and complexity
    const largeClasses = this.results.violations.warning.filter(v => v.type === 'CLASS_TOO_LARGE').length;
    if (largeClasses > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Class Size',
        message: `${largeClasses} classes exceed recommended size limits`,
        actions: [
          'Break down large classes into smaller, focused components',
          'Extract related functionality into separate classes',
          'Consider composition over inheritance for complex hierarchies'
        ]
      });
    }
    
    this.results.recommendations = recommendations;
  }

  // Include all other methods from the original plugin...
  // (Constructor rules, initialize method, inheritance, etc. remain the same)

  /**
   * Enhanced report with new rule violations
   */
  _generateReport(context) {
    console.log(context.colors.reset + '\n🏗️  ENHANCED OOP PRINCIPLES ANALYSIS REPORT');
    console.log('=============================================');
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`   Total Files: ${this.results.summary.totalFiles}`);
    console.log(`   Total Classes: ${this.results.summary.totalClasses}`);
    console.log(`   Total Methods: ${this.results.summary.totalMethods}`);
    console.log(`   Compliant Classes: ${this.results.summary.compliantClasses} (${Math.round((this.results.summary.compliantClasses / this.results.summary.totalClasses) * 100)}%)`);
    console.log(`   Critical Issues: ${this.results.summary.criticalIssues}`);
    console.log(`   Warnings: ${this.results.summary.warnings}`);
    console.log(`   Info: ${this.results.summary.info}`);
    console.log(`   Overall Health: ${this._getHealthDisplay(this.results.summary.overallHealth)}`);
    
    // Violations by principle (including new ones)
    console.log('\n🔍 VIOLATIONS BY PRINCIPLE:');
    for (const [principle, stats] of Object.entries(this.results.byPrinciple)) {
      if (stats.violations > 0) {
        const severityColor = this._getSeverityColor(stats.maxSeverity);
        const displayName = principle.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`   ${displayName}: ${stats.violations} violations ${severityColor}`);
      }
    }
    
    // Enhanced best practices reminder
    console.log('\n📚 ENHANCED OOP BEST PRACTICES:');
    console.log(context.colors.cyan + '   • Use class-based structure for all files' + context.colors.reset);
    console.log(context.colors.cyan + '   • Limit to one business method per class' + context.colors.reset);
    console.log(context.colors.cyan + '   • Use dataclass patterns in constructors' + context.colors.reset);
    console.log(context.colors.cyan + '   • Keep constructors simple with single parameter' + context.colors.reset);
    console.log(context.colors.cyan + '   • Implement initialize methods for setup' + context.colors.reset);
    console.log(context.colors.cyan + '   • Define class constants in JSON files' + context.colors.reset);
    console.log(context.colors.cyan + '   • Create factories for every class' + context.colors.reset);
    console.log(context.colors.cyan + '   • Use data classes for data transport' + context.colors.reset);
    console.log(context.colors.cyan + '   • Extend base classes with proper interfaces' + context.colors.reset);
    console.log(context.colors.cyan + '   • Maintain small, focused classes (≤100 LOC)' + context.colors.reset);
    console.log(context.colors.cyan + '   • Write atomic methods with low complexity' + context.colors.reset);
    console.log(context.colors.cyan + '   • Limit function parameters (≤4)' + context.colors.reset);
    console.log(context.colors.cyan + '   • Use dependency injection for loose coupling' + context.colors.reset);
    console.log(context.colors.cyan + '   • Apply SOLID principles consistently' + context.colors.reset);
    console.log(context.colors.cyan + '   • Eliminate code duplication (DRY)' + context.colors.reset);
    
    // Overall status
    const healthColor = this._getHealthColor(this.results.summary.overallHealth);
    console.log(`\n${healthColor}🎯 OVERALL STATUS: ${this.results.summary.overallHealth}${context.colors.reset}`);
  }

  // Include all other helper methods from original plugin...
  // (Color methods, severity handling, etc. remain the same)
}

module.exports = OOPPrinciplesPluginUpdated;
