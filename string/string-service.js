const BaseClass = require('../bootstrap/base/base-class.js');
const { StringLoader } = require('./string-loader.js');
const { StringCache } = require('./string-cache.js');
const { StringValidator } = require('./string-validator.js');

/**
 * StringService - Enterprise-grade internationalization service
 * Single responsibility: Provide internationalized strings with caching and validation
 */
class StringService extends BaseClass {
  constructor(config = {}) {
    super(config);
    this.loader = new StringLoader(config.loader);
    this.cache = new StringCache(config.cache);
    this.validator = new StringValidator(config.validator);

    this.currentLanguage = config.defaultLanguage || 'en';
    this.fallbackLanguage = config.fallbackLanguage || 'en';
    this.data = null;
    this.initialized = false;
  }

  /**
   * Initialize the service (lazy loading)
   */
  async initialize() {
    if (!this.initialized) {
      try {
        await this.loadData();
        this.initialized = true;
      } catch (error) {
        console.error('StringService initialization failed:', error.message);
        this.data = { i18n: { en: {} }, config: {}, constants: {} };
      }
    }
    return this;
  }

  /**
   * Ensure service is initialized before use
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Load string data with caching
   */
  async loadData() {
    const cacheKey = 'stringData';

    let data = this.cache.get(cacheKey);
    if (!data) {
      data = await this.loader.load();
      const validation = this.validator.validateStringData(data);
      if (!validation.isValid) {
        throw new Error(`Invalid string data: ${validation.errors.join(', ')}`);
      }
      this.cache.set(cacheKey, data);
    }

    this.data = data;
  }

  /**
   * Get string by key with interpolation
   */
  async get(key, params = {}, language = null) {
    await this.ensureInitialized();

    if (!this.validator.isValidKey(key)) {
      return key;
    }

    const lang = language || this.currentLanguage;
    const value = this.getNestedValue(this.data?.i18n?.[lang], key);

    if (value === undefined) {
      const fallbackValue = this.getNestedValue(this.data?.i18n?.[this.fallbackLanguage], key);
      if (fallbackValue !== undefined) {
        return this.interpolate(fallbackValue, params);
      }
      return key;
    }

    return this.interpolate(value, params);
  }

  /**
   * Get error message by key
   */
  async getError(key, params = {}) {
    return await this.get(`errors.${key}`, params);
  }

  /**
   * Get message by key
   */
  async getMessage(key, params = {}) {
    return await this.get(`messages.${key}`, params);
  }

  /**
   * Get label by key
   */
  async getLabel(key, params = {}) {
    return await this.get(`labels.${key}`, params);
  }

  /**
   * Get console message by key
   */
  async getConsole(key, params = {}) {
    return await this.get(`console.${key}`, params);
  }

  /**
   * Get system identifier by key
   */
  async getSystem(key) {
    return await this.get(`system.${key}`);
  }

  /**
   * Get configuration value
   */
  getConfig(key) {
    return this.getNestedValue(this.data?.config, key);
  }

  /**
   * Get constant value
   */
  getConstant(key) {
    return this.data?.constants?.[key];
  }

  /**
   * Get template data
   */
  getTemplate(template) {
    return this.data?.templates?.[template];
  }

  /**
   * Get metadata
   */
  getMetadata(key) {
    return this.getNestedValue(this.data?.metadata, key);
  }

  /**
   * Get game data
   */
  getGameData(type) {
    return this.data?.gamedata?.[type];
  }

  /**
   * Set current language
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
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return Object.keys(this.data?.i18n || {});
  }

  /**
   * Interpolate parameters into string
   */
  interpolate(template, params = {}) {
    if (typeof template !== 'string') {
      return template;
    }

    const validation = this.validator.validateInterpolation(template, params);
    if (!validation.isValid) {
      console.warn(`Interpolation validation failed for template: ${template}`);
    }

    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  /**
   * Get nested value from object using dot notation
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
  async reload() {
    this.cache.clear();
    await this.loadData();
  }

  /**
   * Validate required strings
   */
  validateStrings(keys) {
    const missing = [];
    const current = this.currentLanguage;

    keys.forEach(key => {
      const value = this.get(key);
      if (value === key) {
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

module.exports = { StringService };
