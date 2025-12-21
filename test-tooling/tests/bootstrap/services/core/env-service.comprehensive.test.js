const EnvInitializer = require("../../../../../bootstrap/services/core/env-service.js");
const EnvInitializerConfig = require("../../../../../bootstrap/configs/core/env.js");
const ServiceRegistry = require("../../../../../bootstrap/registries/service-registry.js");

describe("EnvInitializer", () => {
  describe("constructor", () => {
    test("should create an instance with default config when no config provided", () => {
      const service = new EnvInitializer();
      expect(service).toBeInstanceOf(EnvInitializer);
      expect(service.config).toBeInstanceOf(EnvInitializerConfig);
    });

    test("should create an instance with provided config", () => {
      const config = new EnvInitializerConfig();
      const service = new EnvInitializer(config);
      expect(service.config).toBe(config);
    });

    test("should inherit from BaseService", () => {
      const service = new EnvInitializer();
      expect(service).toHaveProperty('_ensureNotInitialized');
      expect(service).toHaveProperty('_markInitialized');
      expect(service).toHaveProperty('initialized');
    });
  });

  describe("initialize method", () => {
    let mockGlobal, mockServiceRegistry;
    
    beforeEach(() => {
      mockGlobal = {};
      mockServiceRegistry = new ServiceRegistry();
    });

    test("should set up internal properties and mark as initialized", () => {
      const config = new EnvInitializerConfig({ global: mockGlobal, serviceRegistry: mockServiceRegistry });
      const service = new EnvInitializer(config);
      
      const result = service.initialize();
      
      expect(result).toBe(service);
      expect(service.global).toBe(mockGlobal);
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.initialized).toBe(true);
    });

    test("should ensure proxy mode is set", () => {
      const config = new EnvInitializerConfig({ global: mockGlobal, serviceRegistry: mockServiceRegistry });
      const service = new EnvInitializer(config);
      
      service.initialize();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("auto");
    });

    test("should preserve existing proxy mode if already set", () => {
      mockGlobal.__RWTRA_PROXY_MODE__ = "direct";
      const config = new EnvInitializerConfig({ global: mockGlobal, serviceRegistry: mockServiceRegistry });
      const service = new EnvInitializer(config);
      
      service.initialize();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("direct");
    });

    test("should throw if no global object is provided", () => {
      const config = new EnvInitializerConfig({ global: undefined, serviceRegistry: mockServiceRegistry });
      const service = new EnvInitializer(config);
      
      expect(() => service.initialize()).toThrow("Global object required for EnvInitializer");
    });

    test("should throw if no service registry is provided", () => {
      const config = new EnvInitializerConfig({ global: mockGlobal, serviceRegistry: undefined });
      const service = new EnvInitializer(config);
      
      expect(() => service.initialize()).toThrow("ServiceRegistry required for EnvInitializer");
    });

    test("should register the service in the registry", () => {
      const config = new EnvInitializerConfig({ global: mockGlobal, serviceRegistry: mockServiceRegistry });
      const service = new EnvInitializer(config);
      
      service.initialize();
      
      expect(mockServiceRegistry.isRegistered("env")).toBe(true);
      expect(mockServiceRegistry.getService("env")).toBe(service);
    });

    test("should prevent double initialization", () => {
      const config = new EnvInitializerConfig({ global: mockGlobal, serviceRegistry: mockServiceRegistry });
      const service = new EnvInitializer(config);
      
      service.initialize();
      
      expect(() => service.initialize()).toThrow();
    });
  });

  describe("ensureProxyMode method", () => {
    test("should set proxy mode to 'auto' if not defined", () => {
      const mockGlobal = {};
      const config = new EnvInitializerConfig({ global: mockGlobal });
      const service = new EnvInitializer(config);
      
      // Need to set the global property manually for this test since initialize hasn't been called
      service.global = mockGlobal;
      service.ensureProxyMode();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("auto");
    });

    test("should not override existing proxy mode", () => {
      const mockGlobal = { __RWTRA_PROXY_MODE__: "proxy" };
      const config = new EnvInitializerConfig({ global: mockGlobal });
      const service = new EnvInitializer(config);
      
      // Need to set the global property manually for this test since initialize hasn't been called
      service.global = mockGlobal;
      service.ensureProxyMode();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("proxy");
    });

    test("should handle null global object", () => {
      const mockGlobal = { __RWTRA_PROXY_MODE__: null };
      const config = new EnvInitializerConfig({ global: mockGlobal });
      const service = new EnvInitializer(config);
      
      // Need to set the global property manually for this test since initialize hasn't been called
      service.global = mockGlobal;
      service.ensureProxyMode();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe(null);
    });
  });

  describe("integration", () => {
    let mockGlobal, mockServiceRegistry;
    
    beforeEach(() => {
      mockGlobal = {};
      mockServiceRegistry = new ServiceRegistry();
    });

    test("should work through full lifecycle", () => {
      const config = new EnvInitializerConfig({ global: mockGlobal, serviceRegistry: mockServiceRegistry });
      const service = new EnvInitializer(config);
      
      // Initialize the service
      const result = service.initialize();
      
      // Verify it returns itself
      expect(result).toBe(service);
      
      // Verify properties were set
      expect(service.global).toBe(mockGlobal);
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.initialized).toBe(true);
      
      // Verify proxy mode was set
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("auto");
      
      // Verify service was registered
      expect(mockServiceRegistry.isRegistered("env")).toBe(true);
      expect(mockServiceRegistry.getService("env")).toBe(service);
    });

    test("should handle multiple initializations with same proxy mode", () => {
      mockGlobal.__RWTRA_PROXY_MODE__ = "direct";
      const config = new EnvInitializerConfig({ global: mockGlobal, serviceRegistry: mockServiceRegistry });
      const service = new EnvInitializer(config);
      
      service.initialize();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("direct");
      expect(mockServiceRegistry.isRegistered("env")).toBe(true);
    });
  });
});