const BaseEntryPoint = require("../../../../bootstrap/entrypoints/base-entrypoint.js");
const ServiceRegistry = require("../../../../bootstrap/services/service-registry.js");
const EntrypointRegistry = require("../../../../bootstrap/registries/entrypoint-registry.js");
const GlobalRootHandler = require("../../../../bootstrap/constants/global-root-handler.js");

// Mock service for testing
class MockService {
  constructor(config) {
    this.config = config;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) {
      throw new Error("Already initialized");
    }
    this.initialized = true;
    return this;
  }

  install() {
    this.installed = true;
    return this;
  }
}

// Mock config class for testing
class MockConfig {
  constructor(options = {}) {
    this.serviceRegistry = options.serviceRegistry;
    this.entrypointRegistry = options.entrypointRegistry;
    this.overrides = options.overrides || {};
    Object.assign(this, options.overrides);
  }
}

describe("BaseEntryPoint", () => {
  describe("constructor", () => {
    test("should initialize with ServiceClass, ConfigClass, and configFactory", () => {
      const configFactory = () => ({ test: "value" });
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig,
        configFactory
      });

      expect(entrypoint.ServiceClass).toBe(MockService);
      expect(entrypoint.ConfigClass).toBe(MockConfig);
      expect(entrypoint.configFactory).toBe(configFactory);
      expect(entrypoint.rootHandler).toBeInstanceOf(GlobalRootHandler);
    });

    test("should use default configFactory when not provided", () => {
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig
      });

      expect(entrypoint.configFactory).toBeInstanceOf(Function);
      expect(entrypoint.configFactory()).toEqual({});
    });

    test("should handle minimal configuration", () => {
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig
      });

      expect(entrypoint.ServiceClass).toBe(MockService);
      expect(entrypoint.ConfigClass).toBe(MockConfig);
    });
  });

  describe("_createConfig method", () => {
    test("should create config with proper parameters", () => {
      const mockServiceRegistry = new ServiceRegistry();
      const mockEntrypointRegistry = new EntrypointRegistry();
      const mockRootHandler = new GlobalRootHandler();
      const configFactory = jest.fn().mockReturnValue({ custom: "value" });

      // Mock the required modules
      jest.mock("../../../../bootstrap/services/service-registry-instance.js", () => mockServiceRegistry, { virtual: true });
      jest.mock("../../../../bootstrap/registries/entrypoint-registry-instance.js", () => mockEntrypointRegistry, { virtual: true });
      jest.mock("../../../../bootstrap/constants/global-root-handler.js", () => {
        return jest.fn().mockImplementation(() => mockRootHandler);
      }, { virtual: true });

      // Reload modules to get the mocks
      jest.resetModules();
      const BaseEntryPointFresh = require("../../../../bootstrap/entrypoints/base-entrypoint.js");

      const entrypoint = new BaseEntryPointFresh({
        ServiceClass: MockService,
        ConfigClass: MockConfig,
        configFactory
      });

      const config = entrypoint._createConfig();

      expect(config.serviceRegistry).toBe(mockServiceRegistry);
      expect(config.entrypointRegistry).toBe(mockEntrypointRegistry);
      expect(config.custom).toBe("value");
    });

    test("should use empty overrides object when factory returns empty object", () => {
      const mockServiceRegistry = new ServiceRegistry();
      const mockEntrypointRegistry = new EntrypointRegistry();
      const mockRootHandler = new GlobalRootHandler();
      const configFactory = jest.fn().mockReturnValue({});

      // Mock the required modules
      jest.mock("../../../../bootstrap/services/service-registry-instance.js", () => mockServiceRegistry, { virtual: true });
      jest.mock("../../../../bootstrap/registries/entrypoint-registry-instance.js", () => mockEntrypointRegistry, { virtual: true });
      jest.mock("../../../../bootstrap/constants/global-root-handler.js", () => {
        return jest.fn().mockImplementation(() => mockRootHandler);
      }, { virtual: true });

      // Reload modules to get the mocks
      jest.resetModules();
      const BaseEntryPointFresh = require("../../../../bootstrap/entrypoints/base-entrypoint.js");

      const entrypoint = new BaseEntryPointFresh({
        ServiceClass: MockService,
        ConfigClass: MockConfig,
        configFactory
      });

      const config = entrypoint._createConfig();

      expect(config.serviceRegistry).toBe(mockServiceRegistry);
      expect(config.entrypointRegistry).toBe(mockEntrypointRegistry);
      expect(config.overrides).toEqual({});
    });

    test("should merge overrides with default properties", () => {
      const mockServiceRegistry = new ServiceRegistry();
      const mockEntrypointRegistry = new EntrypointRegistry();
      const mockRootHandler = new GlobalRootHandler();
      const configFactory = jest.fn().mockReturnValue({ customProp: "value", serviceRegistry: "override" });

      // Mock the required modules
      jest.mock("../../../../bootstrap/services/service-registry-instance.js", () => mockServiceRegistry, { virtual: true });
      jest.mock("../../../../bootstrap/registries/entrypoint-registry-instance.js", () => mockEntrypointRegistry, { virtual: true });
      jest.mock("../../../../bootstrap/constants/global-root-handler.js", () => {
        return jest.fn().mockImplementation(() => mockRootHandler);
      }, { virtual: true });

      // Reload modules to get the mocks
      jest.resetModules();
      const BaseEntryPointFresh = require("../../../../bootstrap/entrypoints/base-entrypoint.js");

      const entrypoint = new BaseEntryPointFresh({
        ServiceClass: MockService,
        ConfigClass: MockConfig,
        configFactory
      });

      const config = entrypoint._createConfig();

      expect(config.serviceRegistry).toBe(mockServiceRegistry); // Should use the actual service registry, not the override
      expect(config.entrypointRegistry).toBe(mockEntrypointRegistry);
      expect(config.customProp).toBe("value");
    });
  });

  describe("run method", () => {
    test("should instantiate service, call initialize, and return service", () => {
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig,
        configFactory: () => ({})
      });

      // Mock the _createConfig method to return a known config
      const mockConfig = new MockConfig({ serviceRegistry: new ServiceRegistry() });
      entrypoint._createConfig = jest.fn().mockReturnValue(mockConfig);

      const result = entrypoint.run();

      expect(result).toBeInstanceOf(MockService);
      expect(result.config).toBe(mockConfig);
      expect(result.initialized).toBe(true);
    });

    test("should call install method if it exists on service", () => {
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig,
        configFactory: () => ({})
      });

      const mockConfig = new MockConfig({ serviceRegistry: new ServiceRegistry() });
      entrypoint._createConfig = jest.fn().mockReturnValue(mockConfig);

      const result = entrypoint.run();

      expect(result.installed).toBe(true);
    });

    test("should not call install method if it does not exist on service", () => {
      // Create a service without install method
      class ServiceWithoutInstall {
        constructor(config) {
          this.config = config;
          this.initialized = false;
        }

        initialize() {
          this.initialized = true;
          return this;
        }
      }

      const entrypoint = new BaseEntryPoint({
        ServiceClass: ServiceWithoutInstall,
        ConfigClass: MockConfig,
        configFactory: () => ({})
      });

      const mockConfig = new MockConfig({ serviceRegistry: new ServiceRegistry() });
      entrypoint._createConfig = jest.fn().mockReturnValue(mockConfig);

      const result = entrypoint.run();

      expect(result).toBeInstanceOf(ServiceWithoutInstall);
      expect(result.config).toBe(mockConfig);
      expect(result.initialized).toBe(true);
      expect(result.installed).toBeUndefined(); // Should not have installed property
    });

    test("should throw error if service initialize method fails", () => {
      class ServiceWithFailingInit {
        constructor(config) {
          this.config = config;
        }

        initialize() {
          throw new Error("Initialization failed");
        }
      }

      const entrypoint = new BaseEntryPoint({
        ServiceClass: ServiceWithFailingInit,
        ConfigClass: MockConfig,
        configFactory: () => ({})
      });

      const mockConfig = new MockConfig({ serviceRegistry: new ServiceRegistry() });
      entrypoint._createConfig = jest.fn().mockReturnValue(mockConfig);

      expect(() => entrypoint.run()).toThrow("Initialization failed");
    });
  });

  describe("integration", () => {
    test("should work with a real service and config", () => {
      const entrypoint = new BaseEntryPoint({
        ServiceClass: MockService,
        ConfigClass: MockConfig,
        configFactory: ({ serviceRegistry, entrypointRegistry }) => ({
          serviceRegistry,
          entrypointRegistry,
          customOption: "test"
        })
      });

      const result = entrypoint.run();

      expect(result).toBeInstanceOf(MockService);
      expect(result.config).toBeInstanceOf(MockConfig);
      expect(result.config.customOption).toBe("test");
      expect(result.initialized).toBe(true);
      expect(result.installed).toBe(true);
    });

    test("should work with service that only has initialize method", () => {
      class MinimalService {
        constructor(config) {
          this.config = config;
          this.initialized = false;
        }

        initialize() {
          this.initialized = true;
          return this;
        }
      }

      const entrypoint = new BaseEntryPoint({
        ServiceClass: MinimalService,
        ConfigClass: MockConfig,
        configFactory: () => ({})
      });

      const mockConfig = new MockConfig({ serviceRegistry: new ServiceRegistry() });
      entrypoint._createConfig = jest.fn().mockReturnValue(mockConfig);

      const result = entrypoint.run();

      expect(result).toBeInstanceOf(MinimalService);
      expect(result.initialized).toBe(true);
    });
  });
});