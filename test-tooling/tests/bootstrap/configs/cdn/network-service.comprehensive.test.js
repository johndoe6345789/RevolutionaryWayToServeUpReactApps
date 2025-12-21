// Comprehensive test suite for NetworkServiceConfig class
const NetworkServiceConfig = require("../../../../../bootstrap/configs/cdn/network-service.js");

describe("NetworkServiceConfig", () => {
  describe("constructor", () => {
    test("should initialize with undefined values when no options provided", () => {
      const config = new NetworkServiceConfig();

      expect(config.logClient).toBeUndefined();
      expect(config.wait).toBeUndefined();
      expect(config.namespace).toBeUndefined();
      expect(config.providerConfig).toBeUndefined();
      expect(config.probeConfig).toBeUndefined();
      expect(config.moduleResolverConfig).toBeUndefined();
      // Check that isCommonJs is set based on the module environment
      expect(typeof config.isCommonJs).toBe("boolean");
    });

    test("should accept and store all configuration options", () => {
      const overrides = {
        logClient: jest.fn(),
        wait: jest.fn(),
        namespace: { helpers: {} },
        providerConfig: { providers: [] },
        probeConfig: { timeout: 10 },
        moduleResolverConfig: { maxRetries: 2 },
        isCommonJs: false,
      };

      const config = new NetworkServiceConfig(overrides);

      expect(config.logClient).toBe(overrides.logClient);
      expect(config.wait).toBe(overrides.wait);
      expect(config.namespace).toBe(overrides.namespace);
      expect(config.providerConfig).toBe(overrides.providerConfig);
      expect(config.probeConfig).toBe(overrides.probeConfig);
      expect(config.moduleResolverConfig).toBe(overrides.moduleResolverConfig);
      expect(config.isCommonJs).toBe(false);
    });

    test("should default isCommonJs to module environment when not provided", () => {
      const originalModule = global.module;
      // Temporarily set module to simulate CommonJS environment
      global.module = { exports: {} };

      const config = new NetworkServiceConfig({});
      expect(config.isCommonJs).toBe(true);

      // Restore original module
      global.module = originalModule;
    });

    test("should override isCommonJs with provided value", () => {
      const config = new NetworkServiceConfig({ isCommonJs: true });
      expect(config.isCommonJs).toBe(true);

      const config2 = new NetworkServiceConfig({ isCommonJs: false });
      expect(config2.isCommonJs).toBe(false);
    });

    test("should handle partial configuration options", () => {
      const config = new NetworkServiceConfig({
        logClient: () => {},
        namespace: { test: "value" }
      });

      expect(config.logClient).toBeDefined();
      expect(config.namespace).toEqual({ test: "value" });
      expect(config.wait).toBeUndefined();
      expect(config.providerConfig).toBeUndefined();
      expect(config.probeConfig).toBeUndefined();
      expect(config.moduleResolverConfig).toBeUndefined();
    });
  });

  describe("property validation", () => {
    test("should store complex nested objects correctly", () => {
      const complexProviderConfig = {
        providers: ["https://example.com", "https://another.com"],
        fallbacks: { default: "https://fallback.com" },
        timeouts: { connect: 5000, read: 10000 }
      };

      const config = new NetworkServiceConfig({
        providerConfig: complexProviderConfig
      });

      expect(config.providerConfig).toBe(complexProviderConfig);
      expect(config.providerConfig.providers.length).toBe(2);
      expect(config.providerConfig.fallbacks.default).toBe("https://fallback.com");
    });

    test("should maintain reference equality for objects", () => {
      const testObject = { data: "test" };
      const config = new NetworkServiceConfig({
        namespace: testObject
      });

      expect(config.namespace).toBe(testObject); // Same reference
    });
  });

  describe("edge cases", () => {
    test("should handle null values in configuration", () => {
      const config = new NetworkServiceConfig({
        logClient: null,
        wait: null,
        namespace: null
      });

      expect(config.logClient).toBeNull();
      expect(config.wait).toBeNull();
      expect(config.namespace).toBeNull();
    });

    test("should handle primitive values in configuration", () => {
      const config = new NetworkServiceConfig({
        logClient: "logger",
        wait: 100,
        namespace: 42
      });

      expect(config.logClient).toBe("logger");
      expect(config.wait).toBe(100);
      expect(config.namespace).toBe(42);
    });
  });
});