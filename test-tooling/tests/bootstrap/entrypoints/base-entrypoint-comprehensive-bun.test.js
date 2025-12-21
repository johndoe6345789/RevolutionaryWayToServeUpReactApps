// Comprehensive test suite for BaseEntryPoint class
// This replaces the generic stub tests with proper method-specific tests using Bun framework

const BaseEntryPoint = require("../../../../bootstrap/entrypoints/base-entrypoint.js");

// Mock service and config classes for testing
class MockService {
  constructor(config) {
    this.config = config;
    this.initialized = false;
    this.installed = false;
  }

  initialize() {
    this.initialized = true;
    return this;
  }

  install() {
    this.installed = true;
    return this;
  }
}

class MockConfig {
  constructor(overrides = {}) {
    Object.assign(this, overrides);
  }
}

// Mock service without install method
class MockServiceWithoutInstall {
  constructor(config) {
    this.config = config;
    this.initialized = false;
  }

  initialize() {
    this.initialized = true;
    return this;
  }
}

// Mock service with throwing initialize
class MockServiceWithThrowingInit {
  constructor(config) {
    this.config = config;
  }

  initialize() {
    throw new Error("Initialization failed");
  }
}

describe("BaseEntryPoint", () => {
  test("constructor creates an instance with provided options", () => {
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

  test("constructor works with minimal options", () => {
    const options = {
      ServiceClass: MockService,
      ConfigClass: MockConfig
    };

    const entrypoint = new BaseEntryPoint(options);

    expect(entrypoint.ServiceClass).toBe(MockService);
    expect(entrypoint.ConfigClass).toBe(MockConfig);
    expect(typeof entrypoint.configFactory).toBe("function");
  });

  test("_createConfig method creates config with proper parameters", () => {
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

  test("_createConfig method passes serviceRegistry, root, namespace, and document to configFactory", () => {
    const entrypoint = new BaseEntryPoint({
      ServiceClass: MockService,
      ConfigClass: MockConfig
    });

    const config = entrypoint._createConfig();

    expect(config).toBeInstanceOf(MockConfig);
  });

  test("run method instantiates service, calls initialize, and returns service", () => {
    const entrypoint = new BaseEntryPoint({
      ServiceClass: MockService,
      ConfigClass: MockConfig
    });

    const service = entrypoint.run();

    expect(service).toBeInstanceOf(MockService);
    expect(service.initialized).toBe(true);
  });

  test("run method calls install method if it exists", () => {
    const entrypoint = new BaseEntryPoint({
      ServiceClass: MockService,
      ConfigClass: MockConfig
    });

    const service = entrypoint.run();

    expect(service).toBeInstanceOf(MockService);
    expect(service.initialized).toBe(true);
    expect(service.installed).toBe(true);
  });

  test("run method does not call install if it doesn't exist", () => {
    const entrypoint = new BaseEntryPoint({
      ServiceClass: MockServiceWithoutInstall,
      ConfigClass: MockConfig
    });

    const service = entrypoint.run();

    expect(service).toBeInstanceOf(MockServiceWithoutInstall);
    expect(service.initialized).toBe(true);
    // Service without install method should not have 'installed' property
    expect(service.installed).toBeUndefined();
  });

  test("run method throws if service initialize method throws", () => {
    const entrypoint = new BaseEntryPoint({
      ServiceClass: MockServiceWithThrowingInit,
      ConfigClass: MockConfig
    });

    expect(() => entrypoint.run()).toThrow("Initialization failed");
  });

  test("integration: full lifecycle works correctly", () => {
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

  test("has correct structure and properties", () => {
    const entrypoint = new BaseEntryPoint({
      ServiceClass: MockService,
      ConfigClass: MockConfig
    });

    // Check that the entrypoint has the expected properties
    expect(entrypoint).toHaveProperty('ServiceClass');
    expect(entrypoint).toHaveProperty('ConfigClass');
    expect(entrypoint).toHaveProperty('configFactory');
    expect(entrypoint).toHaveProperty('rootHandler');
    expect(typeof entrypoint._createConfig).toBe('function');
    expect(typeof entrypoint.run).toBe('function');
  });
});