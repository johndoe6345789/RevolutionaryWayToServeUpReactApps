import NetworkServiceConfig from "../../../../../bootstrap/configs/cdn/network-service.js";

describe("NetworkServiceConfig", () => {
  describe("constructor", () => {
    it("should initialize with undefined values when no options provided", () => {
      const config = new NetworkServiceConfig();
      
      expect(config.logClient).toBeUndefined();
      expect(config.wait).toBeUndefined();
      expect(config.namespace).toBeUndefined();
      expect(config.providerConfig).toBeUndefined();
      expect(config.probeConfig).toBeUndefined();
      expect(config.moduleResolverConfig).toBeUndefined();
    });

    it("should accept and store logClient option", () => {
      const logClient = jest.fn();
      const config = new NetworkServiceConfig({ logClient });
      
      expect(config.logClient).toBe(logClient);
    });

    it("should accept and store wait option", () => {
      const wait = jest.fn();
      const config = new NetworkServiceConfig({ wait });
      
      expect(config.wait).toBe(wait);
    });

    it("should accept and store namespace option", () => {
      const namespace = { helpers: {} };
      const config = new NetworkServiceConfig({ namespace });
      
      expect(config.namespace).toBe(namespace);
    });

    it("should accept and store providerConfig option", () => {
      const providerConfig = { providers: [] };
      const config = new NetworkServiceConfig({ providerConfig });
      
      expect(config.providerConfig).toBe(providerConfig);
    });

    it("should accept and store probeConfig option", () => {
      const probeConfig = { timeout: 10 };
      const config = new NetworkServiceConfig({ probeConfig });
      
      expect(config.probeConfig).toBe(probeConfig);
    });

    it("should accept and store moduleResolverConfig option", () => {
      const moduleResolverConfig = { maxRetries: 2 };
      const config = new NetworkServiceConfig({ moduleResolverConfig });
      
      expect(config.moduleResolverConfig).toBe(moduleResolverConfig);
    });

    it("should default isCommonJs to module environment when not provided", () => {
      const config = new NetworkServiceConfig();
      const expected = typeof module !== "undefined" && module.exports;
      
      expect(config.isCommonJs).toBe(expected);
    });

    it("should use provided isCommonJs value when it's a boolean", () => {
      let config = new NetworkServiceConfig({ isCommonJs: true });
      expect(config.isCommonJs).toBe(true);
      
      config = new NetworkServiceConfig({ isCommonJs: false });
      expect(config.isCommonJs).toBe(false);
    });

    it("should fallback to module environment when isCommonJs is not a boolean", () => {
      const originalIsCommonJs = typeof module !== "undefined" && module.exports;
      
      let config = new NetworkServiceConfig({ isCommonJs: "true" });
      expect(config.isCommonJs).toBe(originalIsCommonJs);
      
      config = new NetworkServiceConfig({ isCommonJs: 1 });
      expect(config.isCommonJs).toBe(originalIsCommonJs);
      
      config = new NetworkServiceConfig({ isCommonJs: null });
      expect(config.isCommonJs).toBe(originalIsCommonJs);
    });

    it("should accept all options at once", () => {
      const options = {
        logClient: jest.fn(),
        wait: jest.fn(),
        namespace: { helpers: {} },
        providerConfig: { providers: [] },
        probeConfig: { timeout: 10 },
        moduleResolverConfig: { maxRetries: 2 },
        isCommonJs: true
      };
      
      const config = new NetworkServiceConfig(options);
      
      expect(config.logClient).toBe(options.logClient);
      expect(config.wait).toBe(options.wait);
      expect(config.namespace).toBe(options.namespace);
      expect(config.providerConfig).toBe(options.providerConfig);
      expect(config.probeConfig).toBe(options.probeConfig);
      expect(config.moduleResolverConfig).toBe(options.moduleResolverConfig);
      expect(config.isCommonJs).toBe(true);
    });
  });

  describe("property access", () => {
    it("should allow accessing logClient property", () => {
      const logClient = jest.fn();
      const config = new NetworkServiceConfig({ logClient });
      
      expect(config.logClient).toBe(logClient);
    });

    it("should allow accessing wait property", () => {
      const wait = jest.fn();
      const config = new NetworkServiceConfig({ wait });
      
      expect(config.wait).toBe(wait);
    });

    it("should allow accessing namespace property", () => {
      const namespace = { helpers: {} };
      const config = new NetworkServiceConfig({ namespace });
      
      expect(config.namespace).toBe(namespace);
    });

    it("should allow accessing providerConfig property", () => {
      const providerConfig = { providers: [] };
      const config = new NetworkServiceConfig({ providerConfig });
      
      expect(config.providerConfig).toBe(providerConfig);
    });

    it("should allow accessing probeConfig property", () => {
      const probeConfig = { timeout: 10 };
      const config = new NetworkServiceConfig({ probeConfig });
      
      expect(config.probeConfig).toBe(probeConfig);
    });

    it("should allow accessing moduleResolverConfig property", () => {
      const moduleResolverConfig = { maxRetries: 2 };
      const config = new NetworkServiceConfig({ moduleResolverConfig });
      
      expect(config.moduleResolverConfig).toBe(moduleResolverConfig);
    });

    it("should allow accessing isCommonJs property", () => {
      const config = new NetworkServiceConfig({ isCommonJs: true });
      
      expect(config.isCommonJs).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle null options object", () => {
      const config = new NetworkServiceConfig(null);
      
      expect(config.logClient).toBeUndefined();
      expect(config.wait).toBeUndefined();
      expect(config.namespace).toBeUndefined();
      expect(config.providerConfig).toBeUndefined();
      expect(config.probeConfig).toBeUndefined();
      expect(config.moduleResolverConfig).toBeUndefined();
      expect(config.isCommonJs).toBe(typeof module !== "undefined" && module.exports);
    });

    it("should handle undefined options object", () => {
      const config = new NetworkServiceConfig(undefined);
      
      expect(config.logClient).toBeUndefined();
      expect(config.wait).toBeUndefined();
      expect(config.namespace).toBeUndefined();
      expect(config.providerConfig).toBeUndefined();
      expect(config.probeConfig).toBeUndefined();
      expect(config.moduleResolverConfig).toBeUndefined();
      expect(config.isCommonJs).toBe(typeof module !== "undefined" && module.exports);
    });

    it("should handle options with extra properties", () => {
      const config = new NetworkServiceConfig({
        logClient: jest.fn(),
        extraProperty: "should be ignored",
        anotherExtra: "also ignored"
      });
      
      expect(config.logClient).toBeDefined();
      expect(config.wait).toBeUndefined();
      expect(config.namespace).toBeUndefined();
      // Extra properties should not be added to the config
      expect(config.extraProperty).toBeUndefined();
      expect(config.anotherExtra).toBeUndefined();
    });
  });
});