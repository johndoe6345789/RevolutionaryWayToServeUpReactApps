const { StringService } = require('../../../string/string-service.js');

jest.mock('../../../string/string-loader.js');
jest.mock('../../../string/string-cache.js');
jest.mock('../../../string/string-validator.js');

describe('StringService', () => {
  let service;
  let mockLoader;
  let mockCache;
  let mockValidator;

  const mockStringData = {
    i18n: {
      en: {
        errors: { itemName: 'Item name is required' },
        messages: { success: 'Operation successful' }
      }
    },
    config: { version: '1.0.0' },
    constants: { appName: 'TestApp' }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockLoader = {
      load: jest.fn().mockResolvedValue(mockStringData)
    };
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn()
    };
    mockValidator = {
      isValidKey: jest.fn().mockReturnValue(true),
      validateInterpolation: jest.fn().mockReturnValue({
        isValid: true,
        missingParams: [],
        unusedParams: []
      }),
      validateStringData: jest.fn().mockReturnValue({
        isValid: true,
        errors: []
      })
    };

    // Mock the constructors
    require('../../../string/string-loader.js').StringLoader = jest.fn().mockImplementation(() => mockLoader);
    require('../../../string/string-cache.js').StringCache = jest.fn().mockImplementation(() => mockCache);
    require('../../../string/string-validator.js').StringValidator = jest.fn().mockImplementation(() => mockValidator);

    service = new StringService();
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      expect(service.currentLanguage).toBe('en');
      expect(service.fallbackLanguage).toBe('en');
      expect(service.data).toBeNull();
    });

    it('should create instance with custom config', () => {
      const config = {
        defaultLanguage: 'es',
        fallbackLanguage: 'en'
      };
      const customService = new StringService(config);

      expect(customService.currentLanguage).toBe('es');
      expect(customService.fallbackLanguage).toBe('en');
    });
  });

  describe('initialize', () => {
    it('should initialize service successfully', async () => {
      await service.initialize();

      expect(mockLoader.load).toHaveBeenCalled();
      expect(mockValidator.validateStringData).toHaveBeenCalledWith(mockStringData);
      expect(mockCache.set).toHaveBeenCalledWith('stringData', mockStringData);
      expect(service.data).toEqual(mockStringData);
    });

    it('should handle initialization errors', async () => {
      mockLoader.load.mockRejectedValue(new Error('Load failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.initialize();

      expect(consoleSpy).toHaveBeenCalledWith('StringService initialization failed:', 'Load failed');
      expect(service.data.i18n.en).toEqual({});

      consoleSpy.mockRestore();
    });
  });

  describe('loadData', () => {
    it('should load data from cache if available', async () => {
      mockCache.get.mockReturnValue(mockStringData);

      await service.loadData();

      expect(mockCache.get).toHaveBeenCalledWith('stringData');
      expect(mockLoader.load).not.toHaveBeenCalled();
      expect(service.data).toEqual(mockStringData);
    });

    it('should load data from loader if not cached', async () => {
      mockCache.get.mockReturnValue(null);

      await service.loadData();

      expect(mockCache.get).toHaveBeenCalledWith('stringData');
      expect(mockLoader.load).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith('stringData', mockStringData);
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return string value for valid key', () => {
      const result = service.get('errors.itemName');

      expect(result).toBe('Item name is required');
      expect(mockValidator.isValidKey).toHaveBeenCalledWith('errors.itemName');
    });

    it('should return fallback value when key not found in current language', () => {
      service.currentLanguage = 'es'; // Non-existent language

      const result = service.get('errors.itemName');

      expect(result).toBe('Item name is required');
    });

    it('should return key when not found in any language', () => {
      const result = service.get('nonexistent.key');

      expect(result).toBe('nonexistent.key');
    });

    it('should interpolate parameters', () => {
      const result = service.get('messages.success', { name: 'John' });

      expect(result).toBe('Operation successful');
      expect(mockValidator.validateInterpolation).toHaveBeenCalled();
    });

    it('should return key for invalid key format', () => {
      mockValidator.isValidKey.mockReturnValue(false);

      const result = service.get('invalid-key');

      expect(result).toBe('invalid-key');
    });
  });

  describe('specialized getters', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should get error messages', () => {
      const result = service.getError('itemName');

      expect(result).toBe('Item name is required');
    });

    it('should get messages', () => {
      const result = service.getMessage('success');

      expect(result).toBe('Operation successful');
    });

    it('should get config values', () => {
      const result = service.getConfig('version');

      expect(result).toBe('1.0.0');
    });

    it('should get constants', () => {
      const result = service.getConstant('appName');

      expect(result).toBe('TestApp');
    });
  });

  describe('language management', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should set current language', () => {
      service.setLanguage('es');

      expect(service.currentLanguage).toBe('es');
    });

    it('should not set invalid language', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      service.setLanguage('invalid');

      expect(service.currentLanguage).toBe('en');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should get current language', () => {
      expect(service.getCurrentLanguage()).toBe('en');
    });

    it('should get available languages', () => {
      const languages = service.getAvailableLanguages();

      expect(languages).toEqual(['en']);
    });
  });

  describe('interpolation', () => {
    it('should interpolate parameters correctly', () => {
      const template = 'Hello {name}, you have {count} messages';
      const params = { name: 'John', count: 5 };

      const result = service.interpolate(template, params);

      expect(result).toBe('Hello John, you have 5 messages');
    });

    it('should handle missing parameters', () => {
      const template = 'Hello {name}, you have {count} messages';
      const params = { name: 'John' };

      const result = service.interpolate(template, params);

      expect(result).toBe('Hello John, you have {count} messages');
    });

    it('should convert non-string values to strings', () => {
      const template = 'Count: {count}';
      const params = { count: 42 };

      const result = service.interpolate(template, params);

      expect(result).toBe('Count: 42');
    });
  });

  describe('getNestedValue', () => {
    it('should get nested values', () => {
      const obj = { a: { b: { c: 'value' } } };

      expect(service.getNestedValue(obj, 'a.b.c')).toBe('value');
      expect(service.getNestedValue(obj, 'a.b')).toEqual({ c: 'value' });
    });

    it('should return undefined for invalid paths', () => {
      const obj = { a: { b: 'value' } };

      expect(service.getNestedValue(obj, 'a.c')).toBeUndefined();
      expect(service.getNestedValue(obj, 'x.y.z')).toBeUndefined();
      expect(service.getNestedValue(null, 'a.b')).toBeUndefined();
    });
  });

  describe('reload', () => {
    it('should reload data and clear cache', async () => {
      await service.initialize();
      await service.reload();

      expect(mockCache.clear).toHaveBeenCalled();
      expect(mockLoader.load).toHaveBeenCalledTimes(2); // Once for init, once for reload
    });
  });

  describe('validateStrings', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should validate existing strings', () => {
      const result = service.validateStrings(['errors.itemName', 'messages.success']);

      expect(result.isValid).toBe(true);
      expect(result.missing).toEqual([]);
      expect(result.language).toBe('en');
    });

    it('should detect missing strings', () => {
      const result = service.validateStrings(['errors.itemName', 'nonexistent.key']);

      expect(result.isValid).toBe(false);
      expect(result.missing).toEqual(['nonexistent.key']);
    });
  });
});
