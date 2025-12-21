const EnvInitializer = require("../../../../bootstrap/services/core/env-service.js");

describe("EnvInitializer", () => {
  let mockGlobal;
  let mockServiceRegistry;
  let config;

  beforeEach(() => {
    mockGlobal = {};
    mockServiceRegistry = {
      register: jest.fn()
    };
    
    config = {
      global: mockGlobal,
      serviceRegistry: mockServiceRegistry
    };
  });

  describe("constructor", () => {
    it("should initialize with default config when no config provided", () => {
      const envInitializer = new EnvInitializer();
      expect(envInitializer.config).toBeDefined();
      expect(envInitializer.initialized).toBe(false);
    });

    it("should initialize with provided config", () => {
      const envInitializer = new EnvInitializer(config);
      expect(envInitializer.config).toBe(config);
      expect(envInitializer.initialized).toBe(false);
    });

    it("should inherit from BaseService", () => {
      const envInitializer = new EnvInitializer(config);
      expect(envInitializer instanceof require("../../../../bootstrap/services/base-service.js")).toBe(true);
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties and mark as initialized", () => {
      const envInitializer = new EnvInitializer(config);
      
      const result = envInitializer.initialize();
      
      expect(result).toBe(envInitializer);
      expect(envInitializer.global).toBe(mockGlobal);
      expect(envInitializer.serviceRegistry).toBe(mockServiceRegistry);
      expect(envInitializer.initialized).toBe(true);
      expect(mockServiceRegistry.register).toHaveBeenCalledWith("env", envInitializer, {
        folder: "services/core",
        domain: "core"
      });
    });

    it("should ensure proxy mode is set", () => {
      const envInitializer = new EnvInitializer(config);
      
      envInitializer.initialize();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("auto");
    });

    it("should preserve existing proxy mode if already set", () => {
      mockGlobal.__RWTRA_PROXY_MODE__ = "direct";
      const envInitializer = new EnvInitializer(config);
      
      envInitializer.initialize();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("direct");
    });

    it("should throw if no global object is provided", () => {
      const badConfig = { serviceRegistry: mockServiceRegistry };
      const envInitializer = new EnvInitializer(badConfig);
      
      expect(() => envInitializer.initialize()).toThrow("Global object required for EnvInitializer");
    });

    it("should throw if no service registry is provided", () => {
      const badConfig = { global: mockGlobal };
      const envInitializer = new EnvInitializer(badConfig);
      
      expect(() => envInitializer.initialize()).toThrow("ServiceRegistry required for EnvInitializer");
    });

    it("should throw if initialized twice", () => {
      const envInitializer = new EnvInitializer(config);
      envInitializer.initialize();
      
      expect(() => envInitializer.initialize()).toThrow("EnvInitializer already initialized");
    });

    it("should register the service in the registry", () => {
      const envInitializer = new EnvInitializer(config);
      
      envInitializer.initialize();
      
      expect(mockServiceRegistry.register).toHaveBeenCalledTimes(1);
      expect(mockServiceRegistry.register).toHaveBeenCalledWith("env", envInitializer, {
        folder: "services/core",
        domain: "core"
      });
    });
  });

  describe("ensureProxyMode method", () => {
    it("should set proxy mode to auto if not defined", () => {
      const envInitializer = new EnvInitializer(config);
      envInitializer.global = mockGlobal;
      
      envInitializer.ensureProxyMode();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("auto");
    });

    it("should not overwrite existing proxy mode", () => {
      mockGlobal.__RWTRA_PROXY_MODE__ = "proxy";
      const envInitializer = new EnvInitializer(config);
      envInitializer.global = mockGlobal;
      
      envInitializer.ensureProxyMode();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("proxy");
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      const envInitializer = new EnvInitializer(config);
      
      // Before initialization
      expect(envInitializer.initialized).toBe(false);
      expect(() => envInitializer._ensureInitialized()).toThrow();
      
      // Initialize
      const result = envInitializer.initialize();
      
      // After initialization
      expect(result).toBe(envInitializer);
      expect(envInitializer.initialized).toBe(true);
      expect(envInitializer.global).toBe(mockGlobal);
      expect(envInitializer.serviceRegistry).toBe(mockServiceRegistry);
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("auto");
      expect(() => envInitializer._ensureInitialized()).not.toThrow();
      
      // Verify registration happened
      expect(mockServiceRegistry.register).toHaveBeenCalledWith("env", envInitializer, {
        folder: "services/core",
        domain: "core"
      });
    });

    it("should handle multiple initializations with same proxy mode", () => {
      mockGlobal.__RWTRA_PROXY_MODE__ = "direct";
      const envInitializer = new EnvInitializer(config);
      
      envInitializer.initialize();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("direct");
    });
  });
});