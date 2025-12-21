// Mock dependencies before importing
jest.mock("../../bootstrap/configs/core/env.js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      global: {},
      serviceRegistry: { register: jest.fn() }
    }))
  };
});

import EnvInitializer from "../../bootstrap/services/core/env-service.js";

describe("EnvInitializer", () => {
  let envInitializer;
  let mockGlobal;
  let mockServiceRegistry;

  beforeEach(() => {
    mockGlobal = {};
    mockServiceRegistry = {
      register: jest.fn(),
    };
    
    const config = {
      global: mockGlobal,
      serviceRegistry: mockServiceRegistry,
    };
    
    envInitializer = new EnvInitializer(config);
  });

  describe("constructor", () => {
    it("should create an instance with provided config", () => {
      expect(envInitializer).toBeInstanceOf(EnvInitializer);
      expect(envInitializer.config).toBeDefined();
    });

    it("should create an instance with default config when none provided", () => {
      const envInit = new EnvInitializer();
      expect(envInit).toBeInstanceOf(EnvInitializer);
      expect(envInit.config).toBeDefined();
    });

    it("should accept a pre-built EnvInitializerConfig", () => {
      const EnvInitializerConfig = require("../../bootstrap/configs/core/env.js").default;
      const config = new EnvInitializerConfig();
      const envInit = new EnvInitializer(config);
      expect(envInit.config).toBe(config);
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      const result = envInitializer.initialize();
      
      expect(envInitializer.global).toBe(mockGlobal);
      expect(envInitializer.serviceRegistry).toBe(mockServiceRegistry);
      expect(envInitializer.initialized).toBe(true);
      expect(result).toBe(envInitializer);
    });

    it("should ensure proxy mode is set", () => {
      envInitializer.initialize();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("auto");
    });

    it("should not override existing proxy mode", () => {
      mockGlobal.__RWTRA_PROXY_MODE__ = "direct";
      
      envInitializer.initialize();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("direct");
    });

    it("should register itself with the service registry", () => {
      envInitializer.initialize();
      
      expect(mockServiceRegistry.register).toHaveBeenCalledWith(
        "env", 
        envInitializer, 
        { folder: "services/core", domain: "core" }
      );
    });

    it("should throw an error if no global object is provided", () => {
      const config = { global: undefined, serviceRegistry: mockServiceRegistry };
      const envInit = new EnvInitializer(config);
      
      expect(() => {
        envInit.initialize();
      }).toThrow("Global object required for EnvInitializer");
    });

    it("should throw an error if no service registry is provided", () => {
      const config = { global: mockGlobal, serviceRegistry: undefined };
      const envInit = new EnvInitializer(config);
      
      expect(() => {
        envInit.initialize();
      }).toThrow("ServiceRegistry required for EnvInitializer");
    });

    it("should throw if already initialized", () => {
      envInitializer.initialize();
      
      expect(() => {
        envInitializer.initialize();
      }).toThrow(/already initialized/);
    });
  });

  describe("ensureProxyMode method", () => {
    beforeEach(() => {
      // Initialize the instance to set up the global property
      envInitializer.global = mockGlobal;
    });

    it("should set proxy mode to 'auto' if undefined", () => {
      delete mockGlobal.__RWTRA_PROXY_MODE__;
      
      envInitializer.ensureProxyMode();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("auto");
    });

    it("should not override existing proxy mode", () => {
      mockGlobal.__RWTRA_PROXY_MODE__ = "proxy";
      
      envInitializer.ensureProxyMode();
      
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("proxy");
    });

    it("should handle different proxy mode values", () => {
      // Test with 'direct'
      mockGlobal.__RWTRA_PROXY_MODE__ = "direct";
      envInitializer.ensureProxyMode();
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("direct");
      
      // Test with 'auto'
      mockGlobal.__RWTRA_PROXY_MODE__ = "auto";
      envInitializer.ensureProxyMode();
      expect(mockGlobal.__RWTRA_PROXY_MODE__).toBe("auto");
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      const config = {
        global: { someProperty: "value" },
        serviceRegistry: { register: jest.fn() },
      };
      
      const envInit = new EnvInitializer(config);
      
      expect(envInit.initialized).toBe(false);
      
      const result = envInit.initialize();
      
      expect(result).toBe(envInit);
      expect(envInit.initialized).toBe(true);
      expect(envInit.global).toBe(config.global);
      expect(envInit.serviceRegistry).toBe(config.serviceRegistry);
      expect(envInit.global.__RWTRA_PROXY_MODE__).toBe("auto");
      
      expect(config.serviceRegistry.register).toHaveBeenCalledWith(
        "env", 
        envInit, 
        { folder: "services/core", domain: "core" }
      );
    });

    it("should handle different proxy mode configurations", () => {
      const config = {
        global: { __RWTRA_PROXY_MODE__: "proxy" },
        serviceRegistry: { register: jest.fn() },
      };
      
      const envInit = new EnvInitializer(config);
      envInit.initialize();
      
      // Proxy mode should remain unchanged
      expect(envInit.global.__RWTRA_PROXY_MODE__).toBe("proxy");
      
      // But service should still be registered
      expect(config.serviceRegistry.register).toHaveBeenCalledWith(
        "env", 
        envInit, 
        { folder: "services/core", domain: "core" }
      );
    });
  });
});