#!/usr/bin/env node

/**
 * OOP Principles Plugin
 * Analyzes and enforces Object-Oriented Programming principles and best practices
 * including SOLID, DRY, KISS, and enterprise-level coding standards
 */

const fs = require('fs');
const path = require('path');
const BasePlugin = require('../lib/base-plugin');

// Import string service
const { getStringService } = require('../string/string-service');

class OOPPrinciplesPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'oop-principles',
      description: 'Analyzes and enforces OOP principles and best practices',
      version: '1.0.0',
      author: 'RWTRA',
      category: 'analysis',
      commands: [
        {
          name: 'oop-analyze',
          description: 'Run comprehensive OOP principles analysis'
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
        codeQuality: { violations: 0, maxSeverity: 'none' }
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
      EXECUTE_METHOD: 'Every class has an execute method',
      TWO_METHOD_LIMIT: 'Classes must have exactly 2 methods (initialize + execute) except codegen classes',
      BASE_CLASS_INHERITANCE: 'Every class extends a base class with TypeScript interface',
      CLASS_SIZE_LIMIT: 'Classes should be ≤ 100 lines of code',
      METHOD_ATOMICITY: 'Methods should be small and atomic',
      PARAMETER_LIMIT: 'No more than 4 arguments per function',
      DEPENDENCY_INJECTION: 'Classes should use dependency injection',
      
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
      enableAutoFixSuggestions: true
    };
  }

  /**
   * Main plugin execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Analysis results
   */
  async execute(context) {
    await this.initialize(context);
    const strings = getStringService();

    this.log(strings.getConsole('starting_oop_principles_analysis'), 'info');
    this.log(this.colorize('🏗️  Object-Oriented Programming Principles Analysis', context.colors.cyan));
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
   * Applies configuration from command line options
   */
  _applyConfiguration(options) {
    if (options['max-class-lines']) this.config.maxClassLines = parseInt(options['max-class-lines']);
    if (options['max-method-lines']) this.config.maxMethodLines = parseInt(options['max-method-lines']);
    if (options['max-parameters']) this.config.maxParameters = parseInt(options['max-parameters']);
    if (options['max-complexity']) this.config.maxCyclomaticComplexity = parseInt(options['max-complexity']);
    if (options['no-dry']) this.config.enableDryDetection = false;
    if (options['no-solid']) this.config.enableSOLIDAnalysis = false;
  }

  /**
   * Scans all JavaScript and TypeScript files in the bootstrap system
   */
  async _scanAllFiles() {
    this.log('Scanning files for OOP analysis...', 'info');
    
    const files = await this._findAllCodeFiles();
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(this.bootstrapPath, file);
        
        this.results.processedFiles.add(file);
        this.results.summary.totalFiles++;
        
        // Extract classes from file
        const classes = this._extractClasses(content, relativePath);
        
        for (const classInfo of classes) {
          this.results.classDetails.set(classInfo.name, classInfo);
          this.results.summary.totalClasses++;
          this.results.summary.totalMethods += classInfo.methods.length;
        }
        
      } catch (error) {
        this.log(`Error scanning file ${file}: ${error.message}`, 'error');
      }
    }
    
    this.log(`Scanned ${this.results.summary.totalFiles} files, found ${this.results.summary.totalClasses} classes`, 'info');
  }

  /**
   * Finds all JavaScript and TypeScript files recursively
   */
  async _findAllCodeFiles() {
    const files = [];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.js') || item.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    };
    
    scanDirectory(this.bootstrapPath);
    return files;
  }

  /**
   * Extracts class information from file content
   */
  _extractClasses(content, filePath) {
    const classes = [];
    
    // Extract class definitions - simplified regex for better reliability
    const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)/g;
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      const extendsClass = match[2] || null;
      const implementsInterface = match[3] || null;
      const classBody = match[4] || '';
      
      // Calculate class lines (excluding comments and empty lines)
      const classLines = this._countEffectiveLines(classBody);
      
      // Extract constructor
      const constructor = this._extractConstructor(classBody);
      
      // Extract methods
      const methods = this._extractMethods(classBody);
      
      // Extract properties
      const properties = this._extractProperties(classBody);
      
      // Calculate cyclomatic complexity
      const complexity = this._calculateCyclomaticComplexity(classBody);
      
      const classInfo = {
        name: className,
        file: filePath,
        extends: extendsClass,
        implements: implementsInterface,
        lines: classLines,
        constructor: constructor,
        methods: methods,
        properties: properties,
        complexity: complexity,
        fullContent: classBody,
        violations: []
      };
      
      classes.push(classInfo);
    }
    
    return classes;
  }

  /**
   * Counts effective lines of code (excluding comments and empty lines)
   */
  _countEffectiveLines(content) {
    const lines = content.split('\n');
    let effectiveLines = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
        effectiveLines++;
      }
    }
    
    return effectiveLines;
  }

  /**
   * Extracts constructor information from class body
   */
  _extractConstructor(classBody) {
    const constructorRegex = /constructor\s*\(([^)]*)\)\s*{([^}]*(?:\{[^}]*\}[^}]*)*)}/;
    const match = constructorRegex.exec(classBody);
    
    if (!match) return null;
    
    const params = this._parseParameters(match[1]);
    const body = match[2];
    const lines = this._countEffectiveLines(body);
    
    // Check for dataclass pattern
    const hasDataclass = this._hasDataclassPattern(body);
    
    return {
      parameters: params,
      body: body,
      lines: lines,
      hasDataclass: hasDataclass,
      parameterCount: params.length
    };
  }

  /**
   * Checks if constructor has dataclass pattern
   */
  _hasDataclassPattern(constructorBody) {
    // Look for patterns like: this.prop = data.prop; or Object.assign(this, data);
    const dataclassPatterns = [
      /this\.\w+\s*=\s*(?:data\.\w+|\w+\.\w+)/g,
      /Object\.assign\s*\(\s*this\s*,\s*\w+/g,
      /\.\.\.\w+/g // Spread operator
    ];
    
    for (const pattern of dataclassPatterns) {
      if (pattern.test(constructorBody)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Extracts method information from class body
   */
  _extractMethods(classBody) {
    const methods = [];
    
    // Extract method definitions (excluding constructor)
    const methodRegex = /(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*{([^}]*(?:\{[^}]*\}[^}]*)*)}/g;
    let match;
    
    while ((match = methodRegex.exec(classBody)) !== null) {
      const methodName = match[1];
      if (methodName === 'constructor') continue;
      
      const params = this._parseParameters(match[2]);
      const body = match[3];
      const lines = this._countEffectiveLines(body);
      const complexity = this._calculateCyclomaticComplexity(body);
      const nestingDepth = this._calculateNestingDepth(body);
      
      methods.push({
        name: methodName,
        parameters: params,
        parameterCount: params.length,
        body: body,
        lines: lines,
        complexity: complexity,
        nestingDepth: nestingDepth
      });
    }
    
    return methods;
  }

  /**
   * Extracts property information from class body
   */
  _extractProperties(classBody) {
    const properties = [];
    
    // Look for property declarations
    const propertyRegex = /this\.(\w+)/g;
    let match;
    
    const propertySet = new Set();
    while ((match = propertyRegex.exec(classBody)) !== null) {
      propertySet.add(match[1]);
    }
    
    return Array.from(propertySet);
  }

  /**
   * Parses method parameters
   */
  _parseParameters(paramString) {
    if (!paramString.trim()) return [];
    
    return paramString.split(',').map(param => {
      const trimmed = param.trim();
      const parts = trimmed.split('=');
      return {
        name: parts[0].trim(),
        defaultValue: parts[1] ? parts[1].trim() : null,
        type: this._inferParameterType(trimmed)
      };
    });
  }

  /**
   * Infers parameter type from string
   */
  _inferParameterType(paramString) {
    if (paramString.includes('...')) return 'spread';
    if (paramString.includes('=')) return 'optional';
    if (paramString.includes('{') || paramString.includes('}')) return 'object';
    if (paramString.includes('[') || paramString.includes(']')) return 'array';
    if (paramString.match(/['"]/)) return 'string';
    if (paramString.match(/\d/)) return 'number';
    return 'unknown';
  }

  /**
   * Calculates cyclomatic complexity of a code block
   */
  _calculateCyclomaticComplexity(code) {
    const complexityKeywords = [
      /if\s*\(.*?\)/g,
      /else\s+if\s*\(.*?\)/g,
      /for\s*\(.*?\)/g,
      /while\s*\(.*?\)/g,
      /do\s*{/g,
      /switch\s*\(.*?\)/g,
      /case\s+.*?:/g,
      /catch\s*\(.*?\)/g,
      /&&/g,
      /\|\|/g
    ];
    
    let complexity = 1; // Base complexity
    
    for (const keyword of complexityKeywords) {
      const matches = code.match(keyword);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return complexity;
  }

  /**
   * Calculates maximum nesting depth
   */
  _calculateNestingDepth(code) {
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth--;
      }
    }
    
    return maxDepth;
  }

  /**
   * Analyzes all classes against OOP principles
   */
  async _analyzeAllClasses() {
    this.log('Analyzing classes against OOP principles...', 'info');
    
    for (const [className, classInfo] of this.results.classDetails) {
      this._analyzeClass(className, classInfo);
    }
    
    this._detectCodeDuplication();
    this._analyzeInheritancePatterns();
    
    this.log(`Analyzed ${this.results.summary.totalClasses} classes`, 'info');
  }

  /**
   * Analyzes a single class against all OOP principles
   */
  _analyzeClass(className, classInfo) {
    let isCompliant = true;
    
    // Core requirements analysis
    this._checkConstructorRules(className, classInfo);
    this._checkInitializeMethod(className, classInfo);
    this._checkExecuteMethod(className, classInfo);
    this._checkTwoMethodLimit(className, classInfo);
    this._checkInheritanceRules(className, classInfo);
    this._checkSizeLimits(className, classInfo);
    this._checkMethodComplexity(className, classInfo);
    this._checkParameterLimits(className, classInfo);
    this._checkDependencyInjection(className, classInfo);
    
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
   * Checks constructor-related rules
   */
  _checkConstructorRules(className, classInfo) {
    if (!classInfo.constructor) {
      this._addViolation(className, {
        type: 'NO_CONSTRUCTOR',
        principle: this.principles.DATACLASS_CONSTRUCTOR,
        severity: 'critical',
        message: 'Class has no constructor',
        recommendation: 'Add a constructor with dataclass pattern'
      });
      return;
    }
    
    // Check single parameter rule
    if (classInfo.constructor.parameterCount > 1) {
      this._addViolation(className, {
        type: 'MULTIPLE_CONSTRUCTOR_PARAMS',
        principle: this.principles.SINGLE_CONSTRUCTOR_PARAM,
        severity: 'critical',
        message: `Constructor has ${classInfo.constructor.parameterCount} parameters (max 1 allowed)`,
        recommendation: 'Use a single dataclass parameter containing all properties'
      });
    }
    
    // Check dataclass pattern
    if (!classInfo.constructor.hasDataclass) {
      this._addViolation(className, {
        type: 'NO_DATACLASS_PATTERN',
        principle: this.principles.DATACLASS_CONSTRUCTOR,
        severity: 'warning',
        message: 'Constructor does not use dataclass pattern',
        recommendation: 'Use dataclass pattern: Object.assign(this, data) or this.prop = data.prop'
      });
    }
  }

  /**
   * Checks for initialize method
   */
  _checkInitializeMethod(className, classInfo) {
    const hasInitialize = classInfo.methods.some(method => method.name === 'initialize');
    
    if (!hasInitialize) {
      this._addViolation(className, {
        type: 'NO_INITIALIZE_METHOD',
        principle: this.principles.INITIALIZE_METHOD,
        severity: 'critical',
        message: 'Class has no initialize() method',
        recommendation: 'Add an initialize() method for post-construction setup'
      });
    }
  }

  /**
   * Checks for execute method
   */
  _checkExecuteMethod(className, classInfo) {
    const hasExecute = classInfo.methods.some(method => method.name === 'execute');
    
    if (!hasExecute) {
      this._addViolation(className, {
        type: 'NO_EXECUTE_METHOD',
        principle: this.principles.EXECUTE_METHOD,
        severity: 'critical',
        message: 'Class has no execute() method',
        recommendation: 'Add an execute() method for the single business logic operation'
      });
    }
  }

  /**
   * Checks 2-method limit (initialize + execute) with codegen exceptions
   */
  _checkTwoMethodLimit(className, classInfo) {
    // Check if this is a codegen class (by file path or naming convention)
    const isCodegenClass = this._isCodegenClass(className, classInfo.file);
    
    // Get non-getter methods
    const businessMethods = classInfo.methods.filter(method => 
      !method.name.startsWith('get') && 
      method.name !== 'constructor'
    );
    
    // Codegen classes are exempt from 2-method limit
    if (!isCodegenClass) {
      if (businessMethods.length !== 2) {
        this._addViolation(className, {
          type: 'VIOLATES_TWO_METHOD_LIMIT',
          principle: this.principles.TWO_METHOD_LIMIT,
          severity: 'critical',
          message: `Class has ${businessMethods.length} business methods (exactly 2 required: initialize + execute)`,
          recommendation: 'Remove extra methods or convert to codegen-generated class'
        });
      }
      
      // Ensure the two methods are initialize and execute
      const methodNames = businessMethods.map(m => m.name).sort();
      const expectedMethods = ['execute', 'initialize'];
      if (JSON.stringify(methodNames) !== JSON.stringify(expectedMethods)) {
        this._addViolation(className, {
          type: 'INCORRECT_METHOD_NAMES',
          principle: this.principles.TWO_METHOD_LIMIT,
          severity: 'critical',
          message: `Class methods are [${methodNames.join(', ')}], expected [initialize, execute]`,
          recommendation: 'Rename methods to initialize() and execute() or convert to codegen class'
        });
      }
    } else {
      // For codegen classes, just log that they're exempt
      if (businessMethods.length > 2) {
        this._addViolation(className, {
          type: 'CODEGEN_METHOD_COUNT',
          principle: this.principles.TWO_METHOD_LIMIT,
          severity: 'info',
          message: `Codegen class has ${businessMethods.length} methods (exempt from 2-method limit)`,
          recommendation: 'Ensure all extra methods are generated by codegen system'
        });
      }
    }
  }

  /**
   * Determines if a class is a codegen-generated class
   */
  _isCodegenClass(className, filePath) {
    // Check file path for generated directories
    if (filePath.includes('generated/') || filePath.includes('/generated/')) {
      return true;
    }
    
    // Check file path for codegen markers
    if (filePath.includes('codegen/') || filePath.includes('/codegen/')) {
      return true;
    }
    
    // Check class name for codegen patterns
    if (className.endsWith('Generated') || 
        className.endsWith('Auto') || 
        className.startsWith('Generated') ||
        className.startsWith('Auto')) {
      return true;
    }
    
    // Check file content for codegen markers
    try {
      const fullPath = path.join(this.bootstrapPath, filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('Auto-generated') || 
            content.includes('Generated by') ||
            content.includes('Codegen') ||
            content.includes('DO NOT EDIT')) {
          return true;
        }
      }
    } catch (error) {
      // Ignore file read errors
    }
    
    return false;
  }

  /**
   * Checks inheritance rules
   */
  _checkInheritanceRules(className, classInfo) {
    if (!classInfo.extends && !classInfo.implements) {
      this._addViolation(className, {
        type: 'NO_INHERITANCE',
        principle: this.principles.BASE_CLASS_INHERITANCE,
        severity: 'critical',
        message: 'Class does not extend a base class or implement an interface',
        recommendation: 'Extend appropriate base class or implement interface'
      });
    }
    
    // Check if extends BaseClass pattern
    if (classInfo.extends && !classInfo.extends.startsWith('Base')) {
      this._addViolation(className, {
        type: 'NON_BASE_INHERITANCE',
        principle: this.principles.BASE_CLASS_INHERITANCE,
        severity: 'warning',
        message: `Class extends ${classInfo.extends} instead of Base${classInfo.extends}`,
        recommendation: 'Consider extending a base class for consistency'
      });
    }
  }

  /**
   * Checks size limits
   */
  _checkSizeLimits(className, classInfo) {
    if (classInfo.lines > this.config.maxClassLines) {
      this._addViolation(className, {
        type: 'CLASS_TOO_LARGE',
        principle: this.principles.CLASS_SIZE_LIMIT,
        severity: 'warning',
        message: `Class has ${classInfo.lines} lines (max ${this.config.maxClassLines})`,
        recommendation: 'Break down into smaller, focused classes'
      });
    }
    
    // Check individual method sizes
    classInfo.methods.forEach(method => {
      if (method.lines > this.config.maxMethodLines) {
        this._addViolation(className, {
          type: 'METHOD_TOO_LARGE',
          principle: this.principles.METHOD_ATOMICITY,
          severity: 'warning',
          message: `Method ${method.name} has ${method.lines} lines (max ${this.config.maxMethodLines})`,
          recommendation: `Extract smaller methods from ${method.name}`
        });
      }
    });
  }

  /**
   * Checks method complexity
   */
  _checkMethodComplexity(className, classInfo) {
    classInfo.methods.forEach(method => {
      if (method.complexity > this.config.maxCyclomaticComplexity) {
        this._addViolation(className, {
          type: 'METHOD_TOO_COMPLEX',
          principle: this.principles.METHOD_ATOMICITY,
          severity: 'warning',
          message: `Method ${method.name} has complexity ${method.complexity} (max ${this.config.maxCyclomaticComplexity})`,
          recommendation: `Refactor ${method.name} to reduce complexity`
        });
      }
      
      if (method.nestingDepth > this.config.maxNestingDepth) {
        this._addViolation(className, {
          type: 'EXCESSIVE_NESTING',
          principle: this.principles.METHOD_ATOMICITY,
          severity: 'warning',
          message: `Method ${method.name} has nesting depth ${method.nestingDepth} (max ${this.config.maxNestingDepth})`,
          recommendation: `Reduce nesting in ${method.name} using guard clauses or extract methods`
        });
      }
    });
  }

  /**
   * Checks parameter limits
   */
  _checkParameterLimits(className, classInfo) {
    classInfo.methods.forEach(method => {
      if (method.parameterCount > this.config.maxParameters) {
        this._addViolation(className, {
          type: 'TOO_MANY_PARAMETERS',
          principle: this.principles.PARAMETER_LIMIT,
          severity: 'warning',
          message: `Method ${method.name} has ${method.parameterCount} parameters (max ${this.config.maxParameters})`,
          recommendation: `Use parameter object or dataclass for ${method.name}`
        });
      }
    });
  }

  /**
   * Checks dependency injection patterns
   */
  _checkDependencyInjection(className, classInfo) {
    let hasDirectInstantiation = false;
    let hasDependencyInjection = false;
    
    classInfo.methods.forEach(method => {
      const methodBody = method.body;
      
      // Check for direct instantiation (bad pattern)
      if (/new\s+\w+\s*\(/.test(methodBody)) {
        hasDirectInstantiation = true;
      }
      
      // Check for dependency injection patterns
      if (/this\.\w+\s*=\s*\w+/.test(methodBody) && method.name === 'constructor') {
        hasDependencyInjection = true;
      }
    });
    
    if (hasDirectInstantiation && !hasDependencyInjection) {
      this._addViolation(className, {
        type: 'NO_DEPENDENCY_INJECTION',
        principle: this.principles.DEPENDENCY_INJECTION,
        severity: 'warning',
        message: 'Class uses direct instantiation instead of dependency injection',
        recommendation: 'Implement dependency injection pattern for better testability'
      });
    }
  }

  /**
   * Checks SOLID principles
   */
  _checkSOLIDPrinciples(className, classInfo) {
    // Single Responsibility Principle
    if (classInfo.methods.length > 10) {
      this._addViolation(className, {
        type: 'VIOLATES_SRP',
        principle: this.principles.SOLID_SINGLE_RESPONSIBILITY,
        severity: 'info',
        message: `Class has ${classInfo.methods.length} methods, may violate Single Responsibility Principle`,
        recommendation: 'Consider splitting into multiple focused classes'
      });
    }
    
    // Open/Closed Principle (simplified check)
    const hasExtensionPoints = classInfo.methods.some(method => 
      method.body.includes('override') || 
      method.body.includes('extend') ||
      method.body.includes('abstract')
    );
    
    if (!hasExtensionPoints && classInfo.lines > 50) {
      this._addViolation(className, {
        type: 'VIOLATES_OCP',
        principle: this.principles.SOLID_OPEN_CLOSED,
        severity: 'info',
        message: 'Class may violate Open/Closed Principle (no extension points)',
        recommendation: 'Consider adding extension points for future modifications'
      });
    }
    
    // Liskov Substitution Principle (basic check)
    if (classInfo.extends && classInfo.extends.startsWith('Base')) {
      const baseClass = this.results.classDetails.get(classInfo.extends);
      if (baseClass) {
        const baseMethods = baseClass.methods.map(m => m.name);
        const classMethods = classInfo.methods.map(m => m.name);
        
        // Check if inherited methods are properly overridden
        baseMethods.forEach(baseMethod => {
          if (classMethods.includes(baseMethod)) {
            const method = classInfo.methods.find(m => m.name === baseMethod);
            if (method && method.body.includes('throw new Error')) {
              this._addViolation(className, {
                type: 'VIOLATES_LSP',
                principle: this.principles.SOLID_LISKOV,
                severity: 'critical',
                message: `Method ${baseMethod} throws error, may violate Liskov Substitution`,
                recommendation: 'Ensure method can be substituted without breaking functionality'
              });
            }
          }
        });
      }
    }
  }

  /**
   * Checks general code quality principles
   */
  _checkCodeQuality(className, classInfo) {
    // Check for very short methods (might indicate code duplication)
    classInfo.methods.forEach(method => {
      if (method.lines < this.config.minMethodLength && method.parameterCount === 0) {
        this._addViolation(className, {
          type: 'POTENTIAL_CODE_SMELL',
          principle: this.principles.KISS_PRINCIPLE,
          severity: 'info',
          message: `Method ${method.name} is very short (${method.lines} lines), consider if it adds value`,
          recommendation: 'Ensure method provides meaningful abstraction'
        });
      }
    });
  }

  /**
   * Detects code duplication across classes
   */
  _detectCodeDuplication() {
    const allMethods = [];
    
    for (const [className, classInfo] of this.results.classDetails) {
      classInfo.methods.forEach(method => {
        allMethods.push({
          className: className,
          methodName: method.name,
          body: method.body,
          lines: method.lines
        });
      });
    }
    
    // Simple duplicate detection (can be enhanced with more sophisticated algorithms)
    for (let i = 0; i < allMethods.length; i++) {
      for (let j = i + 1; j < allMethods.length; j++) {
        const method1 = allMethods[i];
        const method2 = allMethods[j];
        
        if (method1.className !== method2.className) {
          const similarity = this._calculateSimilarity(method1.body, method2.body);
          
          if (similarity > 0.8) {
            this._addViolation(method1.className, {
              type: 'CODE_DUPLICATION',
              principle: this.principles.DRY_PRINCIPLE,
              severity: 'warning',
              message: `Method ${method1.methodName} is very similar to ${method2.className}.${method2.methodName}`,
              recommendation: 'Extract common functionality to shared utility or base class'
            });
          }
        }
      }
    }
  }

  /**
   * Calculates similarity between two code blocks
   */
  _calculateSimilarity(code1, code2) {
    const normalize = (code) => {
      return code.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/['"]/g, '')
        .replace(/\d+/g, 'N')
        .trim();
    };
    
    const normalized1 = normalize(code1);
    const normalized2 = normalize(code2);
    
    const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
    const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this._levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculates Levenshtein distance between two strings
   */
  _levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Analyzes inheritance patterns
   */
  _analyzeInheritancePatterns() {
    const inheritanceTree = new Map();
    
    for (const [className, classInfo] of this.results.classDetails) {
      if (classInfo.extends) {
        if (!inheritanceTree.has(classInfo.extends)) {
          inheritanceTree.set(classInfo.extends, []);
        }
        inheritanceTree.get(classInfo.extends).push(className);
      }
    }
    
    // Check for inheritance chains that are too deep
    for (const [baseClass, derivedClasses] of inheritanceTree) {
      const maxDepth = this._calculateInheritanceDepth(baseClass, inheritanceTree, new Set());
      
      if (maxDepth > 3) {
        this._addViolation(derivedClasses[0], {
          type: 'DEEP_INHERITANCE',
          principle: this.principles.COMPOSITION_OVER_INHERITANCE,
          severity: 'warning',
          message: `Inheritance chain depth is ${maxDepth} (recommended max 3)`,
          recommendation: 'Consider using composition instead of deep inheritance'
        });
      }
    }
  }

  /**
   * Calculates inheritance depth
   */
  _calculateInheritanceDepth(className, inheritanceTree, visited) {
    if (visited.has(className)) return 0; // Circular inheritance detected
    
    visited.add(className);
    
    const children = inheritanceTree.get(className) || [];
    let maxChildDepth = 0;
    
    for (const child of children) {
      const childDepth = this._calculateInheritanceDepth(child, inheritanceTree, new Set(visited));
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }
    
    return maxChildDepth + 1;
  }

  /**
   * Adds a violation to the results
   */
  _addViolation(className, violation) {
    const classInfo = this.results.classDetails.get(className);
    classInfo.violations.push(violation);
    
    // Add to categorized violations
    this.results.violations[violation.severity].push({
      className: className,
      file: classInfo.file,
      ...violation
    });
    
    // Update principle statistics
    const principleKey = this._getPrincipleKey(violation.principle);
    if (this.results.byPrinciple[principleKey]) {
      this.results.byPrinciple[principleKey].violations++;
      if (this._compareSeverity(violation.severity, this.results.byPrinciple[principleKey].maxSeverity) > 0) {
        this.results.byPrinciple[principleKey].maxSeverity = violation.severity;
      }
    }
    
    // Update summary
    if (violation.severity === 'critical') {
      this.results.summary.criticalIssues++;
    } else if (violation.severity === 'warning') {
      this.results.summary.warnings++;
    } else {
      this.results.summary.info++;
    }
  }

  /**
   * Gets principle key from principle text
   */
  _getPrincipleKey(principle) {
    if (principle.includes('constructor')) return 'constructorRules';
    if (principle.includes('method') || principle.includes('atomic')) return 'methodComplexity';
    if (principle.includes('lines') || principle.includes('size')) return 'sizeLimits';
    if (principle.includes('extend') || principle.includes('inherit')) return 'inheritanceRules';
    if (principle.includes('dependency')) return 'dependencyInjection';
    if (principle.includes('SOLID')) return 'solidPrinciples';
    return 'codeQuality';
  }

  /**
   * Compares severity levels
   */
  _compareSeverity(severity1, severity2) {
    const levels = { 'none': 0, 'info': 1, 'warning': 2, 'critical': 3 };
    return levels[severity1] - levels[severity2];
  }

  /**
   * Calculates overall health score
   */
  _calculateOverallHealth() {
    const total = this.results.summary.totalClasses;
    if (total === 0) {
      this.results.summary.overallHealth = 'UNKNOWN';
      return;
    }
    
    const criticalPercentage = (this.results.summary.criticalIssues / total) * 100;
    const warningPercentage = (this.results.summary.warnings / total) * 100;
    
    if (criticalPercentage === 0 && warningPercentage <= 10) {
      this.results.summary.overallHealth = 'EXCELLENT';
    } else if (criticalPercentage <= 5 && warningPercentage <= 25) {
      this.results.summary.overallHealth = 'GOOD';
    } else if (criticalPercentage <= 15 && warningPercentage <= 50) {
      this.results.summary.overallHealth = 'MODERATE';
    } else {
      this.results.summary.overallHealth = 'POOR';
    }
  }

  /**
   * Generates recommendations based on analysis
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
          'Fix inheritance violations'
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
    
    // Method complexity
    const complexMethods = this.results.violations.warning.filter(v => 
      v.type === 'METHOD_TOO_COMPLEX' || v.type === 'EXCESSIVE_NESTING'
    ).length;
    if (complexMethods > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Method Complexity',
        message: `${complexMethods} methods have high complexity or nesting`,
        actions: [
          'Use guard clauses to reduce nesting',
          'Extract complex logic into separate methods',
          'Apply Strategy pattern for complex conditional logic'
        ]
      });
    }
    
    // SOLID principles
    const solidViolations = this.results.byPrinciple.solidPrinciples.violations;
    if (solidViolations > 0) {
      recommendations.push({
        priority: 'LOW',
        category: 'SOLID Principles',
        message: `${solidViolations} SOLID principle violations detected`,
        actions: [
          'Apply Single Responsibility Principle by splitting large classes',
          'Design for extension with Open/Closed Principle',
          'Ensure proper inheritance relationships for Liskov Substitution',
          'Create focused, role-specific interfaces',
          'Depend on abstractions, not concretions'
        ]
      });
    }
    
    // Code quality
    const codeIssues = this.results.byPrinciple.codeQuality.violations;
    if (codeIssues > 0) {
      recommendations.push({
        priority: 'LOW',
        category: 'Code Quality',
        message: `${codeIssues} code quality improvements identified`,
        actions: [
          'Eliminate code duplication through extraction',
          'Apply KISS principle to simplify complex solutions',
          'Remove unnecessary code (YAGNI principle)',
          'Follow Law of Demeter to reduce coupling'
        ]
      });
    }
    
    this.results.recommendations = recommendations;
  }

  /**
   * Generates and displays the analysis report
   */
  _generateReport(context) {
    console.log(context.colors.reset + '\n🏗️  OOP PRINCIPLES ANALYSIS REPORT');
    console.log('===================================');
    
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
    
    // Violations by principle
    console.log('\n🔍 VIOLATIONS BY PRINCIPLE:');
    for (const [principle, stats] of Object.entries(this.results.byPrinciple)) {
      if (stats.violations > 0) {
        const severityColor = this._getSeverityColor(stats.maxSeverity);
        const displayName = principle.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`   ${displayName}: ${stats.violations} violations ${severityColor}`);
      }
    }
    
    // Critical violations
    if (this.results.violations.critical.length > 0) {
      console.log('\n❌ CRITICAL VIOLATIONS:');
      for (const violation of this.results.violations.critical.slice(0, 10)) {
        console.log(context.colors.red + `   ${violation.className}: ${violation.message}` + context.colors.reset);
        console.log(context.colors.gray + `     File: ${violation.file}` + context.colors.reset);
      }
      if (this.results.violations.critical.length > 10) {
        console.log(context.colors.yellow + `   ... and ${this.results.violations.critical.length - 10} more critical issues` + context.colors.reset);
      }
    }
    
    // Warnings
    if (this.results.violations.warning.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      for (const violation of this.results.violations.warning.slice(0, 10)) {
        console.log(context.colors.yellow + `   ${violation.className}: ${violation.message}` + context.colors.reset);
      }
      if (this.results.violations.warning.length > 10) {
        console.log(context.colors.gray + `   ... and ${this.results.violations.warning.length - 10} more warnings` + context.colors.reset);
      }
    }
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n🎯 RECOMMENDATIONS:');
      for (const rec of this.results.recommendations) {
        const priorityColor = rec.priority === 'HIGH' ? context.colors.red : 
                             rec.priority === 'MEDIUM' ? context.colors.yellow : context.colors.cyan;
        console.log(priorityColor + `   [${rec.priority}] ${rec.message}` + context.colors.reset);
        
        if (context.options.verbose) {
          for (const action of rec.actions) {
            console.log(context.colors.gray + `     - ${action}` + context.colors.reset);
          }
        }
      }
    }
    
    // Best practices reminder
    console.log('\n📚 OOP BEST PRACTICES:');
    console.log(context.colors.cyan + '   • Use dataclass patterns in constructors' + context.colors.reset);
    console.log(context.colors.cyan + '   • Keep constructors simple with single parameter' + context.colors.reset);
    console.log(context.colors.cyan + '   • Implement initialize methods for setup' + context.colors.reset);
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

  /**
   * Gets health display with color
   */
  _getHealthDisplay(health) {
    switch (health) {
      case 'EXCELLENT': return this.colorize('EXCELLENT', '\x1b[32m');
      case 'GOOD': return this.colorize('GOOD', '\x1b[36m');
      case 'MODERATE': return this.colorize('MODERATE', '\x1b[33m');
      case 'POOR': return this.colorize('POOR', '\x1b[31m');
      default: return health;
    }
  }

  /**
   * Gets health color
   */
  _getHealthColor(health) {
    switch (health) {
      case 'EXCELLENT': return '\x1b[32m';
      case 'GOOD': return '\x1b[36m';
      case 'MODERATE': return '\x1b[33m';
      case 'POOR': return '\x1b[31m';
      default: return '\x1b[0m';
    }
  }

  /**
   * Gets severity color
   */
  _getSeverityColor(severity) {
    switch (severity) {
      case 'critical': return this.colorize('(Critical)', '\x1b[31m');
      case 'warning': return this.colorize('(Warning)', '\x1b[33m');
      case 'info': return this.colorize('(Info)', '\x1b[36m');
      default: return '';
    }
  }

  /**
   * Saves analysis results to file
   */
  async _saveResults(context) {
    const outputDir = context.options['output-dir'] || path.join(this.bootstrapPath, 'reports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(outputDir, `oop-principles-${timestamp}.json`);
    
    // Convert Map to object for JSON serialization
    const classDetailsObject = {};
    for (const [className, classInfo] of this.results.classDetails) {
      classDetailsObject[className] = classInfo;
    }
    
    const reportData = {
      timestamp,
      config: this.config,
      summary: this.results.summary,
      violations: this.results.violations,
      byPrinciple: this.results.byPrinciple,
      recommendations: this.results.recommendations,
      classDetails: classDetailsObject,
      principles: this.principles
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
    this.log(`Results saved to: ${resultsPath}`, 'info');
  }
}

module.exports = OOPPrinciplesPlugin;
