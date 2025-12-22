#!/usr/bin/env node

/**
 * API Stubs Plugin
 * Generates API stubs for undocumented modules.
 * Migrated from generate_api_stubs.py
 */

const fs = require('fs');
const path = require('path');
const BasePlugin = require('../lib/base-plugin');

// Import string service
const { getStringService } = require('../string/string-service');

class ApiStubsPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'api-stubs',
      description: 'Generates API stubs for undocumented modules',
      version: '1.0.0',
      author: 'RWTRA',
      category: 'generation',
      commands: [
        {
          name: 'api-stubs',
          description: 'Generate API stubs for undocumented modules'
        }
      ],
      dependencies: []
    });

    this.results = {
      template: null,
      stubsGenerated: 0,
      stubsSkipped: 0,
      modulesProcessed: 0,
      errors: [],
      stubsDirectory: null
    };
  }

  /**
   * Main plugin execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Generation results
   */
  async execute(context) {
    await this.initialize(context);
    
    this.log('Starting API stub generation...', 'info');
    this.log(this.colorize('📝 API Stubs Generation', context.colors.cyan));
    this.log(this.colorize('='.repeat(50), context.colors.white));
    
    const projectRoot = context.options['project-root'] || path.join(context.bootstrapPath, '..');
    const templatePath = context.options['template-path'] || path.join(projectRoot, 'docs', 'templates', 'js-ts-module-template.md');
    const stubRoot = context.options['stub-root'] || path.join(projectRoot, 'docs', 'api', 'stubs');
    const force = context.options.force || false;
    
    this.results.stubsDirectory = stubRoot;
    
    try {
      // Load template
      this.results.template = await this._loadTemplate(templatePath);
      
      // Build module summaries
      const modules = await this._buildModules(projectRoot);
      this.results.modulesProcessed = modules.length;
      
      // Generate stubs
      for (const module of modules) {
        await this._generateStub(module, stubRoot, templatePath, force);
      }
      
      this._generateReport(context);
      
      // Save results if output directory specified
      if (context.options.output) {
        await this._saveResults(context);
      }
      
      return this.results;
      
    } catch (error) {
      this.log(`API stub generation failed: ${error.message}`, 'error');
      this.results.errors.push(error.message);
      throw error;
    }
  }

  /**
   * Loads the template file
   */
  async _loadTemplate(templatePath) {
    this.log(`Loading template from: ${templatePath}`, 'info');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }
    
    return fs.readFileSync(templatePath, 'utf8');
  }

  /**
   * Builds module summaries by scanning source files
   */
  async _buildModules(projectRoot) {
    this.log('Scanning source files for modules...', 'info');
    
    const modules = [];
    const sourceFiles = await this._collectSourceFiles(projectRoot);
    
    for (const filePath of sourceFiles) {
      try {
        const relativePath = path.relative(projectRoot, filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const { globals, functions } = this._extractSymbols(content);
        
        modules.push({
          path: relativePath,
          globals: globals.sort(),
          functions: functions.sort()
        });
        
      } catch (error) {
        this.log(`Error processing ${filePath}: ${error.message}`, 'warn');
        this.results.errors.push(`Error processing ${filePath}: ${error.message}`);
      }
    }
    
    this.log(`Found ${modules.length} modules to process`, 'info');
    return modules;
  }

  /**
   * Collects all source files in the project
   */
  async _collectSourceFiles(projectRoot) {
    const sourceFiles = [];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip certain directories
          if (!['node_modules', '.git', 'coverage', 'dist', 'build'].includes(item)) {
            scanDirectory(fullPath);
          }
        } else if (item.endsWith('.js') || item.endsWith('.ts')) {
          sourceFiles.push(fullPath);
        }
      }
    };
    
    scanDirectory(projectRoot);
    return sourceFiles;
  }

  /**
   * Extracts symbols (globals and functions) from file content
   */
  _extractSymbols(content) {
    const globals = new Set();
    const functions = new Set();
    
    // Extract globals (const, let, var at top level)
    const globalRegex = /^(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/gm;
    let match;
    while ((match = globalRegex.exec(content)) !== null) {
      globals.add(match[1]);
    }
    
    // Extract function declarations
    const functionRegex = /^(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/gm;
    while ((match = functionRegex.exec(content)) !== null) {
      functions.add(match[1]);
    }
    
    // Extract class declarations
    const classRegex = /^class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/gm;
    while ((match = classRegex.exec(content)) !== null) {
      functions.add(match[1]);
    }
    
    // Extract exported functions/classes
    const exportRegex = /export\s+(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
    while ((match = exportRegex.exec(content)) !== null) {
      functions.add(match[1]);
    }
    
    // Extract exported classes
    const exportClassRegex = /export\s+class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = exportClassRegex.exec(content)) !== null) {
      functions.add(match[1]);
    }
    
    // Extract module.exports assignments
    const moduleExportsRegex = /module\.exports\s*=\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = moduleExportsRegex.exec(content)) !== null) {
      functions.add(match[1]);
    }
    
    return { globals, functions };
  }

  /**
   * Generates a stub file for a module
   */
  async _generateStub(module, stubRoot, templatePath, force) {
    try {
      const targetPath = path.join(stubRoot, path.dirname(module.path));
      const targetFile = path.join(targetPath, path.basename(module.path, path.extname(module.path)) + '.md');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      
      // Skip if file exists and force is not set
      if (fs.existsSync(targetFile) && !force) {
        this.results.stubsSkipped++;
        this.log(`Skipped existing stub: ${targetFile}`, 'info');
        return;
      }
      
      // Generate stub content
      const stubContent = this._renderStub(module, this.results.template);
      
      // Write stub file
      fs.writeFileSync(targetFile, stubContent, 'utf8');
      this.results.stubsGenerated++;
      this.log(`Generated stub: ${targetFile}`, 'info');
      
    } catch (error) {
      this.log(`Error generating stub for ${module.path}: ${error.message}`, 'error');
      this.results.errors.push(`Error generating stub for ${module.path}: ${error.message}`);
    }
  }

  /**
   * Renders stub content using template
   */
  _renderStub(module, template) {
    let content = template.replace(/<path\/or\/identifier>/g, module.path);
    
    // Replace global placeholders
    const globalTable = this._generateGlobalTable(module.globals);
    content = content.replace(/`<GLOBAL_NAME>`/g, globalTable);
    
    // Replace function placeholders
    const functionTable = this._generateFunctionTable(module.functions);
    content = content.replace(/`<exportedFunction>`/g, functionTable);
    
    return content;
  }

  /**
   * Generates markdown table for globals
   */
  _generateGlobalTable(globals) {
    if (globals.length === 0) {
      return 'No globals exported by this module.';
    }
    
    const rows = globals.map(name => 
      `| ${name} | TODO: Add description | \`TODO: Add usage example\` |`
    ).join('\n');
    
    return rows;
  }

  /**
   * Generates markdown table for functions
   */
  _generateFunctionTable(functions) {
    if (functions.length === 0) {
      return 'No functions exported by this module.';
    }
    
    const rows = functions.map(name => 
      `| ${name} | \`TODO: Add signature\` | TODO: Add description |`
    ).join('\n');
    
    return rows;
  }

  /**
   * Generates and displays the generation report
   */
  _generateReport(context) {
    const strings = getStringService();
    console.log(context.colors.reset + strings.getConsole('api_stubs_generation_report'));
    console.log(strings.getConsole('report_separator'));

    // Summary
    console.log(strings.getConsole('summary_header'));
    console.log(strings.getConsole('modules_processed', { count: this.results.modulesProcessed }));
    console.log(strings.getConsole('stubs_generated', { count: this.results.stubsGenerated }));
    console.log(strings.getConsole('stubs_skipped', { count: this.results.stubsSkipped }));
    console.log(strings.getConsole('stubs_directory', { directory: this.results.stubsDirectory }));

    // Errors
    if (this.results.errors.length > 0) {
      console.log(strings.getConsole('errors_header'));
      for (const error of this.results.errors.slice(0, 10)) {
        console.log(strings.getConsole('error_item', { error }));
      }
      if (this.results.errors.length > 10) {
        console.log(strings.getConsole('more_errors', { count: this.results.errors.length - 10 }));
      }
    }

    // Recommendations
    console.log(strings.getConsole('recommendations_header'));
    this._generateRecommendations(context);
  }

  /**
   * Generates recommendations based on generation results
   */
  _generateRecommendations(context) {
    if (this.results.stubsGenerated === 0) {
      console.log(context.colors.yellow + '   - All stubs already exist (use --force to regenerate)' + context.colors.reset);
    } else {
      console.log(context.colors.green + `   - Fill in ${this.results.stubsGenerated} generated stub files with actual documentation` + context.colors.reset);
    }
    
    if (this.results.stubsSkipped > 0) {
      console.log(context.colors.cyan + `   - Review ${this.results.stubsSkipped} existing stub files for updates` + context.colors.reset);
    }
    
    if (this.results.errors.length > 0) {
      console.log(context.colors.red + `   - Fix ${this.results.errors.length} errors that occurred during generation` + context.colors.reset);
    }
    
    console.log(context.colors.cyan + '   - Add examples and usage patterns to stub files' + context.colors.reset);
    console.log(context.colors.cyan + '   - Review and customize template if needed' + context.colors.reset);
    console.log(context.colors.cyan + '   - Add cross-references between related modules' + context.colors.reset);
  }

  /**
   * Saves generation results to file
   */
  async _saveResults(context) {
    const outputDir = context.options['output-dir'] || path.join(context.bootstrapPath, 'reports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(outputDir, `api-stubs-${timestamp}.json`);
    
    const reportData = {
      timestamp,
      summary: {
        modulesProcessed: this.results.modulesProcessed,
        stubsGenerated: this.results.stubsGenerated,
        stubsSkipped: this.results.stubsSkipped,
        stubsDirectory: this.results.stubsDirectory
      },
      errors: this.results.errors
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
    this.log(`Results saved to: ${resultsPath}`, 'info');
  }
}

module.exports = ApiStubsPlugin;
