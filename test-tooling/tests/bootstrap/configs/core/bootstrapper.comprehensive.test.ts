const BootstrapperConfig = require("../../../../bootstrap/configs/core/bootstrapper.js");

describe("BootstrapperConfig", () => {
  describe("constructor", () => {
    it("should initialize with all provided configuration options", () => {
      const mockFetch = jest.fn();
      const mockLogging = { log: jest.fn() };
      const mockNetwork = { get: jest.fn() };
      const mockModuleLoader = { load: jest.fn() };
      
      const config = new BootstrapperConfig({
        configUrl: "custom-config.json",
        fetch: mockFetch,
        logging: mockLogging,
        network: mockNetwork,
        moduleLoader: mockModuleLoader
      });

      expect(config.configUrl).toBe("custom-config.json");
      expect(config.fetch).toBe(mockFetch);
      expect(config.logging).toBe(mockLogging);
      expect(config.network).toBe(mockNetwork);
      expect(config.moduleLoader).toBe(mockModuleLoader);
    });

    it("should set default configUrl when not provided", () => {
      const config = new BootstrapperConfig();

      expect(config.configUrl).toBe("config.json");
    });

    it("should accept partial configuration options", () => {
      const config = new BootstrapperConfig({
        configUrl: "custom.json"
      });

      expect(config.configUrl).toBe("custom.json");
      expect(config.fetch).toBeUndefined();
      expect(config.logging).toBeUndefined();
      expect(config.network).toBeUndefined();
      expect(config.moduleLoader).toBeUndefined();
    });

    it("should accept undefined values explicitly", () => {
      const config = new BootstrapperConfig({
        configUrl: undefined,
        fetch: undefined,
        logging: undefined
      });

      // configUrl has a default value, so it should still be "config.json"
      expect(config.configUrl).toBe("config.json");
      expect(config.fetch).toBeUndefined();
      expect(config.logging).toBeUndefined();
      expect(config.network).toBeUndefined();
      expect(config.moduleLoader).toBeUndefined();
    });

    it("should handle null values in configuration", () => {
      const config = new BootstrapperConfig({
        configUrl: null,
        fetch: null,
        logging: null
      });

      expect(config.configUrl).toBeNull();
      expect(config.fetch).toBeNull();
      expect(config.logging).toBeNull();
      expect(config.network).toBeUndefined();
      expect(config.moduleLoader).toBeUndefined();
    });

    it("should accept function values for fetch", () => {
      const fetchFn = () => Promise.resolve({ ok: true });
      
      const config = new BootstrapperConfig({
        fetch: fetchFn
      });

      expect(config.fetch).toBe(fetchFn);
    });

    it("should accept object values for helpers", () => {
      const mockLogging = { log: jest.fn(), error: jest.fn() };
      const mockNetwork = { get: jest.fn(), post: jest.fn() };
      
      const config = new BootstrapperConfig({
        logging: mockLogging,
        network: mockNetwork
      });

      expect(config.logging).toBe(mockLogging);
      expect(config.network).toBe(mockNetwork);
    });
  });

  describe("property validation", () => {
    it("should maintain reference equality for objects", () => {
      const mockLogging = { test: "value" };
      const mockNetwork = { test: "value" };
      
      const config = new BootstrapperConfig({
        logging: mockLogging,
        network: mockNetwork
      });

      expect(config.logging).toBe(mockLogging);
      expect(config.network).toBe(mockNetwork);
    });

    it("should store primitive values correctly", () => {
      const config = new BootstrapperConfig({
        configUrl: "test-config.json"
      });

      expect(config.configUrl).toBe("test-config.json");
    });
  });

  describe("edge cases", () => {
    it("should handle empty object configuration", () => {
      const config = new BootstrapperConfig({});

      expect(config.configUrl).toBe("config.json");
      expect(config.fetch).toBeUndefined();
      expect(config.logging).toBeUndefined();
      expect(config.network).toBeUndefined();
      expect(config.moduleLoader).toBeUndefined();
    });

    it("should handle configuration with unknown properties", () => {
      const config = new BootstrapperConfig({
        configUrl: "test.json",
        unknownProp: "value",
        anotherUnknown: "value2"
      });

      expect(config.configUrl).toBe("test.json");
      expect(config.fetch).toBeUndefined();
      expect(config.logging).toBeUndefined();
      expect(config.network).toBeUndefined();
      expect(config.moduleLoader).toBeUndefined();
      // The unknown properties should not be present
      expect(config.unknownProp).toBeUndefined();
      expect(config.anotherUnknown).toBeUndefined();
    });
  });

  describe("integration tests", () => {
    it("should work with realistic bootstrapper configuration", () => {
      const realisticConfig = new BootstrapperConfig({
        configUrl: "https://example.com/config.json",
        fetch: global.fetch || (() => Promise.resolve({ ok: true })),
        logging: {
          log: jest.fn(),
          error: jest.fn(),
          warn: jest.fn()
        },
        network: {
          getProvider: jest.fn(),
          probeUrl: jest.fn()
        },
        moduleLoader: {
          loadModule: jest.fn(),
          registerHelper: jest.fn()
        }
      });

      expect(realisticConfig.configUrl).toBe("https://example.com/config.json");
      expect(realisticConfig.logging).toBeDefined();
      expect(realisticConfig.network).toBeDefined();
      expect(realisticConfig.moduleLoader).toBeDefined();
    });
  });
});