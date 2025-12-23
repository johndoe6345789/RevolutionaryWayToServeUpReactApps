const { StringFactory } = require('../../../string/string-factory.js');
const fs = require('fs');
const path = require('path');

describe('StringService Integration Tests', () => {
  let factory;
  let service;

  beforeAll(async () => {
    factory = new StringFactory();
    service = factory.create();

    // Initialize the service
    await service.initialize();
  });

  describe('Real string data integration', () => {
    it('should load real strings.json data', () => {
      expect(service.data).toBeDefined();
      expect(service.data.i18n).toBeDefined();
      expect(service.data.i18n.en).toBeDefined();
    });

    it('should get error messages', () => {
      const errorMsg = service.getError('itemName');
      expect(errorMsg).toBe('Item name is required');
    });

    it('should get messages', () => {
      const message = service.getMessage('initializingService');
      expect(message).toBe('Initializing service...');
    });

    it('should get labels', () => {
      const label = service.getLabel('retro_gaming_hub');
      expect(label).toBe('RETRO GAMING HUB');
    });

    it('should get console messages', () => {
      const consoleMsg = service.getConsole('info');
      expect(consoleMsg).toBe('info');
    });

    it('should get system identifiers', () => {
      const systemId = service.getSystem('browser');
      expect(systemId).toBe('browser');
    });

    it('should get configuration values', () => {
      const version = service.getConfig('version');
      expect(version).toBe('1.0.0');
    });

    it('should get constants', () => {
      const appName = service.getConstant('version');
      expect(appName).toBe('1.0.0');
    });

    it('should get templates', () => {
      const projectTemplate = service.getTemplate('project');
      expect(projectTemplate).toBeDefined();
      expect(projectTemplate.name).toBe('RevolutionaryExample');
    });

    it('should get metadata', () => {
      const pluginGroups = service.getMetadata('pluginGroups');
      expect(pluginGroups).toBeDefined();
      expect(Array.isArray(pluginGroups)).toBe(true);
    });

    it('should get game data', () => {
      const featuredGames = service.getGameData('featured');
      expect(featuredGames).toBeDefined();
      expect(Array.isArray(featuredGames)).toBe(true);
      expect(featuredGames.length).toBeGreaterThan(0);
    });
  });

  describe('Language management', () => {
    it('should get current language', () => {
      expect(service.getCurrentLanguage()).toBe('en');
    });

    it('should get available languages', () => {
      const languages = service.getAvailableLanguages();
      expect(languages).toContain('en');
      expect(Array.isArray(languages)).toBe(true);
    });

    it('should set language', () => {
      service.setLanguage('en'); // Should work since 'en' exists
      expect(service.getCurrentLanguage()).toBe('en');
    });
  });

  describe('Parameter interpolation', () => {
    it('should interpolate parameters', () => {
      const template = 'Hello {name}, welcome to {app}';
      const params = { name: 'User', app: 'MyApp' };

      const result = service.interpolate(template, params);
      expect(result).toBe('Hello User, welcome to MyApp');
    });

    it('should handle missing parameters', () => {
      const template = 'Hello {name}, welcome to {app}';
      const params = { name: 'User' };

      const result = service.interpolate(template, params);
      expect(result).toBe('Hello User, welcome to {app}');
    });

    it('should convert numbers to strings', () => {
      const template = 'Count: {count}';
      const params = { count: 42 };

      const result = service.interpolate(template, params);
      expect(result).toBe('Count: 42');
    });
  });

  describe('String validation', () => {
    it('should validate existing strings', () => {
      const result = service.validateStrings(['errors.itemName', 'messages.initializingService']);

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

  describe('Factory integration', () => {
    it('should create service with different languages', () => {
      const spanishService = factory.createForLanguage('en'); // Only 'en' available
      expect(spanishService).toBeDefined();
    });

    it('should create service with custom cache', () => {
      const cachedService = factory.createWithCache(50, 1800000);
      expect(cachedService).toBeDefined();
    });

    it('should create full service', () => {
      const fullService = factory.createFullService();
      expect(fullService).toBeDefined();
    });
  });

  describe('Nested value access', () => {
    it('should access nested configuration', () => {
      const entry = service.getConfig('render.rootId');
      expect(entry).toBe('root');
    });

    it('should access nested constants', () => {
      const asciiArt = service.getNestedValue(service.data.constants, 'asciiArt.revolutionary_logo');
      expect(asciiArt).toBeDefined();
      expect(typeof asciiArt).toBe('string');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid keys gracefully', () => {
      const result = service.get('');
      expect(result).toBe('');

      const invalidResult = service.get('invalid-key-with-dashes');
      expect(invalidResult).toBe('invalid-key-with-dashes');
    });

    it('should handle non-existent nested paths', () => {
      const result = service.getConfig('nonexistent.deep.path');
      expect(result).toBeUndefined();
    });
  });
});
