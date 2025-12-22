/**
 * Language Registry
 * Manages language detection, registration, and language-specific plugin loading
 */

const LanguageDiscovery = require('./language-discovery');
const LanguageScoring = require('./language-scoring');

class LanguageRegistry {
  constructor() {
    this.languages = new Map();
    this.detectedLanguages = new Set();
    this.discovery = new LanguageDiscovery();
    this.scoring = new LanguageScoring();
    this.supportedLanguages = [];
  }

  /**
   * Discovers all language plugins and registers them
   * @param {boolean} forceReload - Force rediscovery even if already discovered
   */
  async discoverLanguages(forceReload = false) {
    if (this.supportedLanguages.length > 0 && !forceReload) {
      return this.supportedLanguages;
    }

    this.languages.clear();
    this.supportedLanguages = [];

    // Discover all languages (built-in + plugins)
    const discoveredLanguages = await this.discovery.discoverLanguages();

    // Register discovered languages
    for (const language of discoveredLanguages) {
      await this.registerLanguage(language);
    }

    this.supportedLanguages = Array.from(this.languages.keys());
    return this.supportedLanguages;
  }

  /**
   * Registers a language configuration
   * @param {Object} languageConfig - Language configuration
   */
  async registerLanguage(languageConfig) {
    const language = {
      name: languageConfig.name,
      description: languageConfig.description,
      fileExtensions: languageConfig.fileExtensions || [],
      projectFiles: languageConfig.projectFiles || [],
      buildSystems: languageConfig.buildSystems || [],
      priority: languageConfig.priority || 0,
      detected: false,
      plugin: languageConfig.plugin || null
    };

    this.languages.set(languageConfig.name, language);
  }

  /**
   * Registers a language plugin
   * @param {BaseLanguagePlugin} plugin - Language plugin instance
   */
  async registerLanguagePlugin(plugin) {
    const languageName = plugin.language;
    
    if (!this.languages.has(languageName)) {
      // Register language from plugin metadata
      await this.registerLanguage({
        name: languageName,
        description: plugin.description,
        fileExtensions: plugin.fileExtensions,
        projectFiles: plugin.projectFiles,
        buildSystems: plugin.buildSystems,
        priority: plugin.priority
      });
    }

    // Attach plugin to language
    const language = this.languages.get(languageName);
    language.plugin = plugin;
  }

  /**
   * Detects languages used in the current project
   * @param {string} projectPath - Path to the project root
   * @returns {Promise<Array>} - Array of detected language names
   */
  async detectLanguages(projectPath) {
    this.detectedLanguages.clear();

    const languageScores = new Map();

    // Score each language based on detection criteria
    for (const [name, language] of this.languages) {
      const score = await this.scoring.calculateLanguageScore(language, projectPath);
      if (score > 0) {
        languageScores.set(name, score);
      }
    }

    // Sort by score (descending) and return detected languages
    const sortedLanguages = this.scoring.sortLanguagesByScore(languageScores);

    // Update language detection status
    for (const langName of sortedLanguages) {
      const language = this.languages.get(langName);
      language.detected = true;
      this.detectedLanguages.add(langName);
    }

    return sortedLanguages;
  }

  /**
   * Gets a language by name
   * @param {string} name - Language name
   * @returns {Object|null} - Language configuration or null
   */
  getLanguage(name) {
    return this.languages.get(name) || null;
  }

  /**
   * Gets all supported languages
   * @returns {Array} - Array of language configurations
   */
  getSupportedLanguages() {
    return Array.from(this.languages.values());
  }

  /**
   * Gets detected languages for the current project
   * @returns {Array} - Array of detected language names
   */
  getDetectedLanguages() {
    return Array.from(this.detectedLanguages);
  }

  /**
   * Gets the number of supported languages
   * @returns {number} - Language count
   */
  getLanguageCount() {
    return this.languages.size;
  }

  /**
   * Checks if a language is supported
   * @param {string} name - Language name
   * @returns {boolean} - True if supported
   */
  isLanguageSupported(name) {
    return this.languages.has(name);
  }

  /**
   * Gets the plugin for a specific language
   * @param {string} languageName - Language name
   * @returns {BaseLanguagePlugin|null} - Language plugin or null
   */
  getLanguagePlugin(languageName) {
    const language = this.languages.get(languageName);
    return language ? language.plugin : null;
  }

  /**
   * Gets all language plugins
   * @returns {Array} - Array of language plugin instances
   */
  getAllLanguagePlugins() {
    const plugins = [];
    for (const language of this.languages.values()) {
      if (language.plugin) {
        plugins.push(language.plugin);
      }
    }
    return plugins;
  }

  /**
   * Gets language detection statistics
   * @returns {Object} - Statistics
   */
  getDetectionStatistics() {
    const totalLanguages = this.languages.size;
    const detectedCount = this.detectedLanguages.size;
    const withPlugins = this.getAllLanguagePlugins().length;

    return {
      total: totalLanguages,
      detected: detectedCount,
      detectedLanguages: Array.from(this.detectedLanguages),
      withPlugins: withPlugins,
      detectionRate: totalLanguages > 0 ? (detectedCount / totalLanguages * 100).toFixed(1) + '%' : '0%'
    };
  }

  /**
   * Clears all registered languages
   */
  clear() {
    this.languages.clear();
    this.detectedLanguages.clear();
    this.supportedLanguages = [];
  }
}

module.exports = LanguageRegistry;
