#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * String Extractor - Memory-Based JSON Output
 *
 * Extracts strings from source files, stores results in memory, and returns as JSON.
 * No file modifications or rollback functionality.
 *
 * @author String Extractor
 * @version 3.0.0 - Memory Only
 */

class StringExtractor {
  constructor(options = {}) {
    this.options = {
      files: options.files || [],
      project: options.project || false,
      verbose: options.verbose || false,
      exclude: options.exclude || ['node_modules/**', '.git/**', 'coverage/**', 'dist/**', 'build/**'],
      maxFiles: options.maxFiles || 100,
      ...options
    };

    this.extractedStrings = new Map();
    this.processedFiles = [];
    this.filesWithNewStrings = new Set(); // Track files with strings not in strings.json
    this.filesWithPhantomReferences = new Set(); // Track files with phantom string references
    this.results = {
      timestamp: null,
      mode: 'EXTRACTION',
      safety: {},
      extraction: {},
      strings: {},
      success: true
    };

    // Initialize categories and patterns
    this.initializePatterns();
    this.loadExistingStrings();
  }

  /**
   * Load existing strings from strings.json
   */
  loadExistingStrings() {
    try {
      const stringsPath = path.resolve(__dirname, 'strings.json');
      if (fs.existsSync(stringsPath)) {
        const stringsData = JSON.parse(fs.readFileSync(stringsPath, 'utf8'));
        this.existingStrings = new Set();

        // Collect all existing string keys from all categories and languages
        if (stringsData.i18n) {
          for (const [lang, categories] of Object.entries(stringsData.i18n)) {
            for (const [category, strings] of Object.entries(categories)) {
              for (const key of Object.keys(strings)) {
                this.existingStrings.add(key);
              }
            }
          }
        }

        if (this.options.verbose) {
          this.log(`Loaded ${this.existingStrings.size} existing string keys from strings.json`, 'info');
        }
      } else {
        this.existingStrings = new Set();
        if (this.options.verbose) {
          this.log('strings.json not found, starting with empty set', 'info');
        }
      }
    } catch (error) {
      this.log(`Warning: Could not load existing strings: ${error.message}`, 'warn');
      this.existingStrings = new Set();
    }
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
   * Main extraction method - stores results in memory and returns as JSON
   */
  async extract() {
    this.results.timestamp = new Date().toISOString();

    try {
      // Get files to process
      const files = await this.getFiles();
      this.results.safety.filesFound = files.length;
      this.results.safety.maxFiles = this.options.maxFiles;

      // Process each file
      for (const file of files) {
        await this.processFile(file);
        this.processedFiles.push(path.relative(process.cwd(), file));
      }

      // Filter processed files to only include those with new strings or phantom references
      const filteredFiles = this.processedFiles.filter(filePath =>
        this.filesWithNewStrings.has(filePath) || this.filesWithPhantomReferences.has(filePath)
      );

      // Build final results
      this.results.extraction = {
        totalStrings: this.extractedStrings.size,
        filesProcessed: filteredFiles.length,
        processedFiles: filteredFiles,
        filesWithNewStrings: Array.from(this.filesWithNewStrings),
        filesWithPhantomReferences: Array.from(this.filesWithPhantomReferences)
      };

      // Only include strings from files that meet the criteria
      this.results.strings = {};
      for (const [key, info] of this.extractedStrings) {
        // Check if any of the sources are from files that should be included
        const validSources = info.sources.filter(source => {
          const filePath = source.split(':')[0];
          return this.filesWithNewStrings.has(filePath) || this.filesWithPhantomReferences.has(filePath);
        });

        if (validSources.length > 0) {
          if (!this.results.strings[info.category]) {
            this.results.strings[info.category] = {};
          }
          this.results.strings[info.category][key] = {
            content: info.content,
            sources: validSources
          };
        }
      }

      this.results.success = true;

    } catch (error) {
      this.results.success = false;
      this.results.error = error.message;
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
    // Special handling for /** patterns (common for directory exclusion)
    if (pattern.endsWith('/**')) {
      const prefix = pattern.slice(0, -3); // remove `/**`
      return path === prefix || path.startsWith(prefix + '/');
    }

    // Convert glob pattern to regex for other patterns
    // First replace ** with a placeholder to avoid interference
    const regexPattern = pattern
      .replace(/\*\*/g, '___GLOBSTAR___')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')
      .replace(/___GLOBSTAR___/g, '.*');

    return new RegExp(`^${regexPattern}$`).test(path);
  }

  /**
   * Process a single file
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const extractedStrings = this.extractStringsFromFile(content, filePath);
      const phantomReferences = this.findPhantomReferences(content, filePath);

      const relativeFilePath = path.relative(process.cwd(), filePath);

      // Check if file has new strings
      const hasNewStrings = extractedStrings.some(stringInfo => !this.existingStrings.has(stringInfo.key));
      if (hasNewStrings) {
        this.filesWithNewStrings.add(relativeFilePath);
      }

      // Check if file has phantom references
      if (phantomReferences.length > 0) {
        this.filesWithPhantomReferences.add(relativeFilePath);
        if (this.options.verbose) {
          this.log(`Found ${phantomReferences.length} phantom references in ${relativeFilePath}: ${phantomReferences.map(ref => `${ref.method}('${ref.key}')`).join(', ')}`, 'info');
        }
      }

      // Store extracted strings in memory
      for (const stringInfo of extractedStrings) {
        const existing = this.extractedStrings.get(stringInfo.key);
        if (existing) {
          // Add to sources if not already present
          if (!existing.sources.includes(stringInfo.sources[0])) {
            existing.sources.push(stringInfo.sources[0]);
          }
        } else {
          this.extractedStrings.set(stringInfo.key, {
            content: stringInfo.content,
            category: stringInfo.category,
            sources: [stringInfo.sources[0]]
          });
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
          sources: [`${path.relative(process.cwd(), filePath)}:${lineNumber}`]
        });
        

      }
    }
    
    return strings;
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
   * Find phantom string references in file content
   */
  findPhantomReferences(content, filePath) {
    const phantomReferences = [];
    const lines = content.split('\n');

    // Pattern to match strings.get, strings.getError, strings.getMessage, strings.getLabel, strings.getConsole calls
    const stringServicePattern = /strings\.(get|getError|getMessage|getLabel|getConsole)\s*\(\s*["']([^"']+)["']\s*\)/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;

      // Reset regex lastIndex
      stringServicePattern.lastIndex = 0;

      while ((match = stringServicePattern.exec(line)) !== null) {
        const method = match[1];
        const stringKey = match[2];

        // Check if this key exists in strings.json
        if (!this.existingStrings.has(stringKey)) {
          phantomReferences.push({
            method,
            key: stringKey,
            line: i + 1,
            source: `${path.relative(process.cwd(), filePath)}:${i + 1}`
          });
        }
      }
    }

    return phantomReferences;
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
 * Extract strings from files and return as JSON
 * @param {Object} options - Extraction options
 * @returns {Promise<Object>} JSON results with extracted strings
 */
async function extractStrings(options = {}) {
  const extractor = new StringExtractor(options);
  return await extractor.extract();
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse basic CLI args
  if (args.includes('--project')) {
    options.project = true;
  }
  if (args.includes('--verbose')) {
    options.verbose = true;
  }

  try {
    const result = await extractStrings(options);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  StringExtractor,
  extractStrings
};

// Run if called directly
if (require.main === module) {
  main();
}
