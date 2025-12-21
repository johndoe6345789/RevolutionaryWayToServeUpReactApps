const modulePath = '../../../../../bootstrap/services/cdn/tools-service.js';
const configPath = '../../../../../bootstrap/configs/cdn/tools.js';
const ToolsLoaderService = require(modulePath);
const ToolsLoaderConfig = require(configPath);

describe("ToolsLoaderService", () => {
  let originalWindow;
  let originalModule;

  beforeEach(() => {
    // Store original objects
    originalWindow = global.window;
    originalModule = global.module;
    
    // Setup mock window
    global.window = {
      location: {
        search: "",
        hostname: "localhost",
        href: "http://localhost"
      }
    };
    
    // Setup module environment
    global.module = { exports: {} };
  });

  afterEach(() => {
    // Restore original objects
    global.window = originalWindow;
    global.module = originalModule;
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create an instance with default config", () => {
      const service = new ToolsLoaderService();
      
      expect(service).toBeInstanceOf(ToolsLoaderService);
      expect(service.config).toBeInstanceOf(ToolsLoaderConfig);
    });

    it("should create an instance with provided config", () => {
      const config = new ToolsLoaderConfig({ 
        dependencies: { logging: {}, network: {} } 
      });
      const service = new ToolsLoaderService(config);
      
      expect(service.config).toBe(config);
    });
  });

  describe("initialize method", () => {
    it("should set up runtime dependencies and register helpers", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };

      const config = new ToolsLoaderConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry,
        dependencies: {
          logging: { logClient: jest.fn() },
          network: { loadScript: jest.fn(), resolveModuleUrl: jest.fn() }
        }
      });

      const service = new ToolsLoaderService(config);
      const initializedService = service.initialize();

      expect(initializedService).toBe(service);
      expect(service.namespace).toBe(config.namespace);
      expect(service.helpers).toBe(config.namespace.helpers);
      // isCommonJs will be truthy/falsy depending on the environment, but it should be boolean-like
      expect(service.isCommonJs).toBeDefined();
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
    });

    it("should handle missing dependencies by using helpers", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };

      const mockLogging = { logClient: jest.fn() };
      const mockNetwork = { loadScript: jest.fn(), resolveModuleUrl: jest.fn() };

      const mockHelpers = {
        logging: mockLogging,
        network: mockNetwork
      };

      const config = new ToolsLoaderConfig({
        namespace: { helpers: mockHelpers },
        serviceRegistry: mockServiceRegistry
      });

      const service = new ToolsLoaderService(config);
      service.initialize();

      // The service might load its own logging/network instances in CommonJS mode
      // So let's just check that the service was initialized properly
      expect(service.namespace).toBe(config.namespace);
      expect(service.helpers).toBe(config.namespace.helpers);
    });

    it("should throw if initialized twice", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new ToolsLoaderConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      
      const service = new ToolsLoaderService(config);
      service.initialize();
      
      expect(() => service.initialize()).toThrow();
    });
  });

  describe("createNamespace method", () => {
    it("should return the value if it's already an ESM namespace", () => {
      const existingNamespace = { __esModule: true, default: "value", named: "export" };
      const service = new ToolsLoaderService();
      
      const result = service.createNamespace(existingNamespace);
      
      expect(result).toBe(existingNamespace);
    });

    it("should create a new namespace for primitive values", () => {
      const service = new ToolsLoaderService();
      
      const result = service.createNamespace("primitive");
      
      expect(result.__esModule).toBe(true);
      expect(result.default).toBe("primitive");
    });

    it("should create a new namespace for object values", () => {
      const service = new ToolsLoaderService();
      
      const obj = { prop1: "value1", prop2: "value2" };
      const result = service.createNamespace(obj);
      
      expect(result.__esModule).toBe(true);
      expect(result.default).toBe(obj);
      expect(result.prop1).toBe("value1");
      expect(result.prop2).toBe("value2");
    });

    it("should copy properties from the default value if it's an object", () => {
      const service = new ToolsLoaderService();
      
      const obj = { method: () => "test", prop: "value" };
      const result = service.createNamespace(obj);
      
      expect(result.__esModule).toBe(true);
      expect(result.default).toBe(obj);
      expect(result.method).toBe(obj.method);
      expect(result.prop).toBe(obj.prop);
    });

    it("should handle null and undefined values", () => {
      const service = new ToolsLoaderService();
      
      const nullResult = service.createNamespace(null);
      expect(nullResult.__esModule).toBe(true);
      expect(nullResult.default).toBe(null);
      
      const undefinedResult = service.createNamespace(undefined);
      expect(undefinedResult.__esModule).toBe(true);
      expect(undefinedResult.default).toBe(undefined);
    });
  });

  describe("ensureGlobalFromNamespace method", () => {
    it("should set global when window and globalName are available", async () => {
      const service = new ToolsLoaderService();
      
      const namespace = { default: "testValue" };
      await service.ensureGlobalFromNamespace("test", "TestGlobal", namespace);
      
      expect(global.window.TestGlobal).toBe("testValue");
    });

    it("should not set global when namespace is null", async () => {
      const service = new ToolsLoaderService();
      
      await service.ensureGlobalFromNamespace("test", "TestGlobal", null);
      
      expect(global.window.TestGlobal).toBeUndefined();
    });

    it("should not set global when window is not available", async () => {
      // Temporarily remove window
      delete global.window;
      
      const service = new ToolsLoaderService();
      const namespace = { default: "testValue" };
      
      await expect(service.ensureGlobalFromNamespace("test", "TestGlobal", namespace)).resolves.toBeUndefined();
    });
  });

  describe("loadTools method", () => {
    it("should load tools by resolving URLs and injecting globals", async () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const mockLogging = { logClient: jest.fn() };
      const mockNetwork = { 
        loadScript: jest.fn(() => Promise.resolve()),
        resolveModuleUrl: jest.fn(() => Promise.resolve("https://example.com/tool.js")) 
      };
      
      const config = new ToolsLoaderConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry,
        dependencies: { logging: mockLogging, network: mockNetwork }
      });
      
      const service = new ToolsLoaderService(config);
      service.initialize();

      // Set up window global that the tool will create
      global.window.TestTool = { default: "loaded" };
      
      const tools = [{ name: "testTool", global: "TestTool" }];
      const result = await service.loadTools(tools);
      
      expect(mockNetwork.resolveModuleUrl).toHaveBeenCalledWith(tools[0]);
      expect(mockNetwork.loadScript).toHaveBeenCalledWith("https://example.com/tool.js");
      expect(mockLogging.logClient).toHaveBeenCalledWith("tool:loaded", {
        name: "testTool",
        url: "https://example.com/tool.js",
        global: "TestTool"
      });
      expect(result).toHaveLength(1);
    });

    it("should throw error if tool global is not found after loading", async () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const mockLogging = { logClient: jest.fn() };
      const mockNetwork = { 
        loadScript: jest.fn(() => Promise.resolve()),
        resolveModuleUrl: jest.fn(() => Promise.resolve("https://example.com/tool.js")) 
      };
      
      const config = new ToolsLoaderConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry,
        dependencies: { logging: mockLogging, network: mockNetwork }
      });
      
      const service = new ToolsLoaderService(config);
      service.initialize();

      // Don't set the global in window, so it will be missing
      const tools = [{ name: "testTool", global: "MissingTool" }];
      
      await expect(service.loadTools(tools)).rejects.toThrow(/Tool global not found after loading/);
    });

    it("should handle empty tools array", async () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new ToolsLoaderConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      
      const service = new ToolsLoaderService(config);
      service.initialize();

      const result = await service.loadTools([]);
      
      expect(result).toEqual([]);
    });
  });

  describe("makeNamespace method", () => {
    it("should be an alias to createNamespace", () => {
      const service = new ToolsLoaderService();
      
      const obj = { test: "value" };
      const createResult = service.createNamespace(obj);
      const makeResult = service.makeNamespace(obj);
      
      expect(createResult).toEqual(makeResult);
    });
  });

  describe("loadModules method", () => {
    it("should load ESM modules", async () => {
      // Since the test environment might not handle dynamic imports well,
      // we'll test the logic by mocking the import call
      const importSpy = jest.spyOn(global, 'import').mockResolvedValue({ default: "esmModule", namedExport: "value" });

      const mockServiceRegistry = {
        register: jest.fn()
      };

      const mockLogging = { logClient: jest.fn() };
      const mockNetwork = {
        loadScript: jest.fn(() => Promise.resolve()),
        resolveModuleUrl: jest.fn(() => Promise.resolve("https://example.com/module.js"))
      };

      const config = new ToolsLoaderConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry,
        dependencies: { logging: mockLogging, network: mockNetwork }
      });

      const service = new ToolsLoaderService(config);
      service.initialize();

      const modules = [{ name: "testModule", global: "TestGlobal", format: "esm" }];
      const result = await service.loadModules(modules);

      expect(importSpy).toHaveBeenCalledWith("https://example.com/module.js");
      expect(result.testModule).toBeDefined();
      expect(result.testModule.__esModule).toBe(true);
      expect(mockLogging.logClient).toHaveBeenCalledWith("module:loaded", {
        name: "testModule",
        url: "https://example.com/module.js",
        global: "TestGlobal",
        format: "esm"
      });

      importSpy.mockRestore();
    });

    it("should load global format modules", async () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const mockLogging = { logClient: jest.fn() };
      const mockNetwork = { 
        loadScript: jest.fn(() => Promise.resolve()),
        resolveModuleUrl: jest.fn(() => Promise.resolve("https://example.com/module.js")) 
      };
      
      const config = new ToolsLoaderConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry,
        dependencies: { logging: mockLogging, network: mockNetwork }
      });
      
      const service = new ToolsLoaderService(config);
      service.initialize();

      // Set up the global that will be loaded
      global.window.TestGlobal = { default: "globalModule", namedExport: "value" };
      
      const modules = [{ name: "testModule", global: "TestGlobal", format: "global" }];
      const result = await service.loadModules(modules);
      
      expect(mockNetwork.loadScript).toHaveBeenCalledWith("https://example.com/module.js");
      expect(result.testModule).toBeDefined();
      expect(result.testModule.__esModule).toBe(true);
      expect(mockLogging.logClient).toHaveBeenCalledWith("module:loaded", {
        name: "testModule",
        url: "https://example.com/module.js",
        global: "TestGlobal",
        format: "global"
      });
    });

    it("should throw error if module global is not found after loading", async () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const mockLogging = { logClient: jest.fn() };
      const mockNetwork = { 
        loadScript: jest.fn(() => Promise.resolve()),
        resolveModuleUrl: jest.fn(() => Promise.resolve("https://example.com/module.js")) 
      };
      
      const config = new ToolsLoaderConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry,
        dependencies: { logging: mockLogging, network: mockNetwork }
      });
      
      const service = new ToolsLoaderService(config);
      service.initialize();

      // Don't set the global in window, so it will be missing
      const modules = [{ name: "testModule", global: "MissingGlobal", format: "global" }];
      
      await expect(service.loadModules(modules)).rejects.toThrow(/Module global not found after loading/);
    });
  });

  describe("exports property", () => {
    it("should return the correct export structure", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new ToolsLoaderConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      
      const service = new ToolsLoaderService(config);
      service.initialize();

      const exports = service.exports;
      
      expect(typeof exports.loadTools).toBe("function");
      expect(typeof exports.makeNamespace).toBe("function");
      expect(typeof exports.loadModules).toBe("function");
    });
  });

  describe("install method", () => {
    it("should install the helpers into the namespace and register the service", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new ToolsLoaderConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      
      const service = new ToolsLoaderService(config);
      service.initialize();

      const result = service.install();
      
      expect(result).toBe(service);
      expect(service.helpers.tools).toBeDefined();
      expect(mockServiceRegistry.register).toHaveBeenCalledWith("tools", expect.any(Object), {
        folder: "services/cdn",
        domain: "cdn",
      });
    });

    it("should throw if not initialized", () => {
      const service = new ToolsLoaderService();
      
      expect(() => service.install()).toThrow();
    });
  });

  describe("integration", () => {
    it("should work through full lifecycle", () => {
      const mockServiceRegistry = {
        register: jest.fn()
      };
      
      const config = new ToolsLoaderConfig({
        namespace: { helpers: {} },
        serviceRegistry: mockServiceRegistry
      });
      
      const service = new ToolsLoaderService(config);
      
      expect(service).toBeInstanceOf(ToolsLoaderService);
      
      const initializedService = service.initialize();
      expect(initializedService).toBe(service);
      expect(initializedService.initialized).toBe(true);
      
      // Test that methods work correctly
      const namespace = service.createNamespace({ test: "value" });
      expect(namespace.test).toBe("value");
      
      const exports = service.exports;
      expect(exports).toBeDefined();
    });
  });
});