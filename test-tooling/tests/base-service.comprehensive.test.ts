import BaseService from "../../bootstrap/services/base-service.js";

describe("BaseService", () => {
  let baseService;

  beforeEach(() => {
    const config = { serviceRegistry: {}, namespace: {} };
    baseService = new BaseService(config);
  });

  describe("constructor", () => {
    it("should create an instance with provided config", () => {
      const config = { test: "value" };
      const service = new BaseService(config);
      
      expect(service).toBeInstanceOf(BaseService);
      expect(service.config).toBe(config);
      expect(service.initialized).toBe(false);
    });

    it("should create an instance with empty config when none provided", () => {
      const service = new BaseService();
      
      expect(service).toBeInstanceOf(BaseService);
      expect(service.config).toEqual({});
      expect(service.initialized).toBe(false);
    });

    it("should initialize with provided config object", () => {
      const config = { someOption: true, anotherOption: "test" };
      const service = new BaseService(config);
      
      expect(service.config).toBe(config);
      expect(service.initialized).toBe(false);
    });
  });

  describe("initialize method", () => {
    it("should throw an error when called directly on base class", () => {
      expect(() => {
        baseService.initialize();
      }).toThrow("BaseService must implement initialize()");
    });
  });

  describe("_ensureNotInitialized method", () => {
    it("should not throw if service is not initialized", () => {
      expect(() => {
        baseService._ensureNotInitialized();
      }).not.toThrow();
    });

    it("should throw if service is already initialized", () => {
      baseService.initialized = true;
      
      expect(() => {
        baseService._ensureNotInitialized();
      }).toThrow("BaseService already initialized");
    });

    it("should work correctly after marking as initialized", () => {
      baseService._markInitialized();
      
      expect(() => {
        baseService._ensureNotInitialized();
      }).toThrow("BaseService already initialized");
    });
  });

  describe("_markInitialized method", () => {
    it("should mark the service as initialized", () => {
      expect(baseService.initialized).toBe(false);
      
      baseService._markInitialized();
      
      expect(baseService.initialized).toBe(true);
    });

    it("should change initialized state from false to true", () => {
      expect(baseService.initialized).toBe(false);
      
      baseService._markInitialized();
      
      expect(baseService.initialized).toBe(true);
    });

    it("should be callable multiple times (though not typical)", () => {
      baseService._markInitialized();
      expect(baseService.initialized).toBe(true);
      
      baseService._markInitialized();
      expect(baseService.initialized).toBe(true);
    });
  });

  describe("_ensureInitialized method", () => {
    it("should throw if service is not initialized", () => {
      expect(() => {
        baseService._ensureInitialized();
      }).toThrow("BaseService not initialized");
    });

    it("should not throw if service is initialized", () => {
      baseService._markInitialized();
      
      expect(() => {
        baseService._ensureInitialized();
      }).not.toThrow();
    });

    it("should work correctly after initialization", () => {
      baseService._markInitialized();
      
      expect(() => {
        baseService._ensureInitialized();
      }).not.toThrow();
    });
  });

  describe("_requireServiceRegistry method", () => {
    it("should return the service registry from config", () => {
      const mockRegistry = { register: jest.fn() };
      const config = { serviceRegistry: mockRegistry };
      const service = new BaseService(config);
      
      const registry = service._requireServiceRegistry();
      
      expect(registry).toBe(mockRegistry);
    });

    it("should throw an error if no service registry is provided in config", () => {
      const config = { serviceRegistry: undefined };
      const service = new BaseService(config);
      
      expect(() => {
        service._requireServiceRegistry();
      }).toThrow("ServiceRegistry required for BaseService");
    });

    it("should throw an error if service registry is null", () => {
      const config = { serviceRegistry: null };
      const service = new BaseService(config);
      
      expect(() => {
        service._requireServiceRegistry();
      }).toThrow("ServiceRegistry required for BaseService");
    });

    it("should throw an error if service registry is missing from config", () => {
      const config = {};
      const service = new BaseService(config);
      
      expect(() => {
        service._requireServiceRegistry();
      }).toThrow("ServiceRegistry required for BaseService");
    });
  });

  describe("_resolveNamespace method", () => {
    it("should return the namespace from config", () => {
      const mockNamespace = { helpers: {} };
      const config = { namespace: mockNamespace };
      const service = new BaseService(config);
      
      const namespace = service._resolveNamespace();
      
      expect(namespace).toBe(mockNamespace);
    });

    it("should throw an error if no namespace is provided in config", () => {
      const config = { namespace: undefined };
      const service = new BaseService(config);
      
      expect(() => {
        service._resolveNamespace();
      }).toThrow("Namespace required for BaseService");
    });

    it("should throw an error if namespace is null", () => {
      const config = { namespace: null };
      const service = new BaseService(config);
      
      expect(() => {
        service._resolveNamespace();
      }).toThrow("Namespace required for BaseService");
    });

    it("should throw an error if namespace is missing from config", () => {
      const config = {};
      const service = new BaseService(config);
      
      expect(() => {
        service._resolveNamespace();
      }).toThrow("Namespace required for BaseService");
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      const config = { serviceRegistry: {}, namespace: {} };
      const service = new BaseService(config);
      
      expect(service.config).toBe(config);
      expect(service.initialized).toBe(false);
      
      // Test before initialization
      expect(() => {
        service._ensureInitialized();
      }).toThrow("BaseService not initialized");
      
      // Mark as initialized
      service._markInitialized();
      
      expect(service.initialized).toBe(true);
      
      // Test after initialization
      expect(() => {
        service._ensureNotInitialized();
      }).toThrow("BaseService already initialized");
      
      // Verify service registry and namespace can be resolved
      expect(() => service._requireServiceRegistry()).not.toThrow();
      expect(() => service._resolveNamespace()).not.toThrow();
    });

    it("should handle different configuration scenarios", () => {
      // Test with full config
      const fullConfig = { serviceRegistry: { register: jest.fn() }, namespace: { helpers: {} } };
      const service1 = new BaseService(fullConfig);
      
      expect(service1.config).toBe(fullConfig);
      expect(service1._requireServiceRegistry()).toBe(fullConfig.serviceRegistry);
      expect(service1._resolveNamespace()).toBe(fullConfig.namespace);
      
      // Test with minimal config that still satisfies requirements
      const minimalConfig = { serviceRegistry: {}, namespace: {} };
      const service2 = new BaseService(minimalConfig);
      
      expect(service2.config).toBe(minimalConfig);
      expect(service2._requireServiceRegistry()).toBe(minimalConfig.serviceRegistry);
      expect(service2._resolveNamespace()).toBe(minimalConfig.namespace);
    });
  });
});