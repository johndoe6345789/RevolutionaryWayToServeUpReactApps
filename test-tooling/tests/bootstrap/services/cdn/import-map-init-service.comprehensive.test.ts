import ImportMapInitializer from "../../../../../bootstrap/services/cdn/import-map-init-service.js";
import ImportMapInitConfig from "../../../../../bootstrap/configs/cdn/import-map-init.js";

// Mock window object for testing
class MockWindow {
  constructor() {
    this.document = {
      querySelector: jest.fn(),
    };
    this.__rwtraBootstrap = {
      helpers: {
        network: {
          resolveModuleUrl: jest.fn().mockResolvedValue('https://resolved.example.com/module.js'),
          setFallbackProviders: jest.fn(),
          setDefaultProviderBase: jest.fn(),
          setProviderAliases: jest.fn()
        }
      }
    };
    this.__rwtraConfig = null;
    this.__rwtraConfigPromise = null;
  }
}

// Mock fetch implementation
const mockFetch = (url, options) => {
  if (url.includes('error')) {
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({})
    });
  }
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      fallbackProviders: ['https://fallback.example.com'],
      providers: {
        default: 'https://default.example.com',
        aliases: { 'alias': 'https://alias.example.com' }
      },
      modules: [
        { name: 'test-module', url: 'https://example.com/test-module.js' }
      ]
    })
  });
};

// Mock import map script element
class MockImportMapScript {
  constructor() {
    this.textContent = '';
  }
}

describe("ImportMapInitializer", () => {
  let importMapInitializer;
  let mockWindow;
  let mockImportMapScript;

  beforeEach(() => {
    mockImportMapScript = new MockImportMapScript();
    mockWindow = new MockWindow();
    mockWindow.document.querySelector = jest.fn().mockReturnValue(mockImportMapScript);
    
    const config = new ImportMapInitConfig({
      window: mockWindow,
      fetch: mockFetch
    });
    
    importMapInitializer = new ImportMapInitializer(config);
  });

  describe("constructor", () => {
    it("should initialize with provided config", () => {
      expect(importMapInitializer.config).toBeDefined();
      expect(importMapInitializer.initialized).toBe(false);
    });

    it("should accept a plain config object", () => {
      const plainConfig = {
        window: mockWindow,
        fetch: mockFetch
      };
      
      const service = new ImportMapInitializer(plainConfig);
      
      expect(service.config.window).toBe(mockWindow);
      expect(service.config.fetch).toBe(mockFetch);
    });

    it("should use default config when none provided", () => {
      const service = new ImportMapInitializer();
      expect(service.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", async () => {
      await importMapInitializer.initialize();
      
      expect(importMapInitializer.window).toBe(mockWindow);
      expect(importMapInitializer.fetchImpl).toBe(mockFetch);
      expect(importMapInitializer.initialized).toBe(true);
    });

    it("should return early if no window is available", async () => {
      const configWithoutWindow = new ImportMapInitConfig({
        fetch: mockFetch
      });
      
      const service = new ImportMapInitializer(configWithoutWindow);
      const result = await service.initialize();
      
      expect(result).toBe(service);
    });

    it("should return early if no import map element is found", async () => {
      mockWindow.document.querySelector = jest.fn().mockReturnValue(null);
      
      const result = await importMapInitializer.initialize();
      
      expect(result).toBe(importMapInitializer);
      expect(mockWindow.document.querySelector).toHaveBeenCalledWith("script[data-rwtra-importmap]");
    });

    it("should handle existing config promise", async () => {
      mockWindow.__rwtraConfigPromise = Promise.resolve({ test: 'value' });
      
      const result = await importMapInitializer.initialize();
      
      expect(result).toBe(importMapInitializer);
    });

    it("should fetch and process config successfully", async () => {
      await importMapInitializer.initialize();
      
      // Wait for the async operations to complete
      await mockWindow.__rwtraConfigPromise;
      
      expect(mockWindow.__rwtraConfig).toBeDefined();
      expect(mockImportMapScript.textContent).toContain('imports');
    });

    it("should handle modules with importSpecifiers", async () => {
      const mockWindowWithSpecifiers = new MockWindow();
      const mockImportMapScriptWithSpecifiers = new MockImportMapScript();
      mockWindowWithSpecifiers.document.querySelector = jest.fn().mockReturnValue(mockImportMapScriptWithSpecifiers);

      const configWithModules = new ImportMapInitConfig({
        window: mockWindowWithSpecifiers,
        fetch: () => Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            modules: [
              {
                name: 'test-module',
                url: 'https://example.com/test-module.js',
                importSpecifiers: ['test-module', '@test/alias']
              }
            ]
          })
        })
      });

      const service = new ImportMapInitializer(configWithModules);

      await service.initialize();
      if (mockWindowWithSpecifiers.__rwtraConfigPromise) {
        await mockWindowWithSpecifiers.__rwtraConfigPromise;
      }

      expect(mockImportMapScriptWithSpecifiers.textContent).toContain('test-module');
      expect(mockImportMapScriptWithSpecifiers.textContent).toContain('@test/alias');
    });

    it("should handle modules without importSpecifiers", async () => {
      const mockWindowNoSpecifiers = new MockWindow();
      const mockImportMapScriptNoSpecifiers = new MockImportMapScript();
      mockWindowNoSpecifiers.document.querySelector = jest.fn().mockReturnValue(mockImportMapScriptNoSpecifiers);

      const configWithModules = new ImportMapInitConfig({
        window: mockWindowNoSpecifiers,
        fetch: () => Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            modules: [
              { name: 'test-module', url: 'https://example.com/test-module.js' }
            ]
          })
        })
      });

      const service = new ImportMapInitializer(configWithModules);

      await service.initialize();
      if (mockWindowNoSpecifiers.__rwtraConfigPromise) {
        await mockWindowNoSpecifiers.__rwtraConfigPromise;
      }

      expect(mockImportMapScriptNoSpecifiers.textContent).toContain('test-module');
    });

    it("should prevent double initialization", async () => {
      await importMapInitializer.initialize();
      
      await expect(importMapInitializer.initialize()).rejects.toThrow("ImportMapInitializer already initialized");
    });

    it("should return the instance to allow chaining", async () => {
      const result = await importMapInitializer.initialize();
      expect(result).toBe(importMapInitializer);
    });
  });

  describe("_fetchConfig method", () => {
    it("should throw an error when fetch is unavailable", async () => {
      importMapInitializer.fetchImpl = null;
      
      await expect(importMapInitializer._fetchConfig("config.json"))
        .rejects.toThrow("Fetch unavailable when initializing import map");
    });

    it("should fetch config successfully", async () => {
      importMapInitializer.fetchImpl = mockFetch;
      const config = await importMapInitializer._fetchConfig("config.json");

      expect(config).toBeDefined();
      expect(config.fallbackProviders).toBeDefined();
    });

    it("should throw error when fetch fails", async () => {
      importMapInitializer.fetchImpl = mockFetch;
      await expect(importMapInitializer._fetchConfig("error.json"))
        .rejects.toThrow("Failed to fetch error.json: 404");
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", async () => {
      // Before initialization
      expect(importMapInitializer.initialized).toBe(false);
      
      // Initialize
      const initResult = await importMapInitializer.initialize();
      expect(initResult).toBe(importMapInitializer);
      expect(importMapInitializer.initialized).toBe(true);
      
      // Wait for async operations to complete
      await mockWindow.__rwtraConfigPromise;
      
      // Verify config was set
      expect(mockWindow.__rwtraConfig).toBeDefined();
    });

    it("should handle complex module configuration", async () => {
      const complexConfig = new ImportMapInitConfig({
        window: mockWindow,
        fetch: () => Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            fallbackProviders: ['https://fallback.example.com'],
            providers: {
              default: 'https://default.example.com',
              aliases: { 'alias': 'https://alias.example.com' }
            },
            modules: [
              { 
                name: 'react', 
                url: 'https://cdn.example.com/react.js',
                importSpecifiers: ['react', 'react/jsx-runtime']
              },
              { 
                name: 'lodash',
                importSpecifiers: ['lodash', 'lodash-es']
              }
            ]
          })
        })
      });
      
      const service = new ImportMapInitializer(complexConfig);
      mockWindow.document.querySelector = jest.fn().mockReturnValue(mockImportMapScript);
      
      await service.initialize();
      await mockWindow.__rwtraConfigPromise;
      
      const importMap = JSON.parse(mockImportMapScript.textContent);
      expect(importMap.imports).toBeDefined();
      expect(importMap.imports['react']).toBeDefined();
      expect(importMap.imports['react/jsx-runtime']).toBeDefined();
      expect(importMap.imports['lodash']).toBeDefined();
      expect(importMap.imports['lodash-es']).toBeDefined();
    });
  });
});