const NetworkServiceConfig = require("../../../../bootstrap/configs/cdn/network-service.js");

describe("NetworkServiceConfig", () => {
  describe("constructor", () => {
    it("should initialize with all provided configuration options", () => {
      const configOptions = {
        logClient: jest.fn(),
        wait: jest.fn(),
        namespace: { test: "namespace" },
        providerConfig: { providers: ["provider1"] },
        probeConfig: { timeout: 5000 },
        moduleResolverConfig: { maxRetries: 3 },
        isCommonJs: true
      };

      const config = new NetworkServiceConfig(configOptions);

      expect(config.logClient).toBe(configOptions.logClient);
      expect(config.wait).toBe(configOptions.wait);
      expect(config.namespace).toBe(configOptions.namespace);
      expect(config.providerConfig).toBe(configOptions.providerConfig);
      expect(config.probeConfig).toBe(configOptions.probeConfig);
      expect(config.moduleResolverConfig).toBe(configOptions.moduleResolverConfig);
      expect(config.isCommonJs).toBe(true);
    });

    it("should initialize with undefined values when no options provided", () => {
      const config = new NetworkServiceConfig();

      expect(config.logClient).toBeUndefined();
      expect(config.wait).toBeUndefined();
      expect(config.namespace).toBeUndefined();
      expect(config.providerConfig).toBeUndefined();
      expect(config.probeConfig).toBeUndefined();
      expect(config.moduleResolverConfig).toBeUndefined();
      expect(config.isCommonJs).toBeDefined(); // Will be boolean based on environment
    });

    it("should default isCommonJs to module environment when not provided", () => {
      // This test verifies that isCommonJs defaults to the module environment
      const config = new NetworkServiceConfig({});

      // In test environment, module might be defined, so we expect a boolean
      expect(typeof config.isCommonJs).toBe('boolean');
    });

    it("should override isCommonJs with provided value", () => {
      const config1 = new NetworkServiceConfig({ isCommonJs: true });
      expect(config1.isCommonJs).toBe(true);

      const config2 = new NetworkServiceConfig({ isCommonJs: false });
      expect(config2.isCommonJs).toBe(false);
    });

    it("should handle partial configuration options", () => {
      const configOptions = {
        logClient: jest.fn(),
        namespace: { test: "namespace" }
      };

      const config = new NetworkServiceConfig(configOptions);

      expect(config.logClient).toBe(configOptions.logClient);
      expect(config.namespace).toBe(configOptions.namespace);
      expect(config.wait).toBeUndefined();
      expect(config.providerConfig).toBeUndefined();
      expect(config.probeConfig).toBeUndefined();
      expect(config.moduleResolverConfig).toBeUndefined();
    });

    it("should accept complex nested objects in configuration", () => {
      const complexProviderConfig = {
        providers: ["provider1", "provider2"],
        fallbacks: {
          primary: "fallback1",
          secondary: "fallback2"
        },
        timeout: 5000
      };

      const config = new NetworkServiceConfig({
        providerConfig: complexProviderConfig
      });

      expect(config.providerConfig).toEqual(complexProviderConfig);
      expect(config.providerConfig.fallbacks.primary).toBe("fallback1");
    });
  });

  describe("property validation", () => {
    it("should store function properties correctly", () => {
      const logClientFn = jest.fn();
      const waitFn = jest.fn();

      const config = new NetworkServiceConfig({
        logClient: logClientFn,
        wait: waitFn
      });

      expect(config.logClient).toBe(logClientFn);
      expect(config.wait).toBe(waitFn);
    });

    it("should maintain reference equality for objects", () => {
      const namespace = { test: "value" };
      const providerConfig = { providers: ["test"] };

      const config = new NetworkServiceConfig({
        namespace: namespace,
        providerConfig: providerConfig
      });

      expect(config.namespace).toBe(namespace);
      expect(config.providerConfig).toBe(providerConfig);
    });
  });

  describe("edge cases", () => {
    it("should handle null values in configuration", () => {
      const config = new NetworkServiceConfig({
        logClient: null,
        namespace: null,
        providerConfig: null
      });

      expect(config.logClient).toBeNull();
      expect(config.namespace).toBeNull();
      expect(config.providerConfig).toBeNull();
    });

    it("should handle primitive values in configuration", () => {
      const config = new NetworkServiceConfig({
        logClient: "notAFunction",
        namespace: "notAnObject",
        providerConfig: 42
      });

      expect(config.logClient).toBe("notAFunction");
      expect(config.namespace).toBe("notAnObject");
      expect(config.providerConfig).toBe(42);
    });

    it("should handle undefined explicitly", () => {
      const config = new NetworkServiceConfig({
        logClient: undefined,
        namespace: undefined
      });

      expect(config.logClient).toBeUndefined();
      expect(config.namespace).toBeUndefined();
    });
  });

  describe("integration tests", () => {
    it("should work with realistic network service configuration", () => {
      const realisticConfig = new NetworkServiceConfig({
        logClient: jest.fn(),
        wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
        namespace: { helpers: {} },
        providerConfig: {
          providers: ["https://cdn1.example.com", "https://cdn2.example.com"],
          fallbackProviders: ["https://fallback.example.com"],
          defaultProviderBase: "https://default.example.com"
        },
        probeConfig: {
          timeout: 10000,
          maxRetries: 3,
          retryDelay: 1000
        },
        moduleResolverConfig: {
          maxRetries: 3,
          retryDelay: 500
        },
        isCommonJs: false
      });

      expect(realisticConfig.logClient).toBeDefined();
      expect(realisticConfig.providerConfig.providers).toContain("https://cdn1.example.com");
      expect(realisticConfig.probeConfig.timeout).toBe(10000);
      expect(realisticConfig.moduleResolverConfig.maxRetries).toBe(3);
      expect(realisticConfig.isCommonJs).toBe(false);
    });
  });
});