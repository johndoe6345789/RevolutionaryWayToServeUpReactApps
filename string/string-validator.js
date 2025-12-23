/**
 * StringValidator - Validates string keys and data structures
 * Single responsibility: Validate string data and keys
 */
class StringValidator {
  constructor(config = {}) {
    this.config = config;
    this.validKeyPattern = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$/;
  }

  /**
   * Validate a string key format
   * @param {string} key - Key to validate
   * @returns {boolean}
   */
  isValidKey(key) {
    if (typeof key !== 'string' || key.length === 0) {
      return false;
    }

    return this.validKeyPattern.test(key);
  }

  /**
   * Validate interpolation parameters
   * @param {string} template - Template string
   * @param {Object} params - Parameters object
   * @returns {Object} Validation result
   */
  validateInterpolation(template, params = {}) {
    const result = {
      isValid: true,
      missingParams: [],
      unusedParams: []
    };

    if (typeof template !== 'string') {
      result.isValid = false;
      return result;
    }

    const paramMatches = template.match(/\{(\w+)\}/g) || [];
    const requiredParams = paramMatches.map(match => match.slice(1, -1));

    const providedParams = Object.keys(params);

    result.missingParams = requiredParams.filter(param => !providedParams.includes(param));
    result.unusedParams = providedParams.filter(param => !requiredParams.includes(param));

    result.isValid = result.missingParams.length === 0;

    return result;
  }

  /**
   * Validate language data structure
   * @param {Object} languageData - Language data to validate
   * @returns {Object} Validation result
   */
  validateLanguageData(languageData) {
    const result = {
      isValid: true,
      errors: []
    };

    if (!languageData || typeof languageData !== 'object') {
      result.errors.push('Language data must be an object');
      result.isValid = false;
      return result;
    }

    for (const [section, data] of Object.entries(languageData)) {
      if (!this.isValidSection(section)) {
        result.errors.push(`Invalid section name: ${section}`);
        result.isValid = false;
      }

      if (!this.isValidSectionData(data)) {
        result.errors.push(`Invalid data in section: ${section}`);
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Validate section name
   * @param {string} section - Section name
   * @returns {boolean}
   */
  isValidSection(section) {
    return typeof section === 'string' && section.length > 0;
  }

  /**
   * Validate section data
   * @param {any} data - Section data
   * @returns {boolean}
   */
  isValidSectionData(data) {
    return data !== null && typeof data === 'object';
  }

  /**
   * Validate complete string data structure
   * @param {Object} data - Complete string data
   * @returns {Object} Validation result
   */
  validateStringData(data) {
    const result = {
      isValid: true,
      errors: []
    };

    if (!data || typeof data !== 'object') {
      result.errors.push('String data must be an object');
      result.isValid = false;
      return result;
    }

    if (!data.i18n || typeof data.i18n !== 'object') {
      result.errors.push('Missing or invalid i18n section');
      result.isValid = false;
    }

    return result;
  }
}

module.exports = { StringValidator };
