#!/usr/bin/env node

/**
 * ProjectStructureGenerator - Generates complete project folder structure
 * Creates directories, static files, and basic project setup from JSON specification
 * 
 * 🚀 Revolutionary Features:
 * - Recursive folder creation with unlimited depth
 * - Template-based file generation
 * - Permission management
 * - Git integration
 * - Package.json auto-generation
 */

const BaseCodegen = require('../base/base-codegen');
const path = require('path');
const fs = require('fs');

// Import string service
const { getStringService } = require('../../bootstrap/services/string-service');

class ProjectStructureGenerator extends BaseCodegen {
  constructor(options = {}) {
    super({
      ...options,
      outputDir: options.outputDir || './generated-project'
    });
    
    this.specification = null;
    this.projectConfig = null;
    this.structureConfig = null;
  }

  /**
   * Initialize the project structure generator
   * @returns {Promise<ProjectStructureGenerator>} The initialized generator
   */
  async initialize() {
    await super.initialize();
    const strings = getStringService();

    this.log(strings.getConsole('initializing_project_structure_generator'), 'info');
    
    // Load project specification
    if (this.options.specPath) {
      this.specification = this.loadConfig(this.options.specPath);
    } else if (this.options.specification) {
      this.specification = this.options.specification;
    } else {
      throw new Error('Project specification is required (specPath or specification option)');
    }
    
    // Extract configurations
    this.projectConfig = this.specification.project;
    this.structureConfig = this.specification.structure;
    
    // Validate specification
    this.validateSpecification();
    
    // Set project name in options for template processing
    this.options.projectName = this.projectConfig.name;
    
    return this;
  }

  /**
   * Generate the complete project structure
   * @param {Object} results - Generation results object
   * @returns {Promise<void>}
   */
  async generate(results) {
    this.log('📁 Generating project structure...', 'info');
    
    try {
      // Create root directory structure
      await this.createDirectoryStructure();
      
      // Generate static files
      await this.generateStaticFiles();
      
      // Generate configuration files
      await this.generateConfigurationFiles();
      
      // Generate package.json
      await this.generatePackageJson();
      
      // Generate README.md
      await this.generateReadme();
      
      // Generate .gitignore
      await this.generateGitignore();
      
      // Generate license file
      await this.generateLicense();
      
      // Create initial commit if git is available
      await this.initializeGit();
      
      // Trigger innovation features
      this.triggerInnovation('projectCreated', { 
        name: this.projectConfig.name,
        folders: this.structureConfig.folders?.length || 0,
        files: this.structureConfig.files?.length || 0
      });
      
    } catch (error) {
      this.log(`❌ Project structure generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Create the complete directory structure
   * @returns {Promise<void>}
   */
  async createDirectoryStructure() {
    this.log('📂 Creating directory structure...', 'info');
    
    if (!this.structureConfig.folders || this.structureConfig.folders.length === 0) {
      this.log('⚠️  No folders specified in structure configuration', 'warning');
      return;
    }
    
    let foldersCreated = 0;
    
    // Create folders recursively
    for (const folder of this.structureConfig.folders) {
      await this.createFolderRecursive(folder, '', 0);
      foldersCreated++;
    }
    
    this.log(`📁 Created ${foldersCreated} folder structures`, 'success');
  }

  /**
   * Create folders recursively with unlimited nesting
   * @param {Object} folder - Folder configuration
   * @param {string} parentPath - Parent path
   * @param {number} depth - Current nesting depth
   * @returns {Promise<void>}
   */
  async createFolderRecursive(folder, parentPath, depth) {
    const folderPath = path.join(parentPath, folder.path);
    const fullPath = path.join(this.options.outputDir, folderPath);
    
    // Create directory
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      this.log(`📁 Created: ${folderPath}`, 'info');
    }
    
    // Create .gitkeep file to preserve empty directories
    const gitkeepPath = path.join(fullPath, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '# This file ensures the directory is tracked by git\n');
    }
    
    // Create folder description file
    if (folder.description) {
      const descPath = path.join(fullPath, 'FOLDER.md');
      const descContent = `# ${folder.name}\n\n${folder.description}\n\n---\n*Auto-generated by RevolutionaryCodegen*\n`;
      fs.writeFileSync(descPath, descContent);
    }
    
    // Recursively create subfolders
    if (folder.subfolders && folder.subfolders.length > 0) {
      for (const subfolder of folder.subfolders) {
        await this.createFolderRecursive(subfolder, folderPath, depth + 1);
      }
    }
  }

  /**
   * Generate static files from configuration
   * @returns {Promise<void>}
   */
  async generateStaticFiles() {
    this.log('📄 Generating static files...', 'info');
    
    if (!this.structureConfig.files || this.structureConfig.files.length === 0) {
      this.log('⚠️  No static files specified in structure configuration', 'warning');
      return;
    }
    
    let filesGenerated = 0;
    
    for (const file of this.structureConfig.files) {
      await this.generateStaticFile(file);
      filesGenerated++;
    }
    
    this.log(`📝 Generated ${filesGenerated} static files`, 'success');
  }

  /**
   * Generate a single static file
   * @param {Object} fileConfig - File configuration
   * @returns {Promise<void>}
   */
  async generateStaticFile(fileConfig) {
    let content = fileConfig.content || '';
    
    // Process template if specified
    if (fileConfig.template) {
      content = await this.processTemplateFile(fileConfig.template);
    }
    
    // Process content with template variables
    const processedContent = this.processTemplate(content, {
      projectName: this.projectConfig.name,
      projectVersion: this.projectConfig.version,
      projectDescription: this.projectConfig.description,
      projectAuthor: this.projectConfig.author,
      generated: this.projectConfig.generated
    });
    
    await this.writeFile(fileConfig.path, processedContent, {
      encoding: fileConfig.encoding || 'utf8',
      addHeader: fileConfig.addHeader !== false
    });
  }

  /**
   * Process template file
   * @param {string} templatePath - Path to template file
   * @returns {Promise<string>} Processed template content
   */
  async processTemplateFile(templatePath) {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }
    
    return fs.readFileSync(templatePath, 'utf8');
  }

  /**
   * Generate configuration files
   * @returns {Promise<void>}
   */
  async generateConfigurationFiles() {
    this.log('⚙️  Generating configuration files...', 'info');
    
    // Generate tsconfig.json if TypeScript is enabled
    if (this.options.enableTypeScript !== false) {
      await this.generateTsConfig();
    }
    
    // Generate .eslintrc.js
    await this.generateEslintConfig();
    
    // Generate .prettierrc
    await this.generatePrettierConfig();
    
    // Generate jest.config.js if tests are enabled
    if (this.options.enableTests !== false) {
      await this.generateJestConfig();
    }
  }

  /**
   * Generate package.json with project metadata
   * @returns {Promise<void>}
   */
  async generatePackageJson() {
    this.log('📦 Generating package.json...', 'info');
    
    const packageJson = {
      name: this.projectConfig.name,
      version: this.projectConfig.version,
      description: this.projectConfig.description,
      main: 'src/index.js',
      scripts: {
        start: 'node src/index.js',
        dev: 'nodemon src/index.js',
        test: 'jest',
        'test:watch': 'jest --watch',
        'test:coverage': 'jest --coverage',
        lint: 'eslint src/**/*.js',
        'lint:fix': 'eslint src/**/*.js --fix',
        format: 'prettier --write src/**/*.js',
        build: 'webpack --mode production',
        'build:dev': 'webpack --mode development'
      },
      keywords: ['revolutionary-codegen', 'generated'],
      author: this.projectConfig.author || 'Revolutionary Developer',
      license: this.projectConfig.license || 'MIT',
      repository: this.projectConfig.repository,
      bugs: this.projectConfig.repository ? `${this.projectConfig.repository}/issues` : null,
      homepage: this.projectConfig.repository,
      engines: {
        node: '>=14.0.0',
        npm: '>=6.0.0'
      },
      devDependencies: {
        nodemon: '^2.0.20',
        jest: '^29.0.0',
        eslint: '^8.0.0',
        prettier: '^2.8.0',
        webpack: '^5.75.0',
        'webpack-cli': '^5.0.0'
      },
      dependencies: {},
      generatedBy: 'RevolutionaryCodegen',
      generatedAt: new Date().toISOString()
    };
    
    const packageContent = JSON.stringify(packageJson, null, 2);
    await this.writeFile('package.json', packageContent, { addHeader: false });
  }

  /**
   * Generate README.md with project information
   * @returns {Promise<void>}
   */
  async generateReadme() {
    this.log('📖 Generating README.md...', 'info');
    
    const readmeContent = `# ${this.projectConfig.name}

${this.projectConfig.description}

## 🚀 Revolutionary Features

This project was generated using RevolutionaryCodegen with the following features:

- **🏗️  Structured Architecture**: Clean, organized folder structure
- **📦 Package Management**: Complete npm configuration
- **🧪 Testing Setup**: Jest testing framework configured
- **📏 Code Quality**: ESLint and Prettier for consistent code
- **🔧 Development Tools**: Hot reloading and build scripts
- **📚 Documentation**: Auto-generated documentation

## 📋 Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

## 🛠️ Installation

\`\`\`bash
# Clone the repository
git clone ${this.projectConfig.repository || 'https://github.com/your-username/' + this.projectConfig.name}
cd ${this.projectConfig.name}

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## 📝 Available Scripts

- \`npm start\` - Start the application
- \`npm run dev\` - Start with hot reloading
- \`npm test\` - Run tests
- \`npm run test:watch\` - Run tests in watch mode
- \`npm run test:coverage\` - Generate test coverage report
- \`npm run lint\` - Run ESLint
- \`npm run lint:fix\` - Fix ESLint issues
- \`npm run format\` - Format code with Prettier
- \`npm run build\` - Build for production
- \`npm run build:dev\` - Build for development

## 📁 Project Structure

${this.generateStructureTree()}

## 🧪 Testing

Run tests with:
\`\`\`bash
npm test
\`\`\`

For watch mode:
\`\`\`bash
npm run test:watch
\`\`\`

For coverage:
\`\`\`bash
npm run test:coverage
\`\`\`

## 📏 Code Quality

This project uses ESLint and Prettier for code quality:

- Run linting: \`npm run lint\`
- Auto-fix issues: \`npm run lint:fix\`
- Format code: \`npm run format\`

## 📚 Documentation

- This README is auto-generated
- Code documentation is included in JSDoc comments
- API documentation can be generated using JSDoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ${this.projectConfig.license || 'MIT'} License.

---

## 🎯 Revolutionary Notes

This project was generated with RevolutionaryCodegen, a cutting-edge code generation system that:

- ✨ Creates consistent, well-structured projects
- 🚀 Follows best practices and design patterns
- 🎮 Includes fun features and achievements
- 🦄 Adds easter eggs and developer humor
- 🏆 Promotes clean, maintainable code

*Generated on ${this.projectConfig.generated || new Date().toISOString()}*
`;
    
    await this.writeFile('README.md', readmeContent, { addHeader: false });
  }

  /**
   * Generate project structure tree for README
   * @returns {string} ASCII tree structure
   */
  generateStructureTree() {
    if (!this.structureConfig.folders || this.structureConfig.folders.length === 0) {
      return 'No custom structure specified.';
    }
    
    let tree = '```\n';
    
    const generateTree = (folders, prefix = '', isLast = true) => {
      folders.forEach((folder, index) => {
        const isLastFolder = index === folders.length - 1;
        const currentPrefix = isLastFolder ? '└── ' : '├── ';
        const nextPrefix = isLastFolder ? '    ' : '│   ';
        
        tree += prefix + currentPrefix + folder.name + '/\n';
        
        if (folder.subfolders && folder.subfolders.length > 0) {
          generateTree(folder.subfolders, prefix + nextPrefix, isLastFolder);
        }
      });
    };
    
    generateTree(this.structureConfig.folders);
    tree += '```';
    
    return tree;
  }

  /**
   * Generate .gitignore file
   * @returns {Promise<void>}
   */
  async generateGitignore() {
    this.log('🙈 Generating .gitignore...', 'info');
    
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/
*.tgz
*.tar.gz

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs/
*.log

# Coverage reports
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
.tmp/

# Cache
.cache/
.parcel-cache/

# RevolutionaryCodegen generated files
.generated-backup/
*.backup.*

# Test files
test-results/
playwright-report/
`;
    
    await this.writeFile('.gitignore', gitignoreContent, { addHeader: false });
  }

  /**
   * Generate license file
   * @returns {Promise<void>}
   */
  async generateLicense() {
    this.log('⚖️  Generating license file...', 'info');
    
    const license = this.projectConfig.license || 'MIT';
    const year = new Date().getFullYear();
    const author = this.projectConfig.author || 'Revolutionary Developer';
    
    let licenseContent = '';
    
    switch (license.toUpperCase()) {
      case 'MIT':
        licenseContent = `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
        break;
      
      default:
        licenseContent = `${license} License

This project is licensed under the ${license} license.

Please refer to the full license text for complete terms and conditions.

Copyright (c) ${year} ${author}
`;
    }
    
    await this.writeFile('LICENSE', licenseContent, { addHeader: false });
  }

  /**
   * Generate TypeScript configuration
   * @returns {Promise<void>}
   */
  async generateTsConfig() {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts']
    };
    
    const tsConfigContent = JSON.stringify(tsConfig, null, 2);
    await this.writeFile('tsconfig.json', tsConfigContent, { addHeader: false });
  }

  /**
   * Generate ESLint configuration
   * @returns {Promise<void>}
   */
  async generateEslintConfig() {
    const eslintConfig = `module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-console': 'warn'
  }
};
`;
    
    await this.writeFile('.eslintrc.js', eslintConfig, { addHeader: false });
  }

  /**
   * Generate Prettier configuration
   * @returns {Promise<void>}
   */
  async generatePrettierConfig() {
    const prettierConfig = {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false
    };
    
    const prettierContent = JSON.stringify(prettierConfig, null, 2);
    await this.writeFile('.prettierrc', prettierContent, { addHeader: false });
  }

  /**
   * Generate Jest configuration
   * @returns {Promise<void>}
   */
  async generateJestConfig() {
    const jestConfig = `module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js']
};
`;
    
    await this.writeFile('jest.config.js', jestConfig, { addHeader: false });
  }

  /**
   * Initialize git repository and create initial commit
   * @returns {Promise<void>}
   */
  async initializeGit() {
    if (!this.options.initializeGit) {
      return;
    }
    
    this.log('🔧 Initializing git repository...', 'info');
    
    try {
      const { execSync } = require('child_process');
      
      // Initialize git repository
      try {
        execSync('git init', { cwd: this.options.outputDir, stdio: 'pipe' });
        this.log('📝 Git repository initialized', 'success');
      } catch (error) {
        this.log('⚠️  Git repository already exists', 'warning');
      }
      
      // Add all files
      execSync('git add .', { cwd: this.options.outputDir, stdio: 'pipe' });
      
      // Create initial commit
      execSync('git commit -m "🚀 Initial commit - Generated by RevolutionaryCodegen"', { 
        cwd: this.options.outputDir, 
        stdio: 'pipe' 
      });
      
      this.log('🎯 Initial commit created', 'success');
      
    } catch (error) {
      this.log(`⚠️  Git initialization failed: ${error.message}`, 'warning');
    }
  }

  /**
   * Validate the project specification
   * @returns {void}
   */
  validateSpecification() {
    if (!this.projectConfig) {
      throw new Error('Project configuration is required');
    }
    
    if (!this.projectConfig.name) {
      throw new Error('Project name is required');
    }
    
    if (!this.projectConfig.version) {
      throw new Error('Project version is required');
    }
    
    if (!this.projectConfig.description) {
      throw new Error('Project description is required');
    }
    
    if (!this.structureConfig) {
      throw new Error('Structure configuration is required');
    }
  }

  /**
   * Register cleanup operations
   * @returns {Promise<void>}
   */
  async registerCleanupOperations() {
    // Clean up any temporary files
    this.registerCleanupOperation({
      type: 'cleanCache',
      path: path.join(this.options.outputDir, '.cache')
    });
    
    // Remove backup files older than 7 days
    this.registerCleanupOperation({
      type: 'runCommand',
      command: `find ${this.options.outputDir} -name "*.backup.*" -mtime +7 -delete 2>/dev/null || true`
    });
  }

  /**
   * Get generation statistics
   * @returns {Object} Statistics
   */
  getGenerationStats() {
    return {
      projectName: this.projectConfig?.name,
      foldersCreated: this.structureConfig?.folders?.length || 0,
      filesGenerated: this.structureConfig?.files?.length || 0,
      ...super.getStats()
    };
  }
}

module.exports = ProjectStructureGenerator;
