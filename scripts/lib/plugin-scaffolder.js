/**
 * Plugin Scaffolder
 * Creates scaffold for new plugin development
 */

const fs = require('fs');
const path = require('path');

class PluginScaffolder {
  constructor() {
    this.templatesDir = path.join(__dirname, '..', 'templates');
    this.defaultTemplate = 'basic-plugin';
  }

  /**
   * Creates a new plugin scaffold
   * @param {string} pluginName - Name of the plugin
   * @param {Object} options - Scaffold options
   */
  async createPlugin(pluginName, options = {}) {
    const config = this.getScaffoldConfig(pluginName, options);
    
    // Create plugin directory
    const pluginDir = path.join(process.cwd(), 'plugins', config.pluginDir);
    if (fs.existsSync(pluginDir)) {
      throw new Error(`Plugin directory ${pluginDir} already exists`);
    }
    
    fs.mkdirSync(pluginDir, { recursive: true });
    
    // Create basic structure
    await this.createDirectoryStructure(pluginDir, config);
    
    // Generate files from templates
    await this.generateFiles(pluginDir, config);
    
    console.log(`✅ Plugin scaffold created: ${pluginDir}`);
    console.log(`📁 Next steps:`);
    console.log(`   1. cd ${config.pluginDir}`);
    console.log(`   2. Implement your plugin logic in modules/`);
    console.log(`   3. Update plugin.json with your plugin details`);
    console.log(`   4. Test with: node ../../lib/plugin-scaffolder.js test ${config.pluginDir}`);
  }

  /**
   * Gets scaffold configuration
   * @param {string} pluginName - Plugin name
   * @param {Object} options - Scaffold options
   * @returns {Object} - Scaffold configuration
   */
  getScaffoldConfig(pluginName, options) {
    const template = options.template || this.defaultTemplate;
    const category = options.category || 'utility';
    const language = options.language || null;
    
    return {
      pluginName,
      pluginDir: pluginName.toLowerCase().replace(/\s+/g, '-'),
      template,
      category,
      language,
      description: options.description || `${pluginName} plugin`,
      author: options.author || 'Developer',
      version: options.version || '1.0.0',
      commands: options.commands || [{ name: pluginName.toLowerCase().replace(/\s+/g, '-'), description: `Run ${pluginName}` }],
      modules: this.getDefaultModules(template)
    };
  }

  /**
   * Creates directory structure for plugin
   * @param {string} pluginDir - Plugin directory path
   * @param {Object} config - Scaffold configuration
   */
  async createDirectoryStructure(pluginDir, config) {
    const dirs = ['modules', 'utils', 'tests', 'docs'];
    
    for (const dir of dirs) {
      const dirPath = path.join(pluginDir, dir);
      fs.mkdirSync(dirPath, { recursive: true });
      
      // Create .gitkeep for empty directories
      fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');
    }
    
    // Create language-specific directories if needed
    if (config.language) {
      const langDir = path.join(pluginDir, 'language', config.language);
      fs.mkdirSync(langDir, { recursive: true });
      fs.writeFileSync(path.join(langDir, '.gitkeep'), '');
    }
  }

  /**
   * Gets default modules for template
   * @param {string} template - Template name
   * @returns {Array} - Array of default modules
   */
  getDefaultModules(template) {
    const moduleMap = {
      'basic-plugin': ['main-processor', 'report-generator'],
      'analysis-plugin': ['scanner', 'analyzer', 'detector', 'reporter'],
      'utility-plugin': ['core-utility', 'helper-functions'],
      'language-plugin': ['language-detector', 'syntax-analyzer', 'code-generator']
    };
    
    return moduleMap[template] || moduleMap['basic-plugin'];
  }

  /**
   * Generates plugin files from templates
   * @param {string} pluginDir - Plugin directory
   * @param {Object} config - Scaffold configuration
   */
  async generateFiles(pluginDir, config) {
    // Generate plugin.json
    await this.generatePluginJson(pluginDir, config);
    
    // Generate index.js
    await this.generateIndexJs(pluginDir, config);
    
    // Generate default modules
    for (const moduleName of config.modules) {
      await this.generateModule(pluginDir, moduleName, config);
    }
    
    // Generate README.md
    await this.generateReadme(pluginDir, config);
    
    // Generate test template
    await this.generateTestTemplate(pluginDir, config);
  }

  /**
   * Generates plugin.json metadata file
   * @param {string} pluginDir - Plugin directory
   * @param {Object} config - Scaffold configuration
   */
  async generatePluginJson(pluginDir, config) {
    const metadata = {
      name: config.pluginName,
      version: config.version,
      description: config.description,
      author: config.author,
      category: config.category,
      language: config.language,
      dependencies: [],
      commands: config.commands,
      entry: 'index.js',
      modules: config.modules.map(m => `modules/${m}.js`)
    };
    
    const metadataPath = path.join(pluginDir, 'plugin.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  }

  /**
   * Generates index.js entry file
   * @param {string} pluginDir - Plugin directory
   * @param {Object} config - Scaffold configuration
   */
  async generateIndexJs(pluginDir, config) {
    const template = `/**
 * ${config.description}
 * ${config.category} plugin for dev-cli
 */

const BasePlugin = require('../../lib/base-plugin');

class ${this.toPascalCase(config.pluginName)}Plugin extends BasePlugin {
  constructor(metadata) {
    super(metadata);
  }

  /**
   * Main plugin execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Plugin execution results
   */
  async execute(context) {
    await this.initialize(context);
    
    this.log('Starting ${config.pluginName}...', 'info');
    this.log(this.colorize('${config.description}', context.colors.cyan));
    
    // TODO: Implement your plugin logic here
    this.log('Plugin logic not implemented yet', 'warn');
    
    return {
      status: 'placeholder',
      message: 'Plugin scaffold created - implementation needed'
    };
  }
}

module.exports = ${this.toPascalCase(config.pluginName)}Plugin;`;

    const indexPath = path.join(pluginDir, 'index.js');
    fs.writeFileSync(indexPath, template, 'utf8');
  }

  /**
   * Generates a module file
   * @param {string} pluginDir - Plugin directory
   * @param {string} moduleName - Module name
   * @param {Object} config - Scaffold configuration
   */
  async generateModule(pluginDir, moduleName, config) {
    const template = `/**
 * ${moduleName} Module
 * Part of ${config.pluginName} plugin
 */

const ${this.toPascalCase(moduleName)} = {
  /**
   * TODO: Implement your ${moduleName} logic
   */
  async process(context) {
    this.log('${moduleName} processing...', 'info');
    
    // Module implementation goes here
    return { status: 'placeholder' };
  }
};

module.exports = ${this.toPascalCase(moduleName)};`;

    const modulePath = path.join(pluginDir, 'modules', `${moduleName}.js`);
    fs.writeFileSync(modulePath, template, 'utf8');
  }

  /**
   * Generates README.md
   * @param {string} pluginDir - Plugin directory
   * @param {Object} config - Scaffold configuration
   */
  async generateReadme(pluginDir, config) {
    const readme = `# ${config.pluginName}

${config.description}

## Installation

This plugin is part of the dev-cli system. It will be automatically discovered and loaded.

## Usage

\`\`\`bash
dev-cli ${config.pluginDir.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

## Development

1. Implement your plugin logic in the modules directory
2. Each module should be under 100 lines of code
3. Use atomic methods for better maintainability
4. Test your plugin thoroughly

## Structure

\`\`\`
${config.pluginDir}/
├── plugin.json          # Plugin metadata
├── index.js             # Main entry point
├── modules/             # Atomic modules (max 100 LOC each)
│   ├── ${config.modules[0] || 'main-processor'}.js
│   └── ...
├── utils/               # Utility functions
├── tests/               # Test files
└── docs/                # Documentation
\`\`\`

## Author

${config.author}

## Version

${config.version}
`;

    const readmePath = path.join(pluginDir, 'README.md');
    fs.writeFileSync(readmePath, readme, 'utf8');
  }

  /**
   * Generates test template
   * @param {string} pluginDir - Plugin directory
   * @param {Object} config - Scaffold configuration
   */
  async generateTestTemplate(pluginDir, config) {
    const testTemplate = `/**
 * ${config.pluginName} Plugin Tests
 */

const { PluginScaffolder } = require('../../lib/plugin-scaffolder');

describe('${config.pluginName} Plugin', () => {
  it('should create plugin scaffold', async () => {
    // Test scaffold creation
    const scaffolder = new PluginScaffolder();
    const config = scaffolder.getScaffoldConfig('${config.pluginName}');
    
    expect(config.pluginName).toBe('${config.pluginName}');
    expect(config.category).toBe('utility');
  });

  it('should have valid metadata', async () => {
    const scaffolder = new PluginScaffolder();
    const config = scaffolder.getScaffoldConfig('${config.pluginName}');
    
    expect(config.commands).toHaveLength(1);
    expect(config.modules).toContain('main-processor');
  });
});

// TODO: Add more comprehensive tests for your plugin
`;

    const testDir = path.join(pluginDir, 'tests');
    const testFile = path.join(testDir, `${config.pluginName}.test.js`);
    fs.writeFileSync(testFile, testTemplate, 'utf8');
  }

  /**
   * Converts string to PascalCase
   * @param {string} str - Input string
   * @returns {string} - PascalCase string
   */
  toPascalCase(str) {
    return str
      .replace(/(?:^\w|\b\w)/g, (letter, index) => letter.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  /**
   * Tests an existing plugin
   * @param {string} pluginDir - Plugin directory to test
   * @returns {Object} - Test results
   */
  async testPlugin(pluginDir) {
    const results = {
      valid: true,
      errors: [],
      warnings: []
    };

    try {
      // Check if plugin.json exists and is valid
      const metadataPath = path.join(pluginDir, 'plugin.json');
      if (!fs.existsSync(metadataPath)) {
        results.valid = false;
        results.errors.push('plugin.json not found');
        return results;
      }

      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      const requiredFields = ['name', 'version', 'description', 'entry', 'modules'];
      
      for (const field of requiredFields) {
        if (!metadata[field]) {
          results.valid = false;
          results.errors.push(`Missing required field: ${field}`);
        }
      }

      // Check modules directory exists
      const modulesDir = path.join(pluginDir, 'modules');
      if (!fs.existsSync(modulesDir)) {
        results.warnings.push('modules directory not found');
      } else {
        const modules = fs.readdirSync(modulesDir).filter(f => f.endsWith('.js'));
        
        for (const module of modules) {
          const modulePath = path.join(modulesDir, module);
          const content = fs.readFileSync(modulePath, 'utf8');
          const lines = content.split('\n').filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*');
          });
          
          if (lines.length > 100) {
            results.warnings.push(`Module ${module} exceeds 100 lines (${lines.length} lines)`);
          }
        }
      }

      // Check if index.js exists and has correct structure
      const indexPath = path.join(pluginDir, 'index.js');
      if (!fs.existsSync(indexPath)) {
        results.valid = false;
        results.errors.push('index.js not found');
      }

    } catch (error) {
      results.valid = false;
      results.errors.push(`Test failed: ${error.message}`);
    }

    return results;
  }
}

module.exports = PluginScaffolder;
