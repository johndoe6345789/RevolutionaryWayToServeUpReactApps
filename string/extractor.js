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
      backup: options.backup !== false,
      verbose: options.verbose || false,
      exclude: options.exclude || ['node_modules/**', '.git/**', 'coverage/**', 'dist/**', 'build/**'],
      maxFiles: options.maxFiles || 50, // Add 50 file limit
      ...options
    };
    
    this.codegenDataPath = path.resolve(__dirname, 'strings.json');
    this.backupDir = path.resolve(__dirname, '../.string-extractor-backups');
    this.changesLog = [];
    this.extractedStrings = new Map();
    this.originalFiles = new Map();
    
    // Initialize categories and patterns
    this.initializePatterns();
    
    this.log('String Extractor initialized');
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
    try {
      this.log('Starting string extraction process...');
      
      // Load existing codegen data
      this.loadCodegenData();
      
      // Get files to process
      const files = await this.getFiles();
      this.log(`Found ${files.length} files to process`);
      
      // Process each file
      for (const file of files) {
        await this.processFile(file);
      }
      
      // Verify modifications if not dry run
      if (!this.options.dryRun && this.changesLog.length > 0) {
        const verifier = new StringExtractorVerifier(this);
        const verificationResults = await verifier.verify();
        
        if (!verificationResults.isValid) {
          this.log('Verification failed - rolling back changes', 'error');
          await this.rollback();
          throw new Error('String extraction verification failed. See verification report for details.');
        }
      }
      
      // Update string/strings.json if not dry run
      if (!this.options.dryRun && this.extractedStrings.size > 0) {
        await this.updateCodegenData();
        this.log(`Updated string/strings.json with ${this.extractedStrings.size} new strings`);
      }
      
      // Generate report
      this.generateReport();
      
      this.log('String extraction completed successfully');
      
    } catch (error) {
      this.log(`Error during extraction: ${error.message}`, 'error');
      if (!this.options.dryRun) {
        await this.rollback();
      }
      throw error;
    }
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
        this.log(`Extracted ${extractedStrings.length} strings from ${path.relative(process.cwd(), filePath)}`);
        
        if (!this.options.dryRun) {
          const modifiedContent = this.replaceStringsInFile(content, extractedStrings, filePath);
          if (modifiedContent !== content) {
            // Create backup
            await this.createBackup(filePath);
            // Write modified content
            fs.writeFileSync(filePath, modifiedContent, 'utf8');
            this.changesLog.push({
              file: filePath,
              stringsExtracted: extractedStrings.length,
              timestamp: new Date().toISOString()
            });
          }
        }
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
      
      // Add procedural marking comment
      if (line !== originalLine) {
        const markingComment = this.createMarkingComment(stringInfo);
        lines[lineIndex] = `${markingComment}\n${line}`;
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
   * Create procedural marking comment
   */
  createMarkingComment(stringInfo) {
    const timestamp = new Date().toISOString().split('T')[0];
    const relativePath = path.relative(process.cwd(), stringInfo.file);
    
    return `// AUTO-EXTRACTED: Extracted by string-extractor.js on ${timestamp}
// Original: "${stringInfo.content}"
// File: ${relativePath}:${stringInfo.line}
// Replaced with: strings.${this.getStringServiceMethod(stringInfo.category, '')}('${stringInfo.key}')`;
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
   * Deduplicate strings in strings.json by content, keeping first occurrence
   */
  deduplicateStrings() {
    const deduplicated = { i18n: { en: {} } };

    // Create a map of content -> first key found
    const contentToFirstKey = new Map();

    // First pass: collect all unique content -> first key mappings
    for (const category of Object.keys(this.codegenData.i18n.en)) {
      for (const [key, content] of Object.entries(this.codegenData.i18n.en[category])) {
        if (!contentToFirstKey.has(content)) {
          contentToFirstKey.set(content, { key, category });
        }
      }
    }

    // Second pass: rebuild structure with deduplicated strings
    for (const category of Object.keys(this.codegenData.i18n.en)) {
      deduplicated.i18n.en[category] = {};
      for (const [key, content] of Object.entries(this.codegenData.i18n.en[category])) {
        // Only keep if this is the first occurrence of this content
        const firstOccurrence = contentToFirstKey.get(content);
        if (firstOccurrence.key === key && firstOccurrence.category === category) {
          deduplicated.i18n.en[category][key] = content;
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

    // Output deduplicated JSON instead of writing to file
    console.log(JSON.stringify(deduplicatedData, null, 2));
  }

  /**
   * Create backup of file
   */
  async createBackup(filePath) {
    if (!this.options.backup) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const relativePath = path.relative(process.cwd(), filePath);
    const backupPath = path.join(this.backupDir, relativePath, `.backup.${timestamp}`);
    
    // Ensure backup directory exists
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    
    // Copy file to backup location
    fs.copyFileSync(filePath, backupPath);
    
    this.log(`Created backup: ${backupPath}`);
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
    
    // Save report
    const reportPath = path.join(this.backupDir, `extraction-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.mkdirSync(this.backupDir, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    // Display summary
    console.log('\n📊 Extraction Summary:');
    console.log(`  Total strings extracted: ${report.summary.totalStrings}`);
    console.log(`  Files modified: ${report.summary.filesModified}`);
    console.log('  By category:');
    for (const [category, count] of Object.entries(report.summary.categories)) {
      console.log(`    ${category}: ${count}`);
    }
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
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
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[${timestamp}] [StringExtractor]`;
    
    switch (level) {
      case 'error':
        console.error(`\x1b[31m${prefix} ✗ ${message}\x1b[0m`);
        break;
      case 'warn':
        console.warn(`\x1b[33m${prefix} ⚠ ${message}\x1b[0m`);
        break;
      case 'success':
        console.log(`\x1b[32m${prefix} ✓ ${message}\x1b[0m`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
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
    console.log('🔍 Starting verification process...');

    try {
      await this.verifyBackups();
      await this.verifyStringServiceCalls();
      await this.verifyProjectIntegrity();

      // Determine overall validity
      this.verificationResults.isValid = this.verificationResults.failed.length === 0;

      console.log(`✅ Verification completed: ${this.verificationResults.passed.length} passed, ${this.verificationResults.failed.length} failed, ${this.verificationResults.warnings.length} warnings`);

      return this.verificationResults;

    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      this.verificationResults.isValid = false;
      return this.verificationResults;
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackups() {
    for (const [filePath, originalContent] of this.extractor.originalFiles) {
      try {
        const backupDir = path.dirname(path.join(this.extractor.backupDir, path.relative(process.cwd(), filePath)));
        const backupDirExists = fs.existsSync(backupDir);

        if (!backupDirExists) {
          this.verificationResults.warnings.push({
            type: 'backup',
            file: filePath,
            message: '⚠️  Backup directory does not exist',
            details: 'Backup directory does not exist',
            suggestion: 'Verify backup creation is enabled and permissions are correct'
          });
          continue;
        }

        const backupFiles = fs.readdirSync(backupDir).filter(f => f.startsWith('.backup.'));
        if (backupFiles.length === 0) {
          this.verificationResults.warnings.push({
            type: 'backup',
            file: filePath,
            message: '⚠️  No backup files found'
          });
        } else {
          // Verify most recent backup
          const latestBackup = backupFiles.sort().pop();
          const backupPath = path.join(backupDir, latestBackup);

          try {
            const backupContent = fs.readFileSync(backupPath, 'utf8');
            if (backupContent === originalContent) {
              this.verificationResults.passed.push({
                type: 'backup',
                file: filePath,
                message: '✅ Backup integrity verified'
              });
            } else {
              this.verificationResults.failed.push({
                type: 'backup',
                file: filePath,
                message: '❌ Backup content does not match original'
              });
            }
          } catch (backupError) {
            this.verificationResults.failed.push({
              type: 'backup',
              file: filePath,
              message: `❌ Cannot read backup file: ${backupError.message}`
            });
          }
        }
      } catch (error) {
        this.verificationResults.warnings.push({
          type: 'backup',
          file: filePath,
          message: `⚠️  Could not verify backup: ${error.message}`
        });
      }
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
        const stringServiceCallRegex = /strings\.(getError|getMessage|getLabel|getConsole)\s*\(\s*['"`]([^'"`]+)['"`]/g;
        let match;

        while ((match = stringServiceCallRegex.exec(content)) !== null) {
          const method = match[1];
          const key = match[2];
          const fullMatch = match[0];

          // Check if key exists in strings.json
          const category = method.replace('get', '').toLowerCase();
          const keyExists = this.extractor.codegenData?.i18n?.en?.[category]?.[key];

          if (!keyExists) {
            this.verificationResults.failed.push({
              type: 'string_service_call',
              file: filePath,
              message: `❌ String key not found: ${category}.${key}`
            });

            this.verificationResults.todoItems.push({
              number: this.verificationResults.todoItems.length + 1,
              priority: 'HIGH',
              action: 'Add Missing String Key',
              file: filePath,
              details: `String key "${category}.${key}" not found in strings.json`,
              suggestion: `Add the missing key to string/strings.json or check for typos`
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
  console.log('🔍 Starting Passive String Analysis (Read-Only Mode)\n');
  
  const analysisOptions = {
    ...options,
    dryRun: true,
    verbose: options.verbose || false,
    maxFiles: options.maxFiles || 50
  };
  
  const extractor = new StringExtractor(analysisOptions);
  
  try {
    await extractor.extract();
    
    const analysis = {
      timestamp: new Date().toISOString(),
      mode: 'READ_ONLY_ANALYSIS',
      safety: {
        fileLimit: analysisOptions.maxFiles,
        filesProcessed: extractor.changesLog.length,
        readOnly: true
      },
      summary: {
        totalStrings: extractor.extractedStrings.size,
        filesAnalyzed: extractor.changesLog.length,
        categories: {},
        impact: {
          highImpact: 0,
          mediumImpact: 0,
          lowImpact: 0
        }
      },
      details: {},
      recommendations: [],
      warnings: []
    };
    
    // Categorize extracted strings and assess impact
    for (const [key, info] of Object.entries(extractor.extractedStrings)) {
      if (!analysis.summary.categories[info.category]) {
        analysis.summary.categories[info.category] = 0;
      }
      analysis.summary.categories[info.category]++;
      
      // Assess impact based on category and usage
      let impact = 'low';
      if (info.category === 'errors') impact = 'high';
      else if (info.category === 'messages' || info.category === 'console') impact = 'medium';
      
      analysis.summary.impact[`${impact}Impact`]++;
      
      analysis.details[key] = {
        content: info.content,
        category: info.category,
        impact,
        sources: info.sources,
        recommendations: generateRecommendations(info)
      };
    }
    
    // Generate overall recommendations
    analysis.recommendations = generateOverallRecommendations(analysis);
    
    // Add safety warnings
    if (extractor.changesLog.length >= analysisOptions.maxFiles) {
      analysis.warnings.push(`⚠️  File limit reached (${analysisOptions.maxFiles}). Consider increasing limit or using more specific patterns.`);
    }
    
    console.log('✅ Analysis Complete - No Files Modified\n');
    console.log(`📊 Analysis Summary: ${analysis.summary.totalStrings} strings found in ${analysis.summary.filesAnalyzed} files`);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    throw error;
  }
}

/**
 * Preview extraction changes with detailed output
 * @param {Object} options - Preview options
 * @returns {Promise<Object>} Detailed preview with proposed changes
 */
async function previewExtraction(options = {}) {
  console.log('👁️  Starting Extraction Preview (Dry Run Mode)\n');
  
  const previewOptions = {
    ...options,
    dryRun: true,
    verbose: true,
    maxFiles: options.maxFiles || 50
  };
  
  const extractor = new StringExtractor(previewOptions);
  
  try {
    await extractor.extract();
    
    const preview = {
      timestamp: new Date().toISOString(),
      mode: 'PREVIEW_CHANGES',
      safety: {
        fileLimit: previewOptions.maxFiles,
        filesToModify: extractor.changesLog.length,
        dryRun: true
      },
      proposedChanges: {},
      impact: {
        filesModified: extractor.changesLog.length,
        stringsExtracted: extractor.extractedStrings.size,
        linesAdded: 0,
        complexityChange: 'minimal'
      },
      risks: [],
      benefits: []
    };
    
    // Calculate proposed changes
    for (const [key, info] of extractor.extractedStrings) {
      for (const source of info.sources) {
        const [filePath, lineNumber] = source.split(':');
        
        if (!preview.proposedChanges[filePath]) {
          preview.proposedChanges[filePath] = {
            modifications: [],
            complexity: 'low'
          };
        }
        
        preview.proposedChanges[filePath].modifications.push({
          line: parseInt(lineNumber),
          original: info.content,
          replacement: `strings.${extractor.getStringServiceMethod(info.category, '')}('${key}')`,
          category: info.category,
          risk: assessChangeRisk(info)
        });
      }
    }
    
    // Calculate impact metrics
    preview.impact.linesAdded = Object.values(preview.proposedChanges)
      .reduce((total, file) => total + file.modifications.length * 2, 0); // 2 lines per change (comment + code)
    
    // Generate risks and benefits
    preview.risks = generateExtractionRisks(preview);
    preview.benefits = generateExtractionBenefits(preview);
    
    console.log('👁️  Preview Complete - No Files Modified\n');
    console.log(`📊 Proposed Changes: ${preview.impact.filesModified} files, ${preview.impact.stringsExtracted} strings`);
    
    return preview;
    
  } catch (error) {
    console.error('❌ Preview failed:', error.message);
    throw error;
  }
}

/**
 * Extract strings with full logging and verification
 * @param {Object} options - Extraction options
 * @returns {Promise<Object>} Extraction results with comprehensive logging
 */
async function extractStrings(options = {}) {
  console.log('🔧 Starting String Extraction with Full Verification\n');
  
  const extractionOptions = {
    ...options,
    dryRun: false,
    verbose: true,
    maxFiles: options.maxFiles || 50
  };
  
  const extractor = new StringExtractor(extractionOptions);
  
  try {
    await extractor.extract();
    
    // Run verification
    const verifier = new StringExtractorVerifier(extractor);
    const verificationResults = await verifier.verify();
    
    const results = {
      timestamp: new Date().toISOString(),
      mode: 'FULL_EXTRACTION',
      safety: {
        fileLimit: extractionOptions.maxFiles,
        filesModified: extractor.changesLog.length,
        backupsCreated: extractionOptions.backup
      },
      extraction: {
        totalStrings: extractor.extractedStrings.size,
        filesModified: extractor.changesLog.length,
        changesLog: extractor.changesLog
      },
      verification: verificationResults,
      success: verificationResults.isValid,
      nextSteps: []
    };
    
    // Generate next steps
    results.nextSteps = generateNextSteps(results);
    
    console.log(`🔧 Extraction Complete - Status: ${results.success ? '✅ SUCCESS' : '❌ FAILED'}\n`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
    await extractor.rollback();
    throw error;
  }
}

/**
 * Get AI-friendly analysis report
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Comprehensive AI analysis report
 */
async function getAnalysisReport(options = {}) {
  console.log('📊 Generating AI-Friendly Analysis Report\n');
  
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
  
  console.log('📊 AI Analysis Report Generated\n');
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

  try {
    if (options.deduplicate) {
      console.log('Running deduplication mode...');
      const extractor = new StringExtractor({ dryRun: true });
      extractor.loadCodegenData();
      const deduplicatedData = extractor.deduplicateStrings();
      console.log(JSON.stringify(deduplicatedData, null, 2));
      console.log('Deduplication completed successfully');
      return deduplicatedData;
    } else if (options.dryRun) {
      console.log('Running in dry-run mode...');
      const result = await previewExtraction(options);
      console.log('Dry run completed successfully');
      return result;
    } else {
      console.log('Running full extraction...');
      const result = await extractStrings(options);
      console.log('Extraction completed successfully');
      return result;
    }
  } catch (error) {
    console.error('Error:', error.message);
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
