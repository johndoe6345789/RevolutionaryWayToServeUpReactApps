const { StringValidator } = require('../../../string/string-validator.js');

describe('StringValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new StringValidator();
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const validator = new StringValidator();

      expect(validator.config).toEqual({});
      expect(validator.validKeyPattern).toBeInstanceOf(RegExp);
    });

    it('should create instance with custom config', () => {
      const config = { customOption: 'value' };
      const validator = new StringValidator(config);

      expect(validator.config).toEqual(config);
    });
  });

  describe('isValidKey', () => {
    it('should return true for valid keys', () => {
      expect(validator.isValidKey('validKey')).toBe(true);
      expect(validator.isValidKey('valid.key')).toBe(true);
      expect(validator.isValidKey('valid.key.subkey')).toBe(true);
      expect(validator.isValidKey('key123')).toBe(true);
      expect(validator.isValidKey('a.b.c.d')).toBe(true);
    });

    it('should return false for invalid keys', () => {
      expect(validator.isValidKey('')).toBe(false);
      expect(validator.isValidKey(null)).toBe(false);
      expect(validator.isValidKey(undefined)).toBe(false);
      expect(validator.isValidKey(123)).toBe(false);
      expect(validator.isValidKey('invalid-key')).toBe(false);
      expect(validator.isValidKey('invalid.key!')).toBe(false);
      expect(validator.isValidKey('123invalid')).toBe(false);
      expect(validator.isValidKey('.invalid')).toBe(false);
    });
  });

  describe('validateInterpolation', () => {
    it('should validate successful interpolation', () => {
      const template = 'Hello {name}, you have {count} messages';
      const params = { name: 'John', count: 5 };

      const result = validator.validateInterpolation(template, params);

      expect(result.isValid).toBe(true);
      expect(result.missingParams).toEqual([]);
      expect(result.unusedParams).toEqual([]);
    });

    it('should detect missing parameters', () => {
      const template = 'Hello {name}, you have {count} messages';
      const params = { name: 'John' };

      const result = validator.validateInterpolation(template, params);

      expect(result.isValid).toBe(false);
      expect(result.missingParams).toEqual(['count']);
      expect(result.unusedParams).toEqual([]);
    });

    it('should detect unused parameters', () => {
      const template = 'Hello {name}';
      const params = { name: 'John', unused: 'value' };

      const result = validator.validateInterpolation(template, params);

      expect(result.isValid).toBe(true);
      expect(result.missingParams).toEqual([]);
      expect(result.unusedParams).toEqual(['unused']);
    });

    it('should handle non-string templates', () => {
      const result = validator.validateInterpolation(null, {});

      expect(result.isValid).toBe(false);
      expect(result.missingParams).toEqual([]);
      expect(result.unusedParams).toEqual([]);
    });

    it('should handle templates without parameters', () => {
      const template = 'Hello World';
      const params = { name: 'John' };

      const result = validator.validateInterpolation(template, params);

      expect(result.isValid).toBe(true);
      expect(result.missingParams).toEqual([]);
      expect(result.unusedParams).toEqual(['name']);
    });
  });

  describe('validateLanguageData', () => {
    it('should validate valid language data', () => {
      const data = {
        errors: { key1: 'value1' },
        messages: { key2: 'value2' }
      };

      const result = validator.validateLanguageData(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect invalid language data', () => {
      const data = null;

      const result = validator.validateLanguageData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Language data must be an object');
    });

    it('should detect invalid section names', () => {
      const data = {
        '': { key: 'value' },
        'validSection': { key: 'value' }
      };

      const result = validator.validateLanguageData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid section name: ');
    });

    it('should detect invalid section data', () => {
      const data = {
        validSection: 'invalid data'
      };

      const result = validator.validateLanguageData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid data in section: validSection');
    });
  });

  describe('isValidSection', () => {
    it('should return true for valid section names', () => {
      expect(validator.isValidSection('errors')).toBe(true);
      expect(validator.isValidSection('messages')).toBe(true);
      expect(validator.isValidSection('section123')).toBe(true);
    });

    it('should return false for invalid section names', () => {
      expect(validator.isValidSection('')).toBe(false);
      expect(validator.isValidSection(null)).toBe(false);
      expect(validator.isValidSection(undefined)).toBe(false);
      expect(validator.isValidSection(123)).toBe(false);
    });
  });

  describe('isValidSectionData', () => {
    it('should return true for valid section data', () => {
      expect(validator.isValidSectionData({})).toBe(true);
      expect(validator.isValidSectionData({ key: 'value' })).toBe(true);
      expect(validator.isValidSectionData([])).toBe(true);
    });

    it('should return false for invalid section data', () => {
      expect(validator.isValidSectionData(null)).toBe(false);
      expect(validator.isValidSectionData(undefined)).toBe(false);
    });
  });

  describe('validateStringData', () => {
    it('should validate valid string data', () => {
      const data = {
        i18n: { en: { errors: {} } },
        config: {},
        constants: {}
      };

      const result = validator.validateStringData(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect missing i18n section', () => {
      const data = {
        config: {},
        constants: {}
      };

      const result = validator.validateStringData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing or invalid i18n section');
    });

    it('should detect invalid data structure', () => {
      const data = null;

      const result = validator.validateStringData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('String data must be an object');
    });
  });
});
