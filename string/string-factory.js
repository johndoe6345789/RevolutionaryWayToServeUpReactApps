const { StringService } = require('./string-service.js');
const { StringLoader } = require('./string-loader.js');
const { StringCache } = require('./string-cache.js');
const { StringValidator } = require('./string-validator.js');

/**
 * StringFactory - Factory for creating StringService instances
 * Single responsibility: Create and configure StringService instances
 */
class StringFactory {
  constructor(baseConfig = {}) {
    this.baseConfig = baseConfig;
  }

  /**
   * Create StringService instance with default configuration
   */
  create() {
    return this.createWithConfig({});
  }

  /**
   * Create StringService with custom configuration
   */
  createWithConfig(config) {
    const mergedConfig = this.mergeConfig(config);

    return new StringService(mergedConfig);
  }

  /**
   * Create StringService with specific language
   */
  createForLanguage(language) {
    return this.createWithConfig({
      defaultLanguage: language
    });
  }

  /**
   * Create StringService with custom cache settings
   */
  createWithCache(maxSize, ttl) {
    return this.createWithConfig({
      cache: { maxSize, ttl }
    });
  }

  /**
   * Create StringService with custom loader
   */
  createWithLoader(filePath) {
    return this.createWithConfig({
      loader: { filePath }
    });
  }

  /**
   * Merge base config with provided config
   */
  mergeConfig(config) {
    return {
      ...this.baseConfig,
      ...config,
      loader: { ...this.baseConfig.loader, ...config.loader },
      cache: { ...this.baseConfig.cache, ...config.cache },
      validator: { ...this.baseConfig.validator, ...config.validator }
    };
  }

  /**
   * Create service with all components configured
   */
  createFullService() {
    const config = {
      loader: new StringLoader(),
      cache: new StringCache(),
      validator: new StringValidator(),
      defaultLanguage: 'en',
      fallbackLanguage: 'en'
    };

    return new StringService(config);
  }
}

/**
 * Default factory instance
 */
const stringFactory = new StringFactory();

module.exports = {
  StringFactory,
  stringFactory
};
