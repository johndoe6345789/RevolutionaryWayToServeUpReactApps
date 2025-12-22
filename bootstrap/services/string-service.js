const BaseClass = require('../base/base-class.js');
const fs = require('fs');
const path = require('path');

/**
 * String Service for centralized access to internationalized strings and configuration data
 */
class StringService extends BaseClass {
  constructor(data = {}) {
    super(data);
    this.data = null;
    this.currentLanguage = 'en';
    this.fallbackLanguage = 'en';
    this.loadData();
  }

  /**
   * Load the unified data file
   */
  loadData() {
    try {
      // Try enhanced data first, fallback to original
      let dataPath = path.resolve(__dirname, '../../codegen-data-enhanced.json');
      if (!fs.existsSync(dataPath)) {
        dataPath = path.resolve(__dirname, '../../codegen-data.json');
      }
      
      const rawData = fs.readFileSync(dataPath, 'utf8');
      this.data = JSON.parse(rawData);
    } catch (error) {
      console.error('Failed to load codegen data:', error);
      this.data = { i18n: { en: {} }, config: {}, constants: {} };
    }
  }

  /**
   * Get a string by key with optional parameters interpolation
   * @param {string} key - Dot notation key (e.g., 'errors.item_name_required')
   * @param {object} params - Parameters for string interpolation
   * @param {string} language - Target language (defaults to currentLanguage)
   * @returns {string}
   */
  get(key, params = {}, language = null) {
    const lang = language || this.currentLanguage;
    const value = this.getNestedValue(this.data?.i18n?.[lang], key);
    
    if (value === undefined) {
      // Fallback to English
      const fallbackValue = this.getNestedValue(this.data?.i18n?.[this.fallbackLanguage], key);
      if (fallbackValue !== undefined) {
        return this.interpolate(fallbackValue, params);
      }
      return key; // Return key if not found
    }

    return this.interpolate(value, params);
  }

  /**
   * Get error message by key
   * @param {string} key - Error key
   * @param {object} params - Parameters for interpolation
   * @returns {string}
   */
  getError(key, params = {}) {
    return this.get(`errors.${key}`, params);
  }

  /**
   * Get message by key
   * @param {string} key - Message key
   * @param {object} params - Parameters for interpolation
   * @returns {string}
   */
  getMessage(key, params = {}) {
    return this.get(`messages.${key}`, params);
  }

  /**
   * Get label by key
   * @param {string} key - Label key
   * @param {object} params - Parameters for interpolation
   * @returns {string}
   */
  getLabel(key, params = {}) {
    return this.get(`labels.${key}`, params);
  }

  /**
   * Get console message by key
   * @param {string} key - Console key
   * @param {object} params - Parameters for interpolation
   * @returns {string}
   */
  getConsole(key, params = {}) {
    return this.get(`console.${key}`, params);
  }

  /**
   * Get system identifier by key
   * @param {string} key - System key
   * @returns {string}
   */
  getSystem(key) {
    return this.get(`system.${key}`);
  }

  /**
   * Get configuration value
   * @param {string} key - Configuration key (dot notation)
   * @returns {any}
   */
  getConfig(key) {
    return this.getNestedValue(this.data?.config, key);
  }

  /**
   * Get constant value
   * @param {string} key - Constant name
   * @returns {any}
   */
  getConstant(key) {
    return this.data?.constants?.[key];
  }

  /**
   * Get template data
   * @param {string} template - Template type
   * @returns {any}
   */
  getTemplate(template) {
    return this.data?.templates?.[template];
  }

  /**
   * Get metadata
   * @param {string} key - Metadata key
   * @returns {any}
   */
  getMetadata(key) {
    return this.getNestedValue(this.data?.metadata, key);
  }

  /**
   * Get game data
   * @param {string} type - Game data type (featured, systemTags)
   * @returns {any}
   */
  getGameData(type) {
    return this.data?.gamedata?.[type];
  }

  /**
   * Set current language
   * @param {string} language - Language code
   */
  setLanguage(language) {
    if (this.data?.i18n?.[language]) {
      this.currentLanguage = language;
    } else {
      console.warn(`Language '${language}' not available, using '${this.currentLanguage}'`);
    }
  }

  /**
   * Get current language
   * @returns {string}
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   * @returns {string[]}
   */
  getAvailableLanguages() {
    return Object.keys(this.data?.i18n || {});
  }

  /**
   * Interpolate parameters into string
   * @param {string} template - String template with {param} placeholders
   * @param {object} params - Parameters to interpolate
   * @returns {string}
   */
  interpolate(template, params = {}) {
    if (typeof template !== 'string') {
      return template;
    }

    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * Get nested value from object using dot notation
   * @param {object} obj - Source object
   * @param {string} path - Dot notation path
   * @returns {any}
   */
  getNestedValue(obj, path) {
    if (!obj || typeof path !== 'string') {
      return undefined;
    }

    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  }

  /**
   * Reload data from file
   */
  reload() {
    this.loadData();
  }

  /**
   * Validate that required strings are available
   * @param {string[]} keys - Array of required keys
   * @returns {object} - Validation result with missing keys
   */
  validateStrings(keys) {
    const missing = [];
    const current = this.currentLanguage;

    keys.forEach(key => {
      const value = this.get(key);
      if (value === key) { // Key not found
        missing.push(key);
      }
    });

    return {
      isValid: missing.length === 0,
      missing,
      language: current
    };
  }
}

// Singleton instance
let stringServiceInstance = null;

/**
 * Get the singleton StringService instance
 * @returns {StringService}
 */
function getStringService() {
  if (!stringServiceInstance) {
    stringServiceInstance = new StringService();
  }
  return stringServiceInstance;
}

module.exports = {
  StringService,
  getStringService
};
