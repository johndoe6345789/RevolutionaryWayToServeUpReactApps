import ToolsLoaderService from "../../../../../bootstrap/services/cdn/tools-service.js";
import ToolsLoaderConfig from "../../../../../bootstrap/configs/cdn/tools.js";

// Mock service registry for testing
class MockServiceRegistry {
  constructor() {
    this.registeredServices = new Map();
  }
  
  register(name, service, metadata) {
    this.registeredServices.set(name, { service, metadata });
  }
  
  getService(name) {
    const entry = this.registeredServices.get(name);
    return entry ? entry.service : null;
  }
}

// Mock network dependencies
const mockNetwork = {
  loadScript: jest.fn().mockResolvedValue(),
  resolveModuleUrl: jest.fn().mockResolvedValue('http://example.com/test.js')
};

// Mock logging dependencies
const mockLogging = {
  logClient: jest.fn()
};

// Mock window for testing
const mockWindow = {
  existingGlobal: { test: 'value' }
};

describe("ToolsLoaderService", () => {
  let toolsLoaderService;
  let mockServiceRegistry;
  let mockNamespace;

  beforeEach(() => {
    mockServiceRegistry = new MockServiceRegistry();
    mockNamespace = { helpers: {} };
    
    const config = new ToolsLoaderConfig({
      serviceRegistry: mockServiceRegistry,
      namespace: mockNamespace,
      dependencies: {
        logging: mockLogging,
        network: mockNetwork
      }
    });
    
    toolsLoaderService = new ToolsLoaderService(config);
  });

  describe("constructor", () => {
    it("should initialize with provided config", () => {
      expect(toolsLoaderService.config).toBeDefined();
      expect(toolsLoaderService.initialized).toBe(false);
    });

    it("should accept a plain config object", () => {
      const plainConfig = {
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        dependencies: {
          logging: mockLogging,
          network: mockNetwork
        }
      };
      
      const service = new ToolsLoaderService(plainConfig);
      
      expect(service.config.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.config.namespace).toBe(mockNamespace);
    });

    it("should use default config when none provided", () => {
      const service = new ToolsLoaderService();
      expect(service.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      toolsLoaderService.initialize();
      
      expect(toolsLoaderService.namespace).toBe(mockNamespace);
      expect(toolsLoaderService.helpers).toBe(mockNamespace.helpers);
      expect(toolsLoaderService.serviceRegistry).toBe(mockServiceRegistry);
      expect(toolsLoaderService.initialized).toBe(true);
      expect(toolsLoaderService.isCommonJs).toBeDefined();
    });

    it("should set up dependencies correctly", () => {
      toolsLoaderService.initialize();
      
      expect(toolsLoaderService.logging).toBe(mockLogging);
      expect(toolsLoaderService.network).toBe(mockNetwork);
    });

    it("should set up utility methods from dependencies", () => {
      toolsLoaderService.initialize();
      
      expect(toolsLoaderService.logClient).toBe(mockLogging.logClient);
      expect(toolsLoaderService.loadScript).toBe(mockNetwork.loadScript);
      expect(toolsLoaderService.resolveModuleUrl).toBe(mockNetwork.resolveModuleUrl);
    });

    it("should handle missing dependencies gracefully", () => {
      const configWithoutDeps = new ToolsLoaderConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });
      
      const service = new ToolsLoaderService(configWithoutDeps);
      service.initialize();
      
      // Should set default functions for missing dependencies
      expect(typeof service.logClient).toBe("function");
      expect(typeof service.loadScript).toBe("function");
      expect(typeof service.resolveModuleUrl).toBe("function");
    });

    it("should prevent double initialization", () => {
      toolsLoaderService.initialize();
      
      expect(() => toolsLoaderService.initialize()).toThrow("ToolsLoaderService already initialized");
    });

    it("should return the instance to allow chaining", () => {
      const result = toolsLoaderService.initialize();
      expect(result).toBe(toolsLoaderService);
    });
  });

  describe("createNamespace method", () => {
    it("should return ESM modules as-is", () => {
      const esmModule = { __esModule: true, namedExport: 'value' };
      const result = toolsLoaderService.createNamespace(esmModule);
      
      expect(result).toBe(esmModule);
    });

    it("should convert regular objects to namespace format", () => {
      const obj = { prop: 'value' };
      const result = toolsLoaderService.createNamespace(obj);
      
      expect(result.__esModule).toBe(true);
      expect(result.default).toBe(obj);
      expect(result.prop).toBe('value');
    });

    it("should handle null/undefined values", () => {
      expect(toolsLoaderService.createNamespace(null)).toEqual({ __esModule: true, default: null });
      expect(toolsLoaderService.createNamespace(undefined)).toEqual({ __esModule: true, default: undefined });
    });

    it("should copy properties from object", () => {
      const obj = { a: 1, b: 2 };
      const result = toolsLoaderService.createNamespace(obj);
      
      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
      expect(result.default).toBe(obj);
    });

    it("should copy properties from default export", () => {
      const obj = { method: () => 'test' };
      const result = toolsLoaderService.createNamespace(obj);
      
      expect(result.method).toBe(obj.method);
      expect(result.default).toBe(obj);
    });
  });

  describe("ensureGlobalFromNamespace method", () => {
    beforeEach(() => {
      global.window = mockWindow;
    });

    afterEach(() => {
      delete global.window;
    });

    it("should return early if no namespace provided", async () => {
      await expect(toolsLoaderService.ensureGlobalFromNamespace('name', 'global', null)).resolves.toBeUndefined();
    });

    it("should set window global if not exists", async () => {
      global.window = { ...mockWindow };
      const namespace = { default: { test: 'value' } };
      
      await toolsLoaderService.ensureGlobalFromNamespace('name', 'newGlobal', namespace);
      
      expect(global.window.newGlobal).toBe(namespace.default);
    });

    it("should not override existing global if different", async () => {
      global.window = { ...mockWindow, existingGlobal: { different: 'value' } };
      const namespace = { default: { test: 'value' } };
      
      await toolsLoaderService.ensureGlobalFromNamespace('name', 'existingGlobal', namespace);
      
      // Should not change the existing global
      expect(global.window.existingGlobal).toEqual({ different: 'value' });
    });

    it("should set global if existing matches namespace default", async () => {
      const sameObj = { test: 'value' };
      global.window = { ...mockWindow, sameGlobal: sameObj };
      const namespace = { default: sameObj };
      
      await toolsLoaderService.ensureGlobalFromNamespace('name', 'sameGlobal', namespace);
      
      // Should still be the same object
      expect(global.window.sameGlobal).toBe(sameObj);
    });
  });

  describe("loadTools method", () => {
    beforeEach(() => {
      toolsLoaderService.initialize();
      global.window = { ...mockWindow };
    });

    afterEach(() => {
      delete global.window;
    });

    it("should load tools and set globals", async () => {
      const tools = [{ name: 'testTool', global: 'TestGlobal' }];
      global.window.TestGlobal = { test: 'value' }; // Simulate tool being loaded

      const result = await toolsLoaderService.loadTools(tools);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should throw error if tool global is not found", async () => {
      const tools = [{ name: 'missingTool', global: 'MissingGlobal', url: 'http://example.com/tool.js' }];
      
      await expect(toolsLoaderService.loadTools(tools)).rejects.toThrow("Tool global not found after loading");
    });

    it("should handle empty tools array", async () => {
      const result = await toolsLoaderService.loadTools([]);
      expect(result).toEqual([]);
    });

    it("should handle undefined tools", async () => {
      const result = await toolsLoaderService.loadTools(undefined);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("makeNamespace method", () => {
    it("should call createNamespace internally", () => {
      toolsLoaderService.initialize();
      const obj = { test: 'value' };
      
      const result = toolsLoaderService.makeNamespace(obj);
      const expected = toolsLoaderService.createNamespace(obj);
      
      expect(result).toEqual(expected);
    });
  });

  describe("loadModules method", () => {
    beforeEach(() => {
      toolsLoaderService.initialize();
      global.window = { ...mockWindow };
    });

    afterEach(() => {
      delete global.window;
    });

    it("should load modules and return registry", async () => {
      const modules = [{ name: 'testModule', global: 'TestModule' }];
      global.window.TestModule = { test: 'value' }; // Simulate module being loaded
      
      const result = await toolsLoaderService.loadModules(modules);
      
      expect(result).toBeDefined();
      expect(result.testModule).toBeDefined();
    });

    it("should handle ESM format modules", async () => {
      // Mock the import function for this test
      const originalImport = global.import;
      global.import = jest.fn().mockResolvedValue({ default: { esm: 'value' } });
      
      const modules = [{ name: 'esmModule', global: 'ESMGlobal', format: 'esm' }];
      
      const result = await toolsLoaderService.loadModules(modules);
      
      expect(result).toBeDefined();
      expect(result.esmModule).toBeDefined();
      
      // Restore original import
      global.import = originalImport;
    });

    it("should throw error if module global is not found", async () => {
      const modules = [{ name: 'missingModule', global: 'MissingModule' }];
      
      await expect(toolsLoaderService.loadModules(modules)).rejects.toThrow("Module global not found after loading");
    });
  });

  describe("exports getter", () => {
    beforeEach(() => {
      toolsLoaderService.initialize();
    });

    it("should return the public API", () => {
      const exports = toolsLoaderService.exports;
      
      expect(typeof exports.loadTools).toBe("function");
      expect(typeof exports.makeNamespace).toBe("function");
      expect(typeof exports.loadModules).toBe("function");
    });

    it("should bind methods to the service instance", () => {
      const exports = toolsLoaderService.exports;
      
      // These should be bound methods
      expect(exports.loadTools).not.toBe(toolsLoaderService.loadTools);
      expect(exports.makeNamespace).not.toBe(toolsLoaderService.makeNamespace);
      expect(exports.loadModules).not.toBe(toolsLoaderService.loadModules);
    });
  });

  describe("install method", () => {
    let freshService;

    beforeEach(() => {
      const config = new ToolsLoaderConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        dependencies: {
          logging: mockLogging,
          network: mockNetwork
        }
      });
      
      freshService = new ToolsLoaderService(config);
      freshService.initialize();
    });

    it("should throw if not initialized", () => {
      const uninitializedService = new ToolsLoaderService(freshService.config);
      
      expect(() => uninitializedService.install()).toThrow("ToolsLoaderService not initialized");
    });

    it("should register the service and set up helpers", () => {
      const result = freshService.install();
      
      expect(result).toBe(freshService);
      
      // Check that service was registered
      const registered = mockServiceRegistry.registeredServices.get("tools");
      expect(registered).toBeDefined();
      expect(registered.metadata).toEqual({
        folder: "services/cdn",
        domain: "cdn"
      });
      
      // Check that helpers were set up
      expect(mockNamespace.helpers.tools).toBeDefined();
    });

    it("should return the instance to allow chaining", () => {
      const result = freshService.install();
      expect(result).toBe(freshService);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      // Before initialization
      expect(toolsLoaderService.initialized).toBe(false);
      
      // Initialize
      const initResult = toolsLoaderService.initialize();
      expect(initResult).toBe(toolsLoaderService);
      expect(toolsLoaderService.initialized).toBe(true);
      
      // Install
      const installResult = toolsLoaderService.install();
      expect(installResult).toBe(toolsLoaderService);
      
      // Verify service was registered
      expect(mockServiceRegistry.registeredServices.get("tools")).toBeDefined();
    });

    it("should handle complete namespace creation flow", () => {
      toolsLoaderService.initialize();
      
      // Test createNamespace
      const obj = { prop: 'value' };
      const namespace = toolsLoaderService.createNamespace(obj);
      expect(namespace.__esModule).toBe(true);
      expect(namespace.default).toBe(obj);
      expect(namespace.prop).toBe('value');
      
      // Test makeNamespace
      const namespace2 = toolsLoaderService.makeNamespace(obj);
      expect(namespace2).toEqual(namespace);
    });
  });
});