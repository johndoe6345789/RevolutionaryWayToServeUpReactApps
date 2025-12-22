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
      ...options
    };
    
    this.codegenDataPath = path.resolve(__dirname, '../codegen-data.json');
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
      /^(true|false|null|undefined|\d+)$/
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
      
      // Update codegen-data.json if not dry run
      if (!this.options.dryRun && this.extractedStrings.size > 0) {
        await this.updateCodegenData();
        this.log(`Updated codegen-data.json with ${this.extractedStrings.size} new strings`);
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
      for (const pattern of this.options.files) {
        try {
          const result = execSync(`find . -name "${pattern}" -type f`, { 
            encoding: 'utf8',
            cwd: path.resolve(__dirname, '..')
          });
          files.push(...result.trim().split('\n').filter(f => f));
        } catch (error) {
          this.log(`Warning: Could not find files matching pattern: ${pattern}`, 'warn');
        }
      }
      return files.map(f => path.resolve(__dirname, '..', f));
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
    
    // Regex patterns for different quote types
    const patterns = [
      // Double quotes (multiline)
      /"([^"\\]*(\\.[^"\\]*)*)"/g,
      // Single quotes (multiline)
      /'([^'\\]*(\\.[^'\\]*)*)'/g,
      // Backticks (multiline template literals)
      /`([^`\\]*(\\.[^`\\]*)*)`/g
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const stringContent = match[1];
        
        // Skip if string should be ignored
        if (this.shouldIgnoreString(stringContent, line, match.index)) {
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
      this.log(`Error loading codegen-data.json: ${error.message}`, 'error');
      this.codegenData = { i18n: { en: {} } };
    }
  }

  /**
   * Update codegen-data.json with extracted strings
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
        console.log('\nString Extraction Automation Script\n\nUSAGE:\n  node scripts/string-extractor.js [options]\n\nOPTIONS:\n  --files <patterns>     Comma-separated file patterns to process\n  --project              Process all JavaScript files in project\n  --dry-run              Preview changes without modifying files\n  --no-backup            Do not create backups before modifying files\n  --verbose              Show detailed logging\n  --exclude <patterns>   Comma-separated patterns to exclude\n  --rollback             Rollback last extraction\n  --help, -h             Show this help message\n\nEXAMPLES:\n  # Extract from specific files\n  node scripts/string-extractor.js --files "src/**/*.js"\n  \n  # Extract from entire project\n  node scripts/string-extractor.js --project\n  \n  # Dry run to preview changes\n  node scripts/string-extractor.js --dry-run --files "revolutionary-codegen/**/*.js"\n  \n  # Exclude certain directories\n  node scripts/string-extractor.js --project --exclude "test/**,docs/**"\n        ');
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

// Export for testing
module.exports = StringExtractor;

// Run if called directly
if (require.main === module) {
  main();
}
