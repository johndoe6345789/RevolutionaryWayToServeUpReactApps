#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Passive String Extractor - AI-Friendly Analysis Utility
 * 
 * This module provides string extraction and analysis capabilities without automatic execution.
 * Designed for LLM intelligence gathering and controlled programmatic usage.
 * 
 * @author Passive String Extractor
 * @version 2.0.0 - AI Enhanced
 * 
 * Safety Features:
 * - 50 file limit to prevent system overload
 * - Read-only analysis modes
 * - Detailed structured output for AI processing
 * - Comprehensive progress tracking
 */

class StringExtractor {
  constructor(options = {}) {
    this.options = {
      files: options.files || [],
      project: options.project || false,
      dryRun: options.dryRun || false,
      verbose: options.verbose || false,
      exclude: options.exclude || ['node_modules/**', '.git/**', 'coverage/**', 'dist/**', 'build/**'],
      maxFiles: options.maxFiles || 500, // Add 500 file limit
      ...options
    };

    this.codegenDataPath = path.resolve(__dirname, 'strings.json');
    this.changesLog = [];
    this.extractedStrings = new Map();
    this.originalFiles = new Map();
    this.results = {
      timestamp: null,
      mode: null,
      safety: {},
      extraction: {},
      verification: null,
      success: null,
      nextSteps: []
    };

    // Initialize categories and patterns
    this.initializePatterns();
  }

  /**
   * Initialize extraction patterns and categories
   */
  initializePatterns() {
    this.categories = {
      errors: {
        patterns: [
          /\b(error|fail|failed|failure|invalid|missing|required|not found|cannot|unable)/i,
          /\b(exception|throw|throw new)/i
        ],
        priority: 1
      },
      messages: {
        patterns: [
          /\b(initializing|starting|loading|generating|creating|processing|executing)/i,
          /\b(completed|finished|success|successful|done|ready)/i
        ],
        priority: 2
      },
      console: {
        patterns: [
          /console\.(log|info|warn|error|debug)/,
          /\b(log|info|warn|error|debug|output|print)/i
        ],
        priority: 3
      },
      labels: {
        patterns: [
          /\b(button|label|title|heading|menu|nav|header|footer)/i,
          /\b(click|press|select|choose|submit|cancel|ok|yes|no)/i
        ],
        priority: 4
      }
    };

    // String patterns to ignore
    this.ignorePatterns = [
      // Imports and requires
      /^require\s*\(/,
      /^import\s+/,
      // Property names
      /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/,
      // Function names
      /^function\s+[a-zA-Z_$]/,
      /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*function/,
      // Class names
      /^class\s+[a-zA-Z_$]/,
      // Variable declarations
      /^(const|let|var)\s+[a-zA-Z_$]/,
      // URLs and file paths
      /^https?:\/\//,
      /^\.\.?\//,
      // Template expressions
      /^\${/,
      // Already using string service
      /strings\.(get|getError|getMessage|getLabel|getConsole)/,
      // Very short strings (likely identifiers)
      /^.{1,2}$/,
      // Unicode Braille characters are now allowed (progress indicators)
      // Numbers and boolean strings
      /^(true|false|null|undefined|\d+)$/,
      // Log levels and common identifiers
      /^(info|error|success|warning|debug|log|warn)$/,
      // File extensions and paths
      /^(\.js|\.ts|\.mjs|\.cjs|\.json|\.d\.ts|\/|\\)$/,
      // Empty strings and whitespace
      /^(\s*)$/,
      // Template literal fragments
      /^(\$\{|[^{}]*\}|\$\{[^}]*\})$/,
      // Common programming terms
      /^(initialize|execute|reset|ready|validation|data|name|class|type|id)$/,
      // Template placeholders
      /^\$\{[a-zA-Z_][a-zA-Z0-9_]*\}$/,
      // Common UI/log levels
      /^(console|log|info|warn|error|debug|success|warning|reset)$/,
      // Module and file references
      /^(module|exports|require|import|from|default|return|new|this|that)$/,
      // Template literal content with placeholders
      /^\s*\$\{[^}]+\}\s*$/,
      // File paths and extensions
      /^(\.\/|\.js|\.ts|\.mjs|\.cjs|\.json|\.d\.ts|\/|\\|\$\{.*\}\/.*\$\{.*\})$/,
      // Code generation template fragments
      /^(\s*;?\s*|\\n|\\t|,\s*|\/|\\\$\{|\\\})$/,
      // Test descriptions and common test strings
      /^(should|test|describe|it|expect|assert|beforeEach|afterEach)$/,
      // Template literal content that's actually code
      /^\s*(\$\{.*\}|\\n|\\t|;\s*|,\s*|\/|\\\$\{|\\\})\s*$/,
      // Code generation template fragments with placeholders
      /(\$\{.*\}|\.js|\.ts|\/|\\n|module\.exports|className|classConfig)/
    ];
  }

  /**
   * Main extraction method
   */
  async extract() {
    this.results.timestamp = new Date().toISOString();
    this.results.mode = this.options.dryRun ? 'DRY_RUN' : 'EXTRACTION';

    try {
      // Load existing codegen data
      this.loadCodegenData();

      // Get files to process
      const files = await this.getFiles();
      this.results.safety.filesFound = files.length;
      this.results.safety.maxFiles = this.options.maxFiles;

      // Process each file
      for (const file of files) {
        await this.processFile(file);
      }

      // Store extraction results
      this.results.extraction = {
        totalStrings: this.extractedStrings.size,
        filesProcessed: this.changesLog.length,
        changesLog: this.changesLog,
        strings: Array.from(this.extractedStrings.entries()).map(([key, info]) => ({
          key,
          content: info.content,
          category: info.category,
          sources: info.sources
        }))
      };

      // Verify modifications if not dry run and verification is enabled
      if (!this.options.dryRun && this.changesLog.length > 0 && !this.options.skipVerification) {
        const verifier = new StringExtractorVerifier(this);
        const verificationResults = await verifier.verify();
        this.results.verification = verificationResults;
        this.results.success = verificationResults.isValid;

        if (!verificationResults.isValid) {
          await this.rollback();
          this.results.error = 'String extraction verification failed. See verification report for details.';
          throw new Error('String extraction verification failed. See verification report for details.');
        }
      } else {
        this.results.success = true;
        this.results.verification = { skipped: true };
      }

      // Update string/strings.json if not dry run
      if (!this.options.dryRun && this.extractedStrings.size > 0) {
        await this.updateCodegenData();
        // Reload the updated data for verification
        this.loadCodegenData();
        this.results.extraction.stringsJsonUpdated = true;
        this.results.extraction.stringsJsonPath = this.codegenDataPath;
      }

      this.results.success = this.results.success !== false;

    } catch (error) {
      this.results.success = false;
      this.results.error = error.message;
      if (!this.options.dryRun) {
        await this.rollback();
      }
      throw error;
    }

    return this.results;
  }

  /**
   * Get list of files to process
   */
  async getFiles() {
    if (this.options.files.length > 0) {
      // Process specified files
      const files = [];
      const projectRoot = path.resolve(__dirname, '..');
      
      for (const pattern of this.options.files) {
        // Handle glob patterns
        if (pattern.includes('*') || pattern.includes('?')) {
          try {
            const result = execSync(`find "${projectRoot}" -path "${pattern}" -type f`, { 
              encoding: 'utf8'
            });
            files.push(...result.trim().split('\n').filter(f => f));
          } catch (error) {
            this.log(`Warning: Could not find files matching pattern: ${pattern}`, 'warn');
          }
        } else {
          // Handle direct file paths
          const fullPath = path.resolve(projectRoot, pattern);
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            files.push(fullPath);
          } else {
            this.log(`Warning: File not found: ${pattern}`, 'warn');
          }
        }
      }
      return files;
    }
    
    if (this.options.project) {
      // Process entire project
      return this.getProjectFiles();
    }
    
    throw new Error('No files specified. Use --files or --project option');
  }

  /**
   * Get all JavaScript files in the project
   */
  getProjectFiles() {
    const projectRoot = path.resolve(__dirname, '..');
    const jsFiles = [];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip excluded directories
          const relativePath = path.relative(projectRoot, fullPath);
          if (this.options.exclude.some(pattern => this.matchesPattern(relativePath, pattern))) {
            continue;
          }
          scanDirectory(fullPath);
        } else if (stat.isFile() && /\.(js|mjs|cjs|ts|tsx)$/.test(item)) {
          jsFiles.push(fullPath);
        }
      }
    };
    
    scanDirectory(projectRoot);
    
    // Apply file limit
    if (jsFiles.length > this.options.maxFiles) {
      this.log(`Found ${jsFiles.length} files, limiting to ${this.options.maxFiles} files`);
      return jsFiles.slice(0, this.options.maxFiles);
    }
    
    return jsFiles;
  }

  /**
   * Check if path matches a pattern
   */
  matchesPattern(path, pattern) {
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    
    return new RegExp(`^${regexPattern}$`).test(path);
  }

  /**
   * Process a single file
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.originalFiles.set(filePath, content);

      const extractedStrings = this.extractStringsFromFile(content, filePath);

      if (extractedStrings.length > 0) {
        // Only collect strings for strings.json, do not modify source files
        this.changesLog.push({
          file: filePath,
          stringsExtracted: extractedStrings.length,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      this.log(`Error processing file ${filePath}: ${error.message}`, 'error');
    }
  }

  /**
   * Extract strings from file content
   */
  extractStringsFromFile(content, filePath) {
    const extractedStrings = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const strings = this.extractStringsFromLine(line, i + 1, filePath);
      extractedStrings.push(...strings);
    }
    
    return extractedStrings;
  }

  /**
   * Extract strings from a single line
   */
  extractStringsFromLine(line, lineNumber, filePath) {
    const strings = [];
    
    // More precise regex patterns for different quote types
    // This ensures we don't match partial strings or create malformed matches
    const patterns = [
      // Double quotes - more precise to avoid partial matches
      /"([^"\\]*(?:\\.[^"\\]*)*)"/g,
      // Single quotes - more precise to avoid partial matches  
      /'([^'\\]*(?:\\.[^'\\]*)*)'/g,
      // Backticks - more precise for template literals
      /`([^`\\]*(?:\\.[^`\\]*)*)`/g
    ];
    
    for (const pattern of patterns) {
      let match;
      // Reset regex lastIndex to ensure proper matching
      pattern.lastIndex = 0;
      
      while ((match = pattern.exec(line)) !== null) {
        const stringContent = match[1];
        
        // Skip if string should be ignored
        if (this.shouldIgnoreString(stringContent, line, match.index)) {
          continue;
        }
        
        // Skip if match is incomplete or malformed
        if (!stringContent || stringContent.length === 0) {
          continue;
        }
        
        // Generate key and categorize
        const key = this.generateKey(stringContent);
        const category = this.categorizeString(stringContent, line);
        
        strings.push({
          content: stringContent,
          key,
          category,
          line: lineNumber,
          file: filePath,
          context: this.getContext(line, match.index),
          originalLine: line.trim()
        });
        
        // Store for codegen data update
        this.extractedStrings.set(key, {
          content: stringContent,
          category,
          sources: (this.extractedStrings.get(key)?.sources || []).concat(`${path.relative(process.cwd(), filePath)}:${lineNumber}`)
        });
      }
    }
    
    return strings;
  }

  /**
   * Check if string should be ignored
   */
  shouldIgnoreString(stringContent, line, index) {
    // Check ignore patterns
    for (const pattern of this.ignorePatterns) {
      if (pattern.test(stringContent) || pattern.test(line.trim())) {
        return true;
      }
    }
    
    // Check if already using string service
    const beforeString = line.substring(0, index);
    if (beforeString.includes('strings.')) {
      return true;
    }
    
    // Check if it's in a comment
    const commentIndex = Math.max(
      line.lastIndexOf('//', index),
      line.lastIndexOf('/*', index)
    );
    if (commentIndex > -1) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate key for string
   */
  generateKey(stringContent) {
    // Convert to lowercase and replace spaces/special chars with underscores
    let key = stringContent
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 50); // Limit length
    
    // If too short or empty, use hash
    if (key.length < 3) {
      key = `string_${Math.abs(stringContent.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)).toString(36)}`;
    }
    
    // Ensure uniqueness
    let uniqueKey = key;
    let counter = 1;
    while (this.extractedStrings.has(uniqueKey)) {
      uniqueKey = `${key}_${counter}`;
      counter++;
    }
    
    return uniqueKey;
  }

  /**
   * Categorize string based on content and context
   */
  categorizeString(stringContent, line) {
    for (const [category, config] of Object.entries(this.categories)) {
      for (const pattern of config.patterns) {
        if (pattern.test(stringContent) || pattern.test(line)) {
          return category;
        }
      }
    }
    
    return 'messages'; // Default category
  }

  /**
   * Get context around string for better categorization
   */
  getContext(line, index) {
    const before = line.substring(Math.max(0, index - 50), index);
    const after = line.substring(index, Math.min(line.length, index + 50));
    return { before, after };
  }

  /**
   * Replace strings in file with string service calls
   */
  replaceStringsInFile(content, extractedStrings, filePath) {
    let modifiedContent = content;
    const lines = content.split('\n');
    
    // Sort by line number in reverse order to avoid index shifting
    const sortedStrings = extractedStrings.sort((a, b) => b.line - a.line);
    
    for (const stringInfo of sortedStrings) {
      const lineIndex = stringInfo.line - 1;
      if (lineIndex >= lines.length) continue;
      
      let line = lines[lineIndex];
      const originalLine = line;
      
      // Determine appropriate method
      const method = this.getStringServiceMethod(stringInfo.category, line);
      
      // Replace string with service call
      const quoteType = this.detectQuoteType(originalLine, stringInfo.content);
      const searchString = `${quoteType}${this.escapeRegex(stringInfo.content)}${quoteType}`;
      const replacement = this.createServiceCall(method, stringInfo.key, stringInfo.content);
      
      line = line.replace(new RegExp(this.escapeRegex(searchString), 'g'), replacement);

      // Update the line if it was modified
      if (line !== originalLine) {
        lines[lineIndex] = line;
      }
    }
    
    modifiedContent = lines.join('\n');
    
    // Add string service import if needed
    if (extractedStrings.length > 0 && !this.hasStringServiceImport(modifiedContent)) {
      modifiedContent = this.addStringServiceImport(modifiedContent, filePath);
    }
    
    return modifiedContent;
  }

  /**
   * Check if file already has string service import
   */
  hasStringServiceImport(content) {
    return content.includes('getStringService') || 
           content.includes('require.*string-service') ||
           content.includes('from.*string-service');
  }

  /**
   * Add string service import to file
   */
  addStringServiceImport(content, filePath) {
    const lines = content.split('\n');
    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    
    // Find the last import/require statement
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('const ') && line.includes('require')) {
        lastImportIndex = i;
      } else if (line.startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    const importStatement = isTypeScript 
      ? `import { getStringService } from '${path.relative(path.dirname(filePath), '../../string/string-service')}';`
      : `const { getStringService } = require('${path.relative(path.dirname(filePath), '../../string/string-service')}');`;
    
    let insertIndex = 0;
    
    // Add import after the last existing import
    if (lastImportIndex >= 0) {
      insertIndex = lastImportIndex + 1;
    } else {
      // Add at the beginning after any shebang or comments
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#!') || line.startsWith('/*') || line.startsWith('//')) {
          insertIndex = i + 1;
        } else {
          break;
        }
      }
    }
    
    lines.splice(insertIndex, 0, importStatement);
    
    // Add strings initialization after imports
    const stringsInit = "const strings = getStringService();";
    lines.splice(insertIndex + 1, 0, stringsInit);
    lines.splice(insertIndex + 2, 0, '');
    
    return lines.join('\n');
  }

  /**
   * Detect quote type used in original string
   */
  detectQuoteType(line, content) {
    if (line.includes(`"${content}"`)) return '"';
    if (line.includes(`'${content}'`)) return "'";
    if (line.includes(`\`${content}\``)) return '`';
    return '"'; // Default
  }

  /**
   * Escape regex special characters
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get appropriate string service method
   */
  getStringServiceMethod(category, line) {
    if (category === 'errors') return 'getError';
    if (category === 'messages') return 'getMessage';
    if (category === 'labels') return 'getLabel';
    if (category === 'console') return 'getConsole';
    
    // Context-based detection
    if (line.includes('console.')) return 'getConsole';
    if (line.includes('throw') || line.includes('Error')) return 'getError';
    
    return 'getMessage'; // Default
  }

  /**
   * Create string service call
   */
  createServiceCall(method, key, originalContent) {
    // Check if string has parameters that need interpolation
    const hasParams = /\{[^}]+\}/.test(originalContent);
    
    if (hasParams) {
      // Extract parameter names for interpolation
      const paramMatches = originalContent.match(/\{([^}]+)\}/g) || [];
      const paramNames = paramMatches.map(p => p.slice(1, -1));
      
      if (paramNames.length > 0) {
        const paramsObject = paramNames.map(name => `${name}: ${name}`).join(', ');
        return `${method}('${key}', { ${paramsObject} })`;
      }
    }
    
    return `${method}('${key}')`;
  }



  /**
   * Load existing codegen data
   */
  loadCodegenData() {
    try {
      const content = fs.readFileSync(this.codegenDataPath, 'utf8');
      this.codegenData = JSON.parse(content);
      
      // Ensure i18n structure exists
      if (!this.codegenData.i18n) {
        this.codegenData.i18n = {};
      }
      if (!this.codegenData.i18n.en) {
        this.codegenData.i18n.en = {};
      }
      
      // Ensure categories exist
      for (const category of Object.keys(this.categories)) {
        if (!this.codegenData.i18n.en[category]) {
          this.codegenData.i18n.en[category] = {};
        }
      }
      
    } catch (error) {
      this.log(`Error loading string/strings.json: ${error.message}`, 'error');
      this.codegenData = { i18n: { en: {} } };
    }
  }

  /**
   * Deduplicate strings in strings.json by content within each category, keeping first occurrence
   */
  deduplicateStrings() {
    const deduplicated = { i18n: { en: {} } };

    // Process each category separately
    for (const category of Object.keys(this.codegenData.i18n.en)) {
      deduplicated.i18n.en[category] = {};
      const seenContent = new Set();

      // Keep only the first occurrence of each content within this category
      for (const [key, content] of Object.entries(this.codegenData.i18n.en[category])) {
        if (!seenContent.has(content)) {
          deduplicated.i18n.en[category][key] = content;
          seenContent.add(content);
        }
      }
    }

    // Preserve non-i18n data
    for (const [key, value] of Object.entries(this.codegenData)) {
      if (key !== 'i18n') {
        deduplicated[key] = value;
      }
    }

    return deduplicated;
  }

  /**
   * Update string/strings.json with extracted strings
   */
  async updateCodegenData() {
    for (const [key, info] of this.extractedStrings) {
      if (!this.codegenData.i18n.en[info.category][key]) {
        this.codegenData.i18n.en[info.category][key] = info.content;
      }
    }

    // Deduplicate strings
    const deduplicatedData = this.deduplicateStrings();

    // Write deduplicated data to strings.json
    fs.writeFileSync(this.codegenDataPath, JSON.stringify(deduplicatedData, null, 2), 'utf8');
  }



  /**
   * Generate extraction report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalStrings: this.extractedStrings.size,
        filesModified: this.changesLog.length,
        categories: {}
      },
      details: {}
    };

    // Categorize extracted strings
    for (const [key, info] of this.extractedStrings) {
      if (!report.summary.categories[info.category]) {
        report.summary.categories[info.category] = 0;
      }
      report.summary.categories[info.category]++;

      report.details[key] = {
        content: info.content,
        category: info.category,
        sources: info.sources
      };
    }

    // Display summary as JSON (passive mode - no file writes)
    const summaryLog = {
      timestamp: new Date().toISOString(),
      component: 'StringExtractor',
      level: 'info',
      event: 'extraction_summary',
      data: {
        totalStrings: report.summary.totalStrings,
        filesModified: report.summary.filesModified,
        categories: report.summary.categories
      }
    };
    console.log(JSON.stringify(summaryLog));
  }

  /**
   * Rollback changes
   */
  async rollback() {
    this.log('Rolling back changes...');
    
    // Restore original files
    for (const [filePath, content] of this.originalFiles) {
      try {
        fs.writeFileSync(filePath, content, 'utf8');
        this.log(`Restored: ${path.relative(process.cwd(), filePath)}`);
      } catch (error) {
        this.log(`Error restoring ${filePath}: ${error.message}`, 'error');
      }
    }
    
    this.log('Rollback completed');
  }

  /**
   * Log message
   */
  log(message, level = 'info') {
    if (!this.options.verbose && level === 'info') return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      component: 'StringExtractor',
      level: level,
      message: message
    };

    console.log(JSON.stringify(logEntry));
  }
}

/**
 * String Extractor Verifier - Validates extraction results
 */
class StringExtractorVerifier {
  constructor(extractor) {
    this.extractor = extractor;
    this.verificationResults = {
      isValid: true,
      passed: [],
      failed: [],
      warnings: [],
      todoItems: []
    };
  }

  /**
   * Run comprehensive verification
   */
  async verify() {
    try {
      await this.verifyStringServiceCalls();
      await this.verifyProjectIntegrity();

      // Determine overall validity
      this.verificationResults.isValid = this.verificationResults.failed.length === 0;

      return this.verificationResults;

    } catch (error) {
      this.verificationResults.isValid = false;
      return this.verificationResults;
    }
  }



  /**
   * Verify string service calls are properly formed
   */
  async verifyStringServiceCalls() {
    const modifiedFiles = this.extractor.changesLog.map(log => log.file);

    for (const filePath of modifiedFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        // Find all string service calls
        const stringServiceCallRegex = /strings\.(getError|getMessage|getLabel|getConsole)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
        let match;

        while ((match = stringServiceCallRegex.exec(content)) !== null) {
          const method = match[1];
          const key = match[2];
          const fullMatch = match[0];

          // Check if key exists in strings.json for the appropriate category
          const category = method.replace('get', '').toLowerCase();
          // Handle plural categories in JSON (error->errors, message->messages, etc.)
          const jsonCategory = category === 'error' ? 'errors' :
                              category === 'message' ? 'messages' :
                              category === 'label' ? 'labels' :
                              category;
          const keyExists = this.extractor.codegenData?.i18n?.en?.[jsonCategory]?.[key];

          if (!keyExists) {
            this.verificationResults.failed.push({
              type: 'string_service_call',
              file: filePath,
              message: `❌ String key not found: ${key} in category ${category}`
            });

            this.verificationResults.todoItems.push({
              number: this.verificationResults.todoItems.length + 1,
              priority: 'HIGH',
              action: 'Add Missing String Key',
              file: filePath,
              details: `String key "${key}" not found in ${category} category`,
              suggestion: `Add the missing key to string/strings.json under the ${category} category`
            });
          } else {
            this.verificationResults.passed.push({
              type: 'string_service_call',
              file: filePath,
              message: `✅ String service call valid: ${method}('${key}')`
            });
          }

          // Check for malformed calls
          if (!fullMatch.endsWith(')')) {
            this.verificationResults.failed.push({
              type: 'string_service_call',
              file: filePath,
              message: `❌ Malformed string service call: ${fullMatch}`
            });

            this.verificationResults.todoItems.push({
              number: this.verificationResults.todoItems.length + 1,
              priority: 'HIGH',
              action: 'Fix Malformed Call',
              file: filePath,
              details: `Incomplete string service call: ${fullMatch}`,
              suggestion: 'Ensure all string service calls are properly closed'
            });
          }
        }

        // Check for incorrect import paths
        const importRegex = /require\(['"`]([^'"`]*string-service[^'"`]*?)['"`]\)/g;
        let importMatch;
        while ((importMatch = importRegex.exec(content)) !== null) {
          const importPath = importMatch[1];

          // Check if import path points to correct location
          if (importPath.includes('services/string-service') && !fs.existsSync(path.resolve(path.dirname(filePath), importPath))) {
            this.verificationResults.failed.push({
              type: 'import_path',
              file: filePath,
              message: `❌ Incorrect string service import path: ${importPath}`
            });

            this.verificationResults.todoItems.push({
              number: this.verificationResults.todoItems.length + 1,
              priority: 'HIGH',
              action: 'Fix Import Path',
              file: filePath,
              details: `Import path "${importPath}" does not exist`,
              suggestion: `Change to correct path: relative path to string/string-service.js`
            });
          }
        }

      } catch (error) {
        this.verificationResults.warnings.push({
          type: 'string_service_call',
          file: filePath,
          message: `⚠️  Could not verify string service calls: ${error.message}`
        });
      }
    }
  }

  /**
   * Verify overall project integrity
   */
  async verifyProjectIntegrity() {
    try {
      // Check if strings.json is valid JSON
      const stringsContent = fs.readFileSync(this.extractor.codegenDataPath, 'utf8');
      JSON.parse(stringsContent);

      this.verificationResults.passed.push({
        type: 'project_integrity',
        file: this.extractor.codegenDataPath,
        message: '✅ strings.json is valid JSON'
      });

      // Check for duplicate keys
      const keys = new Set();
      const duplicates = [];

      for (const category of Object.keys(this.extractor.codegenData.i18n.en)) {
        for (const key of Object.keys(this.extractor.codegenData.i18n.en[category])) {
          const fullKey = `${category}.${key}`;
          if (keys.has(fullKey)) {
            duplicates.push(fullKey);
          } else {
            keys.add(fullKey);
          }
        }
      }

      if (duplicates.length > 0) {
        this.verificationResults.warnings.push({
          type: 'project_integrity',
          file: this.extractor.codegenDataPath,
          message: `⚠️  Duplicate string keys found: ${duplicates.join(', ')}`
        });

        this.verificationResults.todoItems.push({
          number: this.verificationResults.todoItems.length + 1,
          priority: 'MEDIUM',
          action: 'Resolve Duplicate Keys',
          file: this.extractor.codegenDataPath,
          details: `Duplicate keys: ${duplicates.join(', ')}`,
          suggestion: 'Rename or merge duplicate string keys'
        });
      }
    } catch (error) {
      this.verificationResults.isValid = false;
      this.verificationResults.failed.push({
        type: 'project_integrity',
        file: this.extractor.codegenDataPath,
        message: `❌ Invalid JSON in strings.json: ${error.message}`
      });

      this.verificationResults.todoItems.push({
        number: this.verificationResults.todoItems.length + 1,
        priority: 'HIGH',
        action: 'Fix JSON Syntax',
        file: this.extractor.codegenDataPath,
        details: `JSON parsing error: ${error.message}`,
        suggestion: 'Check for missing commas, quotes, or brackets'
      });
    }
  }
}

/**
 * Passive Interface Functions for AI and Programmatic Usage
 * 
 * These functions provide controlled access to string extraction capabilities
 * without automatic execution or CLI behavior.
 */

/**
 * Analyze strings in files without modifying them (read-only)
 * @param {Object} options - Analysis options
 * @param {string[]} options.files - File patterns to analyze
 * @param {boolean} options.project - Analyze entire project
 * @param {string[]} options.exclude - Patterns to exclude
 * @param {number} options.maxFiles - Maximum files to process (default: 50)
 * @param {boolean} options.verbose - Enable detailed logging
 * @returns {Promise<Object>} Detailed analysis results
 */
async function analyzeStrings(options = {}) {
  const analysisOptions = {
    ...options,
    dryRun: true,
    verbose: options.verbose || false,
    maxFiles: options.maxFiles || 50
  };

  const extractor = new StringExtractor(analysisOptions);

  const analysis = await extractor.extract();

  // Add additional analysis-specific fields
  analysis.mode = 'READ_ONLY_ANALYSIS';
  analysis.summary = {
    totalStrings: analysis.extraction.totalStrings,
    filesAnalyzed: analysis.extraction.filesProcessed,
    categories: {},
    impact: {
      highImpact: 0,
      mediumImpact: 0,
      lowImpact: 0
    }
  };
  analysis.details = {};
  analysis.recommendations = [];
  analysis.warnings = [];

  // Categorize extracted strings and assess impact
  for (const stringInfo of analysis.extraction.strings) {
    const { key, content, category, sources } = stringInfo;

    if (!analysis.summary.categories[category]) {
      analysis.summary.categories[category] = 0;
    }
    analysis.summary.categories[category]++;

    // Assess impact based on category and usage
    let impact = 'low';
    if (category === 'errors') impact = 'high';
    else if (category === 'messages' || category === 'console') impact = 'medium';

    analysis.summary.impact[`${impact}Impact`]++;

    analysis.details[key] = {
      content,
      category,
      impact,
      sources,
      recommendations: generateRecommendations({ category, sources, content })
    };
  }

  // Generate overall recommendations
  analysis.recommendations = generateOverallRecommendations(analysis);

  // Add safety warnings
  if (analysis.extraction.filesProcessed >= analysisOptions.maxFiles) {
    analysis.warnings.push(`⚠️  File limit reached (${analysisOptions.maxFiles}). Consider increasing limit or using more specific patterns.`);
  }

  return analysis;
}

/**
 * Preview extraction changes with detailed output
 * @param {Object} options - Preview options
 * @returns {Promise<Object>} Detailed preview with proposed changes
 */
async function previewExtraction(options = {}) {
  const previewOptions = {
    ...options,
    dryRun: true,
    verbose: true,
    maxFiles: options.maxFiles || 50
  };

  const extractor = new StringExtractor(previewOptions);

  const preview = await extractor.extract();

  // Add preview-specific fields
  preview.mode = 'PREVIEW_CHANGES';
  preview.proposedChanges = {};
  preview.impact = {
    filesModified: preview.extraction.filesProcessed,
    stringsExtracted: preview.extraction.totalStrings,
    linesAdded: 0,
    complexityChange: 'minimal'
  };
  preview.risks = [];
  preview.benefits = [];

  // Calculate proposed changes
  for (const stringInfo of preview.extraction.strings) {
    const { key, content, category, sources } = stringInfo;

    for (const source of sources) {
      const [filePath, lineNumber] = source.split(':');

      if (!preview.proposedChanges[filePath]) {
        preview.proposedChanges[filePath] = {
          modifications: [],
          complexity: 'low'
        };
      }

      preview.proposedChanges[filePath].modifications.push({
        line: parseInt(lineNumber),
        original: content,
        replacement: `strings.getMessage('${key}')`, // Simplified for preview
        category,
        risk: assessChangeRisk({ category, sources, content })
      });
    }
  }

  // Calculate impact metrics
  preview.impact.linesAdded = Object.values(preview.proposedChanges)
    .reduce((total, file) => total + file.modifications.length * 2, 0); // 2 lines per change (comment + code)

  // Generate risks and benefits
  preview.risks = generateExtractionRisks(preview);
  preview.benefits = generateExtractionBenefits(preview);

  return preview;
}

/**
 * Extract strings with full logging and verification
 * @param {Object} options - Extraction options
 * @returns {Promise<Object>} Extraction results with comprehensive logging
 */
async function extractStrings(options = {}) {
  const extractionOptions = {
    ...options,
    dryRun: false,
    verbose: true,
    maxFiles: options.maxFiles || 50
  };

  const extractor = new StringExtractor(extractionOptions);

  const results = await extractor.extract();

  // Run verification if not already done
  if (!results.verification || results.verification.skipped) {
    const verifier = new StringExtractorVerifier(extractor);
    const verificationResults = await verifier.verify();
    results.verification = verificationResults;
    results.success = verificationResults.isValid;
  }

  // Generate next steps
  results.nextSteps = generateNextSteps(results);

  return results;
}

/**
 * Get AI-friendly analysis report
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Comprehensive AI analysis report
 */
async function getAnalysisReport(options = {}) {
  const analysis = await analyzeStrings(options);

  const report = {
    executiveSummary: {
      totalStrings: analysis.summary.totalStrings,
      filesAnalyzed: analysis.summary.filesAnalyzed,
      complexity: assessProjectComplexity(analysis),
      recommendation: getTopRecommendation(analysis)
    },
    technicalDetails: {
      categories: analysis.summary.categories,
      impactAssessment: analysis.summary.impact,
      fileBreakdown: analyzeFileDistribution(analysis),
      stringPatterns: analyzeStringPatterns(analysis)
    },
    actionableInsights: {
      immediateActions: getImmediateActions(analysis),
      longTermImprovements: getLongTermImprovements(analysis),
      riskMitigation: getRiskMitigationStrategies(analysis)
    },
    metadata: {
      generatedAt: analysis.timestamp,
      fileLimit: analysis.safety.fileLimit,
      processingMode: analysis.mode
    }
  };

  return report;
}

// Helper functions for AI analysis
function generateRecommendations(stringInfo) {
  const recommendations = [];
  
  if (stringInfo.category === 'errors') {
    recommendations.push('High priority: Error strings should be extracted first for consistent error handling');
  }
  
  if (stringInfo.sources.length > 3) {
    recommendations.push('Consider consolidating: String used in multiple locations');
  }
  
  if (stringInfo.content.length > 100) {
    recommendations.push('Long string: Consider breaking into smaller, reusable components');
  }
  
  return recommendations;
}

function generateOverallRecommendations(analysis) {
  const recommendations = [];
  
  if (analysis.summary.impact.highImpact > 0) {
    recommendations.push('Start with error strings for immediate benefit');
  }
  
  if (analysis.summary.filesAnalyzed >= analysis.safety.fileLimit) {
    recommendations.push('Consider processing files in batches due to limit');
  }
  
  recommendations.push('Run preview extraction first to review changes');
  recommendations.push('Always verify extraction results with comprehensive testing');
  
  return recommendations;
}

function assessChangeRisk(stringInfo) {
  if (stringInfo.category === 'errors') return 'high';
  if (stringInfo.sources.length > 2) return 'medium';
  return 'low';
}

function generateExtractionRisks(preview) {
  const risks = [];
  
  if (preview.impact.filesModified > 10) {
    risks.push('High number of file modifications - consider batching');
  }
  
  if (preview.impact.stringsExtracted > 50) {
    risks.push('Large number of strings - potential for merge conflicts');
  }
  
  return risks;
}

function generateExtractionBenefits(preview) {
  const benefits = [
    'Centralized string management',
    'Improved internationalization support',
    'Consistent error messaging',
    'Better code maintainability'
  ];
  
  return benefits;
}

function assessProjectComplexity(analysis) {
  if (analysis.summary.totalStrings > 100) return 'high';
  if (analysis.summary.totalStrings > 50) return 'medium';
  return 'low';
}

// Helper functions for extraction analysis
function getTopRecommendation(analysis) {
  if (analysis.summary.impact.highImpact > 0) {
    return 'Start with error strings for immediate benefit';
  }
  if (analysis.summary.filesAnalyzed >= analysis.safety.fileLimit) {
    return 'Consider processing files in batches due to limit';
  }
  return 'Run preview extraction first to review changes';
}

function analyzeFileDistribution(analysis) {
  // Implementation for file distribution analysis
  return {};
}

function analyzeStringPatterns(analysis) {
  // Implementation for string pattern analysis
  return {};
}

function getImmediateActions(analysis) {
  const actions = [];
  if (analysis.summary.impact.highImpact > 0) {
    actions.push('Extract error strings first');
  }
  actions.push('Run preview extraction to review changes');
  return actions;
}

function getLongTermImprovements(analysis) {
  return [
    'Implement automated string extraction in CI/CD',
    'Set up internationalization workflow',
    'Create string usage analytics'
  ];
}

function getRiskMitigationStrategies(analysis) {
  return [
    'Always run extraction in dry-run mode first',
    'Maintain backups of all modified files',
    'Test thoroughly after extraction'
  ];
}

function generateNextSteps(results) {
  const nextSteps = [
    'Review extraction results',
    'Test modified code functionality',
    'Commit changes with descriptive message'
  ];

  if (!results.success) {
    nextSteps.unshift('Fix verification failures');
  }

  return nextSteps;
}

// Main CLI function (simplified for now)
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse basic CLI args
  if (args.includes('--dry-run') || args.includes('--preview')) {
    options.dryRun = true;
  }
  if (args.includes('--project')) {
    options.project = true;
  }
  if (args.includes('--verbose')) {
    options.verbose = true;
  }
  if (args.includes('--deduplicate')) {
    options.deduplicate = true;
  }
  if (args.includes('--skip-verification')) {
    options.skipVerification = true;
  }

  try {
    if (options.deduplicate) {
      const extractor = new StringExtractor({ dryRun: true });
      extractor.loadCodegenData();
      const deduplicatedData = extractor.deduplicateStrings();

      // Write deduplicated data to strings.json
      const stringsPath = extractor.codegenDataPath;
      fs.writeFileSync(stringsPath, JSON.stringify(deduplicatedData, null, 2), 'utf8');

      return deduplicatedData;
    } else if (options.dryRun) {
      const result = await previewExtraction(options);
      return result;
    } else {
      const result = await extractStrings(options);
      return result;
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  StringExtractor,
  StringExtractorVerifier,
  analyzeStrings,
  previewExtraction,
  extractStrings,
  getAnalysisReport
};

// Run if called directly
if (require.main === module) {
  main();
}
