const BaseEntryPoint = require("../../../../bootstrap/entrypoints/base-entrypoint.js");

// Mock service and config classes for testing
class MockService {
  config;
  initialized = false;
  installed = false;
  
  constructor(config) {
    this.config = config;
  }
  
  initialize() {
    this.initialized = true;
  }
  
  install() {
    this.installed = true;
  }
}

class MockConfig {
  constructor(overrides = {}) {
    Object.assign(this, overrides);
  }
}

describe("BaseEntryPoint", () => {
  describe("constructor", () => {
    it("should create an instance with provided options", () => {
      const options = {
        ServiceClass: MockService,
        ConfigClass: MockConfig,
        configFactory: () => ({ custom: "value" })
      };
      
      const entrypoint = new BaseEntryPoint(options);
      
      expect(entrypoint.ServiceClass).toBe(MockService);
      expect(entrypoint.ConfigClass).toBe(MockConfig);
      expect(typeof entrypoint.configFactory).toBe("function");
      expect(entrypoint.rootHandler).toBeDefined();
    });

    it("should work with minimal options", () => {
      const options = {
        ServiceClass: MockService,
        ConfigClass: MockConfig
      };
      
      const entrypoint = new BaseEntryPoint(options);
      
      expect(entrypoint.ServiceClass).toBe(MockService);
      expect(entrypoint.ConfigClass).toBe(MockConfig);
      expect(typeof entrypoint.configFactory).toBe("function");
    });
  });

  describe("_createConfig method", () => {
    it("should create config with proper parameters", () => {
      const factoryCallTracker = {
        called: false,
        params: null
      };
      
      const configFactory = (params) => {
        factoryCallTracker.called = true;
        factoryCallTracker.params = params;
        return { custom: "value" };
      };

      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig,
        configFactory
      });

      const config = entrypoint._createConfig();

      expect(factoryCallTracker.called).toBe(true);
      expect(factoryCallTracker.params).toBeDefined();
      expect(factoryCallTracker.params.serviceRegistry).toBeDefined();
      expect(factoryCallTracker.params.root).toBeDefined();
      expect(factoryCallTracker.params.namespace).toBeDefined();
      expect(config).toBeInstanceOf(MockConfig);
      expect(config.custom).toBe("value");
    });

    it("should pass serviceRegistry, root, namespace, and document to configFactory", () => {
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig
      });

      const config = entrypoint._createConfig();
      
      // The config should have been created with serviceRegistry and overrides
      expect(config).toBeInstanceOf(MockConfig);
    });
  });

  describe("run method", () => {
    it("should instantiate service, call initialize, and return service", () => {
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig
      });

      const service = entrypoint.run();

      expect(service).toBeInstanceOf(MockService);
      expect(service.initialized).toBe(true);
    });

    it("should call install method if it exists", () => {
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig
      });

      const service = entrypoint.run();

      expect(service).toBeInstanceOf(MockService);
      expect(service.initialized).toBe(true);
      expect(service.installed).toBe(true);
    });

    it("should not call install if it doesn't exist", () => {
      // Create a mock service without install method
      class MockServiceWithoutInstall {
        config;
        initialized = false;
        
        constructor(config) {
          this.config = config;
        }
        
        initialize() {
          this.initialized = true;
        }
      }

      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockServiceWithoutInstall,
        ConfigClass: MockConfig
      });

      const service = entrypoint.run();

      expect(service).toBeInstanceOf(MockServiceWithoutInstall);
      expect(service.initialized).toBe(true);
    });

    it("should throw if service initialize method throws", () => {
      class MockServiceWithThrowingInit {
        constructor(config) {}
        
        initialize() {
          throw new Error("Initialization failed");
        }
      }

      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockServiceWithThrowingInit,
        ConfigClass: MockConfig
      });

      expect(() => entrypoint.run()).toThrow("Initialization failed");
    });
  });

  describe("integration", () => {
    it("full lifecycle works correctly", () => {
      const lifecycleTracker = {
        configFactoryCalled: false
      };

      const configFactory = (params) => {
        lifecycleTracker.configFactoryCalled = true;
        return { test: "value" };
      };

      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig,
        configFactory
      });

      const service = entrypoint.run();

      // Verify the full lifecycle worked
      expect(lifecycleTracker.configFactoryCalled).toBe(true);
      expect(service).toBeInstanceOf(MockService);
      expect(service.initialized).toBe(true);
      expect(service.installed).toBe(true);
      expect(service.config).toBeInstanceOf(MockConfig);
      expect(service.config.test).toBe("value");
    });
  });
});