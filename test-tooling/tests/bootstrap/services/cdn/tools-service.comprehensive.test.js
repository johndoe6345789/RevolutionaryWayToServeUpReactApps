// Comprehensive test suite for ToolsLoaderService class
const ToolsLoaderService = require("../../../../../bootstrap/services/cdn/tools-service.js");

// Simple mock function implementation for Bun
function createMockFunction() {
  const mockFn = (...args) => {
    mockFn.calls.push(args);
    return mockFn.returnValue;
  };
  mockFn.calls = [];
  mockFn.returnValue = undefined;
  mockFn.mockReturnValue = (value) => {
    mockFn.returnValue = value;
    return mockFn;
  };
  mockFn.mockResolvedValue = (value) => {
    mockFn.returnValue = Promise.resolve(value);
    return mockFn;
  };
  return mockFn;
}

describe("ToolsLoaderService", () => {
  let service;
  let mockConfig;
  let mockServiceRegistry;
  let mockLogging;
  let mockNetwork;
  let mockWindow;

  beforeEach(() => {
    // Store original window
    mockWindow = global.window;
    
    // Setup mocks
    mockServiceRegistry = {
      register: createMockFunction()
    };
    
    mockLogging = {
      logClient: createMockFunction()
    };
    
    mockNetwork = {
      loadScript: createMockFunction().mockResolvedValue(Promise.resolve()),
      resolveModuleUrl: createMockFunction().mockResolvedValue("https://example.com/tool.js")
    };

    mockConfig = {
      dependencies: {
        logging: mockLogging,
        network: mockNetwork
      },
      serviceRegistry: mockServiceRegistry,
      namespace: { helpers: {} }
    };

    service = new ToolsLoaderService(mockConfig);
  });

  afterEach(() => {
    // Restore original window
    global.window = mockWindow;
  });

  describe("constructor", () => {
    test("should create an instance with provided config", () => {
      expect(service).toBeInstanceOf(ToolsLoaderService);
      expect(service.config).toBe(mockConfig);
    });

    test("should create an instance with default config when none provided", () => {
      const serviceWithDefault = new ToolsLoaderService();
      expect(serviceWithDefault).toBeInstanceOf(ToolsLoaderService);
      expect(serviceWithDefault.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    test("should properly initialize the service with required dependencies", () => {
      const result = service.initialize();

      expect(result).toBe(service);
      expect(service.initialized).toBe(true);
      expect(service.namespace).toBe(mockConfig.namespace);
      expect(service.helpers).toBe(mockConfig.namespace.helpers);
      expect(typeof service.isCommonJs).toBe("boolean");
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.logging).toBe(mockLogging);
      expect(service.network).toBe(mockNetwork);
      expect(service.logClient).toBe(mockLogging.logClient);
      expect(service.loadScript).toBe(mockNetwork.loadScript);
      expect(service.resolveModuleUrl).toBe(mockNetwork.resolveModuleUrl);
    });

    test("should set up dependencies when not provided in config", () => {
      const configWithoutDeps = {
        serviceRegistry: mockServiceRegistry,
        namespace: { helpers: {} }
      };
      const serviceWithoutDeps = new ToolsLoaderService(configWithoutDeps);
      
      // Mock require for when isCommonJs is true
      const originalModule = typeof module;
      global.module = { exports: {} };
      
      const result = serviceWithoutDeps.initialize();
      
      expect(result).toBe(serviceWithoutDeps);
      expect(serviceWithoutDeps.initialized).toBe(true);
      
      // Restore
      if (originalModule === 'undefined') {
        delete global.module;
      } else {
        global.module = originalModule;
      }
    });

    test("should throw if initialized twice", () => {
      service.initialize();

      expect(() => {
        service.initialize();
      }).toThrow();
    });
  });

  describe("createNamespace method", () => {
    test("should return ESM namespace object as-is if it has __esModule", () => {
      const esmNamespace = { __esModule: true, foo: "bar" };
      service.initialize();
      
      const result = service.createNamespace(esmNamespace);
      
      expect(result).toBe(esmNamespace);
    });

    test("should create a new namespace for primitive values", () => {
      service.initialize();
      
      const result = service.createNamespace("primitive-value");
      
      expect(result.__esModule).toBe(true);
      expect(result.default).toBe("primitive-value");
    });

    test("should create a new namespace for object values", () => {
      service.initialize();
      
      const obj = { prop1: "value1", prop2: "value2" };
      const result = service.createNamespace(obj);
      
      expect(result.__esModule).toBe(true);
      expect(result.default).toBe(obj);
      expect(result.prop1).toBe("value1");
      expect(result.prop2).toBe("value2");
    });

    test("should copy properties from the default value if it's an object", () => {
      service.initialize();
      
      const obj = { a: 1, b: 2 };
      const result = service.createNamespace(obj);
      
      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
    });

    test("should handle null and undefined values", () => {
      service.initialize();
      
      const nullResult = service.createNamespace(null);
      expect(nullResult.__esModule).toBe(true);
      expect(nullResult.default).toBe(null);
      
      const undefinedResult = service.createNamespace(undefined);
      expect(undefinedResult.__esModule).toBe(true);
      expect(undefinedResult.default).toBe(undefined);
    });
  });

  describe("ensureGlobalFromNamespace method", () => {
    test("should set global when window and globalName are available", () => {
      global.window = { TestGlobal: null };
      
      service.initialize();
      
      const namespace = { default: "test-value" };
      service.ensureGlobalFromNamespace("test", "TestGlobal", namespace);
      
      expect(global.window.TestGlobal).toBe("test-value");
    });

    test("should not set global when namespace is null", () => {
      global.window = { TestGlobal: "existing" };
      
      service.initialize();
      
      service.ensureGlobalFromNamespace("test", "TestGlobal", null);
      
      expect(global.window.TestGlobal).toBe("existing");
    });

    test("should not set global when window is not available", () => {
      global.window = undefined;
      
      service.initialize();
      
      const namespace = { default: "test-value" };
      service.ensureGlobalFromNamespace("test", "TestGlobal", namespace);
      
      // Should not throw or modify anything
      expect(global.window).toBeUndefined();
    });
  });

  describe("loadTools method", () => {
    test("should load tools by resolving URLs and injecting globals", async () => {
      global.window = { "SomeTool": { someMethod: () => {} } };
      
      const mockResolveModuleUrl = createMockFunction().mockResolvedValue("https://example.com/sometool.js");
      const mockLoadScript = createMockFunction().mockResolvedValue(Promise.resolve());
      const mockLogClient = createMockFunction();
      
      service.initialize();
      service.resolveModuleUrl = mockResolveModuleUrl;
      service.loadScript = mockLoadScript;
      service.logClient = mockLogClient;
      
      const tools = [
        { name: "someTool", global: "SomeTool" }
      ];
      
      await service.loadTools(tools);
      
      expect(mockResolveModuleUrl).toHaveBeenCalledWith({ name: "someTool", global: "SomeTool" });
      expect(mockLoadScript).toHaveBeenCalledWith("https://example.com/sometool.js");
      expect(mockLogClient).toHaveBeenCalledWith("tool:loaded", {
        name: "someTool",
        url: "https://example.com/sometool.js",
        global: "SomeTool"
      });
    });

    test("should throw error if tool global is not found after loading", async () => {
      global.window = {}; // No tool global
      
      const mockResolveModuleUrl = createMockFunction().mockResolvedValue("https://example.com/sometool.js");
      const mockLoadScript = createMockFunction().mockResolvedValue(Promise.resolve());
      
      service.initialize();
      service.resolveModuleUrl = mockResolveModuleUrl;
      service.loadScript = mockLoadScript;
      
      const tools = [
        { name: "missingTool", global: "MissingTool" }
      ];
      
      await expect(service.loadTools(tools)).rejects.toThrow(
        "Tool global not found after loading https://example.com/sometool.js: MissingTool"
      );
    });

    test("should handle empty tools array", async () => {
      service.initialize();
      
      const result = await service.loadTools([]);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("makeNamespace method", () => {
    test("should be an alias to createNamespace", () => {
      service.initialize();
      
      const obj = { test: "value" };
      const createResult = service.createNamespace(obj);
      const makeResult = service.makeNamespace(obj);
      
      expect(createResult).toEqual(makeResult);
    });
  });

  describe("loadModules method", () => {
    test("should load ESM modules", async () => {
      global.window = { "ESMGlobal": {} };
      
      const mockResolveModuleUrl = createMockFunction().mockResolvedValue("https://example.com/esm-module.js");
      const mockLoadScript = createMockFunction().mockResolvedValue(Promise.resolve());
      
      service.initialize();
      service.resolveModuleUrl = mockResolveModuleUrl;
      service.loadScript = mockLoadScript;
      
      const modules = [
        { name: "testModule", global: "ESMGlobal", format: "esm" }
      ];
      
      // Mock import function for ESM loading
      const originalImport = global.import;
      global.import = createMockFunction().mockResolvedValue({ default: "esm-value", named: "export" });
      
      const result = await service.loadModules(modules);
      
      expect(result).toHaveProperty("testModule");
      expect(result.testModule).toBeDefined();
      expect(result.testModule.__esModule).toBe(true);
      
      // Restore
      global.import = originalImport;
    });

    test("should load global format modules", async () => {
      global.window = { "GlobalModule": { method: () => {} } };
      
      const mockResolveModuleUrl = createMockFunction().mockResolvedValue("https://example.com/global-module.js");
      const mockLoadScript = createMockFunction().mockResolvedValue(Promise.resolve());
      const mockLogClient = createMockFunction();
      
      service.initialize();
      service.resolveModuleUrl = mockResolveModuleUrl;
      service.loadScript = mockLoadScript;
      service.logClient = mockLogClient;
      
      const modules = [
        { name: "globalModule", global: "GlobalModule", format: "global" }
      ];
      
      const result = await service.loadModules(modules);
      
      expect(result).toHaveProperty("globalModule");
      expect(result.globalModule).toBeDefined();
      expect(result.globalModule.__esModule).toBe(true);
    });

    test("should throw error if module global is not found after loading", async () => {
      global.window = {}; // No module global
      
      const mockResolveModuleUrl = createMockFunction().mockResolvedValue("https://example.com/module.js");
      const mockLoadScript = createMockFunction().mockResolvedValue(Promise.resolve());
      
      service.initialize();
      service.resolveModuleUrl = mockResolveModuleUrl;
      service.loadScript = mockLoadScript;
      
      const modules = [
        { name: "missingModule", global: "MissingGlobal", format: "global" }
      ];
      
      await expect(service.loadModules(modules)).rejects.toThrow(
        "Module global not found after loading https://example.com/module.js: MissingGlobal"
      );
    });
  });

  describe("exports property", () => {
    test("should return the correct export structure", () => {
      service.initialize();
      
      const exports = service.exports;
      
      expect(exports).toHaveProperty("loadTools");
      expect(exports).toHaveProperty("makeNamespace");
      expect(exports).toHaveProperty("loadModules");
      expect(typeof exports.loadTools).toBe("function");
      expect(typeof exports.makeNamespace).toBe("function");
      expect(typeof exports.loadModules).toBe("function");
    });

    test("should bind methods to the service instance", () => {
      service.initialize();
      
      const exports = service.exports;
      
      // Verify that the methods are bound to the service
      expect(exports.loadTools).not.toBe(service.loadTools);
      expect(exports.makeNamespace).not.toBe(service.makeNamespace);
      expect(exports.loadModules).not.toBe(service.loadModules);
    });
  });

  describe("install method", () => {
    test("should install the helpers into the namespace and register the service", () => {
      service.initialize();
      
      const result = service.install();
      
      expect(result).toBe(service);
      expect(service.helpers.tools).toBeDefined();
      expect(mockServiceRegistry.register).toHaveBeenCalledWith(
        "tools",
        service.exports,
        {
          folder: "services/cdn",
          domain: "cdn",
        },
        ["logging"]
      );
    });

    test("should throw if not initialized before install", () => {
      const uninitializedService = new ToolsLoaderService(mockConfig);
      
      expect(() => {
        uninitializedService.install();
      }).toThrow();
    });

    test("should return the service instance for chaining", () => {
      service.initialize();
      
      const result = service.install();
      
      expect(result).toBe(service);
    });
  });

  describe("integration", () => {
    test("should work through full lifecycle", async () => {
      service.initialize();
      
      // Test that the service can load tools
      global.window = { "TestTool": {} };
      const tools = [{ name: "testTool", global: "TestTool" }];
      
      // Mock the loading methods
      service.resolveModuleUrl = createMockFunction().mockResolvedValue("https://example.com/tool.js");
      service.loadScript = createMockFunction().mockResolvedValue(Promise.resolve());
      service.logClient = createMockFunction();
      
      await service.loadTools(tools);
      
      // Test that exports work
      const exports = service.exports;
      expect(exports.loadTools).toBeDefined();
      expect(exports.makeNamespace).toBeDefined();
      expect(exports.loadModules).toBeDefined();
      
      // Test that install works
      service.install();
      expect(service.helpers.tools).toBe(exports);
    });
  });
});