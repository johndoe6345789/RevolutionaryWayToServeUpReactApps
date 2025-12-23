const { StringFactory } = require('../../../string/string-factory.js');

jest.mock('../../../string/string-service.js');

describe('StringFactory', () => {
  let factory;
  let mockService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      initialize: jest.fn().mockResolvedValue()
    };

    require('../../../string/string-service.js').StringService = jest.fn().mockImplementation(() => mockService);

    factory = new StringFactory();
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const factory = new StringFactory();

      expect(factory.baseConfig).toEqual({});
    });

    it('should create instance with custom base config', () => {
      const baseConfig = { defaultLanguage: 'es' };
      const factory = new StringFactory(baseConfig);

      expect(factory.baseConfig).toEqual(baseConfig);
    });
  });

  describe('create', () => {
    it('should create service with default config', () => {
      const service = factory.create();

      expect(require('../../../string/string-service.js').StringService).toHaveBeenCalledWith({});
      expect(service).toBe(mockService);
    });
  });

  describe('createWithConfig', () => {
    it('should create service with custom config', () => {
      const config = {
        defaultLanguage: 'es',
        cache: { maxSize: 50 }
      };

      const service = factory.createWithConfig(config);

      expect(require('../../../string/string-service.js').StringService).toHaveBeenCalledWith(config);
      expect(service).toBe(mockService);
    });

    it('should merge config with base config', () => {
      const baseConfig = { defaultLanguage: 'en' };
      const factory = new StringFactory(baseConfig);
      const additionalConfig = { fallbackLanguage: 'es' };

      const service = factory.createWithConfig(additionalConfig);

      expect(require('../../../string/string-service.js').StringService).toHaveBeenCalledWith({
        defaultLanguage: 'en',
        fallbackLanguage: 'es'
      });
    });
  });

  describe('createForLanguage', () => {
    it('should create service for specific language', () => {
      const service = factory.createForLanguage('es');

      expect(require('../../../string/string-service.js').StringService).toHaveBeenCalledWith({
        defaultLanguage: 'es'
      });
    });
  });

  describe('createWithCache', () => {
    it('should create service with custom cache settings', () => {
      const service = factory.createWithCache(50, 1800000);

      expect(require('../../../string/string-service.js').StringService).toHaveBeenCalledWith({
        cache: { maxSize: 50, ttl: 1800000 }
      });
    });
  });

  describe('createWithLoader', () => {
    it('should create service with custom loader path', () => {
      const customPath = '/custom/strings.json';
      const service = factory.createWithLoader(customPath);

      expect(require('../../../string/string-service.js').StringService).toHaveBeenCalledWith({
        loader: { filePath: customPath }
      });
    });
  });

  describe('mergeConfig', () => {
    it('should merge nested config objects', () => {
      const baseConfig = {
        loader: { filePath: '/base/path.json' },
        cache: { maxSize: 100 }
      };
      const factory = new StringFactory(baseConfig);
      const additionalConfig = {
        loader: { customOption: 'value' },
        cache: { ttl: 3600000 },
        defaultLanguage: 'es'
      };

      const merged = factory.mergeConfig(additionalConfig);

      expect(merged).toEqual({
        loader: { filePath: '/base/path.json', customOption: 'value' },
        cache: { maxSize: 100, ttl: 3600000 },
        validator: {},
        defaultLanguage: 'es'
      });
    });

    it('should handle empty configs', () => {
      const merged = factory.mergeConfig({});

      expect(merged).toEqual({
        loader: {},
        cache: {},
        validator: {}
      });
    });
  });

  describe('createFullService', () => {
    it('should create service with all components configured', () => {
      const service = factory.createFullService();

      expect(require('../../../string/string-service.js').StringService).toHaveBeenCalledWith({
        loader: expect.any(Object),
        cache: expect.any(Object),
        validator: expect.any(Object),
        defaultLanguage: 'en',
        fallbackLanguage: 'en'
      });
    });
  });
});
