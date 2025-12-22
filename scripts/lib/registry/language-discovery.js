/**
 * Language Discovery
 * Handles discovery of language plugins and built-in languages
 */

const fs = require('fs');
const path = require('path');
const BaseLanguagePlugin = require('../base-language-plugin');

class LanguageDiscovery {
  constructor() {
    this.languagePluginsDirectory = path.join(__dirname, '..', '..', 'plugins', 'language_plugins');
    this.builtinLanguages = new Map();
    this.registerBuiltinLanguages();
  }

  /**
   * Registers built-in language definitions
   */
  registerBuiltinLanguages() {
    // JavaScript/TypeScript
    this.builtinLanguages.set('javascript', {
      name: 'javascript',
      description: 'JavaScript and TypeScript projects',
      fileExtensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
      projectFiles: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'tsconfig.json'],
      buildSystems: ['webpack.config.js', 'rollup.config.js', 'vite.config.js', 'next.config.js'],
      priority: 100
    });

    // Python
    this.builtinLanguages.set('python', {
      name: 'python',
      description: 'Python projects',
      fileExtensions: ['.py', '.pyx', '.pyi'],
      projectFiles: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile', 'poetry.lock', 'conda.yml'],
      buildSystems: ['setup.cfg', 'tox.ini', 'Makefile'],
      priority: 90
    });

    // C++
    this.builtinLanguages.set('cpp', {
      name: 'cpp',
      description: 'C/C++ projects',
      fileExtensions: ['.cpp', '.cc', '.cxx', '.c', '.hpp', '.h', '.hxx', '.cppm'],
      projectFiles: ['CMakeLists.txt', 'configure.ac', 'Makefile.am'],
      buildSystems: ['CMakeLists.txt', 'Makefile', 'build.ninja', 'meson.build'],
      priority: 80
    });

    // Java
    this.builtinLanguages.set('java', {
      name: 'java',
      description: 'Java projects',
      fileExtensions: ['.java', '.kt', '.scala'],
      projectFiles: ['pom.xml', 'build.gradle', 'build.gradle.kts', 'settings.gradle'],
      buildSystems: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
      priority: 85
    });
  }

  /**
   * Discovers all language plugins and returns language configurations
   * @returns {Promise<Array>} - Array of language configurations
   */
  async discoverLanguages() {
    const languages = [];

    // Add built-in languages first
    for (const [name, config] of this.builtinLanguages) {
      languages.push(config);
    }

    // Discover language plugins
    const pluginLanguages = await this.discoverLanguagePlugins();
    languages.push(...pluginLanguages);

    return languages;
  }

  /**
   * Discovers language plugins from the plugins directory
   * @returns {Promise<Array>} - Array of plugin language configurations
   */
  async discoverLanguagePlugins() {
    const pluginLanguages = [];
    
    if (!fs.existsSync(this.languagePluginsDirectory)) {
      fs.mkdirSync(this.languagePluginsDirectory, { recursive: true });
      return pluginLanguages;
    }

    const languageDirs = fs.readdirSync(this.languagePluginsDirectory);
    
    for (const langDir of languageDirs) {
      const langPath = path.join(this.languagePluginsDirectory, langDir);
      
      if (fs.statSync(langPath).isDirectory()) {
        const language = await this.loadLanguagePlugin(langDir, langPath);
        if (language) {
          pluginLanguages.push(language);
        }
      }
    }
    
    return pluginLanguages;
  }

  /**
   * Loads language plugins from a specific language directory
   * @param {string} languageName - Name of the language
   * @param {string} languagePath - Path to the language directory
   * @returns {Promise<Object|null>} - Language configuration or null
   */
  async loadLanguagePlugin(languageName, languagePath) {
    try {
      const pluginFiles = fs.readdirSync(languagePath)
        .filter(file => file.endsWith('.language.js'));

      for (const pluginFile of pluginFiles) {
        const pluginPath = path.join(languagePath, pluginFile);
        
        // Clear require cache to allow reloading
        delete require.cache[require.resolve(pluginPath)];
        
        const PluginClass = require(pluginPath);
        
        if (typeof PluginClass === 'function') {
          const plugin = new PluginClass();
          
          if (plugin instanceof BaseLanguagePlugin) {
            return {
              name: languageName,
              description: plugin.description,
              fileExtensions: plugin.fileExtensions,
              projectFiles: plugin.projectFiles,
              buildSystems: plugin.buildSystems,
              priority: plugin.priority,
              plugin: plugin
            };
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Failed to load language plugin from ${languageName}: ${error.message}`);
    }
    
    return null;
  }

  /**
   * Gets built-in language configuration
   * @param {string} name - Language name
   * @returns {Object|null} - Language configuration or null
   */
  getBuiltinLanguage(name) {
    return this.builtinLanguages.get(name) || null;
  }

  /**
   * Gets all built-in language configurations
   * @returns {Array} - Array of built-in language configurations
   */
  getBuiltinLanguages() {
    return Array.from(this.builtinLanguages.values());
  }
}

module.exports = LanguageDiscovery;
