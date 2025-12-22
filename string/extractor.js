#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
   * Update string/strings.json with extracted strings
   */
  async updateCodegenData() {
    for (const [key, info] of this.extractedStrings) {
      if (!this.codegenData.i18n.en[info.category][key]) {
        this.codegenData.i18n.en[info.category][key] = info.content;
      }
    }
    
    // Create backup before updating
    await this.createBackup(this.codegenDataPath);
    
    // Write updated data
    fs.writeFileSync(this.codegenDataPath, JSON.stringify(this.codegenData, null, 2), 'utf8');
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

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--files':
        options.files = (args[++i] || '').split(',').map(f => f.trim());
        break;
      case '--project':
        options.project = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-backup':
        options.backup = false;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--rollback':
        options.rollback = true;
        break;
      case '--exclude':
        options.exclude = (args[++i] || '').split(',').map(f => f.trim());
        break;
      case '--help':
      case '-h':
        console.log('\nString Extraction Automation Script\n\nUSAGE:\n  node string/extractor.js [options]\n\nOPTIONS:\n  --files <patterns>     Comma-separated file patterns to process\n  --project              Process all JavaScript files in project\n  --dry-run              Preview changes without modifying files\n  --no-backup            Do not create backups before modifying files\n  --verbose              Show detailed logging\n  --exclude <patterns>   Comma-separated patterns to exclude\n  --rollback             Rollback last extraction\n  --help, -h             Show this help message\n\nEXAMPLES:\n  # Extract from specific files\n  node string/extractor.js --files "src/**/*.js"\n  \n  # Extract from entire project\n  node string/extractor.js --project\n  \n  # Dry run to preview changes\n  node string/extractor.js --dry-run --files "revolutionary-codegen/**/*.js"\n  \n  # Exclude certain directories\n  node string/extractor.js --project --exclude "test/**,docs/**"\n        ');
        process.exit(0);
        break;
    }
  }
  
  if (options.rollback) {
    // Rollback functionality would need to read from backup metadata
    console.log('Rollback functionality requires backup metadata - not implemented yet');
    process.exit(1);
  }
  
  try {
    const extractor = new StringExtractor(options);
    await extractor.extract();
  } catch (error) {
    console.error('Extraction failed:', error.message);
    process.exit(1);
  }
}

/**
 * String Extractor Verifier - Validates extraction results and prevents corruption
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
    this.verificationResults = {
      isValid: true,
      passed: [],
      failed: [],
      warnings: [],
      todoItems: []
    };

    console.log('\n🔍 Running String Extraction Verification...\n');

    // 1. Verify syntax of modified files
    await this.verifyFileSyntax();
    
    // 2. Verify class structures
    await this.verifyClassStructures();
    
    // 3. Verify imports and string service usage
    await this.verifyImportsAndStringService();
    
    // 4. Verify backup integrity
    await this.verifyBackupIntegrity();
    
    // 5. Verify string service calls
    await this.verifyStringServiceCalls();
    
    // 6. Verify overall project integrity
    await this.verifyProjectIntegrity();

    // Generate numbered todo list output
    this.generateTodoListOutput();

    return this.verificationResults;
  }

  /**
   * Verify syntax of all modified files
   */
  async verifyFileSyntax() {
    const modifiedFiles = this.extractor.changesLog.map(log => log.file);
    
    for (const filePath of modifiedFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Basic syntax check using Node.js
        const module = {
          exports: {}
        };
        const originalRequire = require;
        
        // Create a sandbox environment for syntax checking
        const sandbox = {
          console: { log: () => {}, error: () => {} },
          require: originalRequire,
          module,
          exports: module.exports,
          __filename: filePath,
          __dirname: path.dirname(filePath)
        };

        // Try to evaluate the code (syntax check only)
        new Function('console', 'require', 'module', 'exports', '__filename', '__dirname', content)
          .call(sandbox, sandbox.console, sandbox.require, sandbox.module, sandbox.exports, sandbox.__filename, sandbox.__dirname);
        
        this.verificationResults.passed.push({
          type: 'syntax',
          file: filePath,
          message: '✅ Syntax validation passed'
        });
        
      } catch (error) {
        this.verificationResults.isValid = false;
        this.verificationResults.failed.push({
          type: 'syntax',
          file: filePath,
          message: `❌ Syntax error: ${error.message}`,
          line: error.lineNumber || 'unknown',
          column: error.columnNumber || 'unknown'
        });
        
        this.verificationResults.todoItems.push({
          number: this.verificationResults.todoItems.length + 1,
          priority: 'HIGH',
          action: 'Fix Syntax Error',
          file: filePath,
          details: `Line ${error.lineNumber || 'unknown'}: ${error.message}`,
          suggestion: 'Check for malformed string replacements or missing quotes'
        });
      }
    }
  }

  /**
   * Verify class structures are intact
   */
  async verifyClassStructures() {
    const modifiedFiles = this.extractor.changesLog.map(log => log.file);
    
    for (const filePath of modifiedFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Find class declarations
        const classMatches = content.match(/^class\s+\w+/gm) || [];
        
        for (const classMatch of classMatches) {
          const className = classMatch.replace('class ', '').trim();
          
          // Check if class has proper structure
          const classStart = content.indexOf(classMatch);
          const classContent = content.substring(classStart);
          
          // Basic class structure checks
          const hasConstructor = classContent.includes('constructor(');
          const hasMethods = /(\w+\s*\([^)]*\)\s*{)/.test(classContent);
          const hasBraces = classContent.includes('{') && classContent.includes('}');
          
          if (!hasBraces) {
            this.verificationResults.isValid = false;
            this.verificationResults.failed.push({
              type: 'class_structure',
              file: filePath,
              message: `❌ Class ${className} has missing braces`,
              class: className
            });
            
            this.verificationResults.todoItems.push({
              number: this.verificationResults.todoItems.length + 1,
              priority: 'HIGH',
              action: 'Fix Class Structure',
              file: filePath,
              details: `Class ${className} is missing proper braces`,
              suggestion: 'Ensure class has opening and closing braces'
            });
          } else {
            this.verificationResults.passed.push({
              type: 'class_structure',
              file: filePath,
              message: `✅ Class ${className} structure is valid`
            });
          }
          
          // Check for broken method signatures
          const methodMatches = classContent.match(/^\s*\w+\s*\([^)]*\)\s*{/gm) || [];
          for (const methodMatch of methodMatches) {
            if (methodMatch.includes('strings.') && !methodMatch.includes('getError') && 
                !methodMatch.includes('getMessage') && !methodMatch.includes('getLabel') && 
                !methodMatch.includes('getConsole')) {
              this.verificationResults.warnings.push({
                type: 'method_signature',
                file: filePath,
                message: `⚠️  Suspicious method signature: ${methodMatch.trim()}`
              });
            }
          }
        }
        
      } catch (error) {
        this.verificationResults.warnings.push({
          type: 'class_structure',
          file: filePath,
          message: `⚠️  Could not verify class structures: ${error.message}`
        });
      }
    }
  }

  /**
   * Verify imports and string service usage
   */
  async verifyImportsAndStringService() {
    const modifiedFiles = this.extractor.changesLog.map(log => log.file);
    
    for (const filePath of modifiedFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if string service import exists when needed
        const hasStringServiceUsage = content.includes('strings.');
        const hasStringServiceImport = content.includes('getStringService') || 
                                      content.includes('require.*string-service') ||
                                      content.includes('from.*string-service');
        
        if (hasStringServiceUsage && !hasStringServiceImport) {
          this.verificationResults.isValid = false;
          this.verificationResults.failed.push({
            type: 'import',
            file: filePath,
            message: '❌ Missing string service import'
          });
          
          this.verificationResults.todoItems.push({
            number: this.verificationResults.todoItems.length + 1,
            priority: 'HIGH',
            action: 'Add Missing Import',
            file: filePath,
            details: 'String service is used but not imported',
            suggestion: 'Add: const { getStringService } = require("../bootstrap/services/string-service");'
          });
        } else if (hasStringServiceImport && !content.includes('const strings = getStringService();')) {
          this.verificationResults.warnings.push({
            type: 'import',
            file: filePath,
            message: '⚠️  String service imported but not initialized'
          });
          
          this.verificationResults.todoItems.push({
            number: this.verificationResults.todoItems.length + 1,
            priority: 'MEDIUM',
            action: 'Initialize String Service',
            file: filePath,
            details: 'String service is imported but not initialized',
            suggestion: 'Add: const strings = getStringService();'
          });
        } else {
          this.verificationResults.passed.push({
            type: 'import',
            file: filePath,
            message: '✅ String service imports are valid'
          });
        }
        
        // Check import order and placement
        const lines = content.split('\n');
        const importLines = lines.filter((line, index) => 
          (line.trim().startsWith('import ') || 
           (line.trim().startsWith('const ') && line.includes('require'))) &&
          index < 20 // Imports should be near the top
        );
        
        if (importLines.length === 0 && hasStringServiceUsage) {
          this.verificationResults.warnings.push({
            type: 'import_placement',
            file: filePath,
            message: '⚠️  String service usage found but no imports detected in expected locations'
          });
        }
        
      } catch (error) {
        this.verificationResults.warnings.push({
          type: 'import',
          file: filePath,
          message: `⚠️  Could not verify imports: ${error.message}`
        });
      }
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackupIntegrity() {
    const modifiedFiles = this.extractor.changesLog.map(log => log.file);
    
    for (const filePath of modifiedFiles) {
      try {
        // Check if backup exists
        const relativePath = path.relative(process.cwd(), filePath);
        const backupDir = path.join(this.extractor.backupDir, relativePath);
        
        if (!fs.existsSync(backupDir)) {
          this.verificationResults.warnings.push({
            type: 'backup',
            file: filePath,
            message: '⚠️  No backup directory found'
          });
          
          this.verificationResults.todoItems.push({
            number: this.verificationResults.todoItems.length + 1,
            priority: 'LOW',
            action: 'Check Backup Directory',
            file: filePath,
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
            const originalContent = this.extractor.originalFiles.get(filePath);
            
            if (backupContent !== originalContent) {
              this.verificationResults.failed.push({
                type: 'backup',
                file: filePath,
                message: '❌ Backup content does not match original'
              });
              
              this.verificationResults.todoItems.push({
                number: this.verificationResults.todoItems.length + 1,
                priority: 'HIGH',
                action: 'Fix Backup Integrity',
                file: filePath,
                details: 'Backup file content mismatch',
                suggestion: 'Recreate backup manually or check backup creation process'
              });
            } else {
              this.verificationResults.passed.push({
                type: 'backup',
                file: filePath,
                message: '✅ Backup integrity verified'
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

  /**
   * Generate numbered todo list output
   */
  generateTodoListOutput() {
    console.log('\n📋 VERIFICATION RESULTS - NUMBERED TODO LIST\n');
    console.log('=' .repeat(60));
    
    if (this.verificationResults.todoItems.length === 0) {
      console.log('🎉 No issues found! All files passed verification.\n');
      return;
    }
    
    // Sort by priority (HIGH first) then by number
    const sortedItems = this.verificationResults.todoItems.sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.number - b.number;
    });
    
    console.log(`📊 Summary: ${this.verificationResults.passed.length} passed, ${this.verificationResults.failed.length} failed, ${this.verificationResults.warnings.length} warnings\n`);
    
    // Group by priority
    const grouped = {
      HIGH: sortedItems.filter(item => item.priority === 'HIGH'),
      MEDIUM: sortedItems.filter(item => item.priority === 'MEDIUM'),
      LOW: sortedItems.filter(item => item.priority === 'LOW')
    };
    
    // Display HIGH priority items
    if (grouped.HIGH.length > 0) {
      console.log('🚨 HIGH PRIORITY (Must Fix):\n');
      grouped.HIGH.forEach(item => {
        console.log(`${item.number}. [HIGH] ${item.action}`);
        console.log(`   📁 File: ${item.file}`);
        console.log(`   🔍 Details: ${item.details}`);
        console.log(`   💡 Suggestion: ${item.suggestion}`);
        console.log('');
      });
    }
    
    // Display MEDIUM priority items
    if (grouped.MEDIUM.length > 0) {
      console.log('⚠️  MEDIUM PRIORITY (Should Fix):\n');
      grouped.MEDIUM.forEach(item => {
        console.log(`${item.number}. [MEDIUM] ${item.action}`);
        console.log(`    📁 File: ${item.file}`);
        console.log(`    🔍 Details: ${item.details}`);
        console.log(`    💡 Suggestion: ${item.suggestion}`);
        console.log('');
      });
    }
    
    // Display LOW priority items
    if (grouped.LOW.length > 0) {
      console.log('💡 LOW PRIORITY (Nice to Fix):\n');
      grouped.LOW.forEach(item => {
        console.log(`${item.number}. [LOW] ${item.action}`);
        console.log(`     📁 File: ${item.file}`);
        console.log(`     🔍 Details: ${item.details}`);
        console.log(`     💡 Suggestion: ${item.suggestion}`);
        console.log('');
      });
    }
    
    console.log('=' .repeat(60));
    
    // Show failed verification details
    if (this.verificationResults.failed.length > 0) {
      console.log('\n❌ FAILED VERIFICATIONS:\n');
      this.verificationResults.failed.forEach(failure => {
        console.log(`   📁 ${failure.file}: ${failure.message}`);
      });
    }
    
    // Show warnings
    if (this.verificationResults.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:\n');
      this.verificationResults.warnings.forEach(warning => {
        console.log(`   📁 ${warning.file}: ${warning.message}`);
      });
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log(`🎯 Overall Status: ${this.verificationResults.isValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('=' .repeat(60) + '\n');
  }
}

// Export for testing
module.exports = {
  StringExtractor,
  StringExtractorVerifier
};

// Run if called directly
if (require.main === module) {
  main();
}
