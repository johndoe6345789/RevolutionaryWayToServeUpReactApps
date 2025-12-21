import TsxCompilerService from "../../../../bootstrap/services/local/tsx-compiler-service.js";
import TsxCompilerConfig from "../../../../bootstrap/configs/local/tsx-compiler.js";

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

// Mock Babel for testing
const mockBabel = {
  transform: jest.fn().mockReturnValue({
    code: "// transformed code"
  })
};

// Mock fetch implementation
const mockFetch = (url, options) => {
  if (url.includes('error')) {
    return Promise.resolve({
      ok: false,
      status: 404,
      text: () => Promise.resolve('')
    });
  }
  return Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve('console.log("hello world");')
  });
};

// Mock source utils
const mockSourceUtils = {
  preloadModulesFromSource: jest.fn().mockResolvedValue()
};

// Mock logging
const mockLogging = {
  logClient: jest.fn()
};

describe("TsxCompilerService", () => {
  let tsxCompilerService;
  let mockServiceRegistry;
  let mockNamespace;

  beforeEach(() => {
    mockServiceRegistry = new MockServiceRegistry();
    mockNamespace = { helpers: {} };
    
    const config = new TsxCompilerConfig({
      serviceRegistry: mockServiceRegistry,
      namespace: mockNamespace,
      Babel: mockBabel,
      fetch: mockFetch,
      dependencies: {
        logging: mockLogging,
        sourceUtils: mockSourceUtils
      }
    });
    
    tsxCompilerService = new TsxCompilerService(config);
  });

  describe("constructor", () => {
    it("should initialize with provided config", () => {
      expect(tsxCompilerService.config).toBeDefined();
      expect(tsxCompilerService.initialized).toBe(false);
    });

    it("should accept a plain config object", () => {
      const plainConfig = {
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel,
        fetch: mockFetch
      };
      
      const service = new TsxCompilerService(plainConfig);
      
      expect(service.config.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.config.namespace).toBe(mockNamespace);
      expect(service.config.Babel).toBe(mockBabel);
      expect(service.config.fetch).toBe(mockFetch);
    });

    it("should use default config when none provided", () => {
      const service = new TsxCompilerService();
      expect(service.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      tsxCompilerService.initialize();
      
      expect(tsxCompilerService.serviceRegistry).toBe(mockServiceRegistry);
      expect(tsxCompilerService.namespace).toBe(mockNamespace);
      expect(tsxCompilerService.helpers).toBe(mockNamespace.helpers);
      expect(typeof tsxCompilerService.isCommonJs).toBe("boolean");
      expect(tsxCompilerService.Babel).toBe(mockBabel);
      expect(tsxCompilerService.fetchImpl).toBe(mockFetch);
      expect(tsxCompilerService.moduleContextStack).toEqual([]);
      expect(tsxCompilerService.initialized).toBe(true);
    });

    it("should set up dependencies correctly", () => {
      tsxCompilerService.initialize();
      
      expect(tsxCompilerService.logging).toBe(mockLogging);
      expect(tsxCompilerService.sourceUtils).toBe(mockSourceUtils);
      expect(tsxCompilerService.logClient).toBe(mockLogging.logClient);
      expect(tsxCompilerService.preloadModulesFromSource).toBe(mockSourceUtils.preloadModulesFromSource);
    });

    it("should handle missing dependencies gracefully", () => {
      const configWithoutDeps = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });
      
      const service = new TsxCompilerService(configWithoutDeps);
      service.initialize();
      
      // Should set default functions for missing dependencies
      expect(typeof service.logClient).toBe("function");
      expect(service.preloadModulesFromSource).toBeUndefined();
    });

    it("should prevent double initialization", () => {
      tsxCompilerService.initialize();
      
      expect(() => tsxCompilerService.initialize()).toThrow("TsxCompilerService already initialized");
    });

    it("should return the instance to allow chaining", () => {
      const result = tsxCompilerService.initialize();
      expect(result).toBe(tsxCompilerService);
    });
  });

  describe("transformSource method", () => {
    beforeEach(() => {
      tsxCompilerService.initialize();
    });

    it("should throw an error when Babel is unavailable", () => {
      tsxCompilerService.Babel = null;
      
      expect(() => tsxCompilerService.transformSource("console.log('test');", "test.tsx"))
        .toThrow("Babel is unavailable when transforming TSX");
    });

    it("should transform source code using Babel", () => {
      const source = "const App = () => <div>Hello</div>; export default App;";
      const result = tsxCompilerService.transformSource(source, "App.tsx");
      
      expect(mockBabel.transform).toHaveBeenCalledWith(source, {
        filename: "App.tsx",
        presets: [
          ["typescript", { allExtensions: true, isTSX: true }],
          "react",
          "env",
        ],
        sourceMaps: "inline",
      });
      
      expect(result).toBe("// transformed code");
    });
  });

  describe("executeModuleSource method", () => {
    beforeEach(() => {
      tsxCompilerService.initialize();
    });

    it("should execute compiled module source", () => {
      // Mock transformSource to return a simple module
      tsxCompilerService.transformSource = jest.fn().mockReturnValue(
        "module.exports = { test: 'value' };"
      );
      
      const mockRequire = jest.fn();
      const result = tsxCompilerService.executeModuleSource(
        "source code", 
        "test.tsx", 
        "/path", 
        mockRequire
      );
      
      // Should return the exported value
      expect(result).toEqual({ test: "value" });
      
      // Should have pushed and popped from context stack
      expect(tsxCompilerService.moduleContextStack).toEqual([]);
    });

    it("should return default export if available", () => {
      tsxCompilerService.transformSource = jest.fn().mockReturnValue(
        "module.exports = {}; module.exports.default = { default: 'export' };"
      );
      
      const mockRequire = jest.fn();
      const result = tsxCompilerService.executeModuleSource(
        "source code", 
        "test.tsx", 
        "/path", 
        mockRequire
      );
      
      expect(result).toEqual({ default: "export" });
    });

    it("should manage module context stack", () => {
      tsxCompilerService.transformSource = jest.fn().mockReturnValue(
        "module.exports = { test: 'value' };"
      );
      
      const mockRequire = jest.fn();
      tsxCompilerService.executeModuleSource(
        "source code", 
        "test.tsx", 
        "/path", 
        mockRequire
      );
      
      // Context stack should be empty after execution (push then pop)
      expect(tsxCompilerService.moduleContextStack).toEqual([]);
    });
  });

  describe("compileTSX method", () => {
    beforeEach(() => {
      tsxCompilerService.initialize();
    });

    it("should throw an error when fetch is unavailable", async () => {
      tsxCompilerService.fetchImpl = null;
      
      await expect(tsxCompilerService.compileTSX("test.tsx", jest.fn()))
        .rejects.toThrow("Fetch is unavailable when compiling TSX");
    });

    it("should compile TSX successfully", async () => {
      // Mock the necessary methods for the full flow
      const mockExecuteModuleSource = jest.fn().mockReturnValue({ component: "test" });
      tsxCompilerService.executeModuleSource = mockExecuteModuleSource;
      
      const mockRequire = jest.fn();
      const result = await tsxCompilerService.compileTSX("test.tsx", mockRequire);
      
      expect(result).toEqual({ component: "test" });
      expect(tsxCompilerService.logClient).toHaveBeenCalledWith("tsx:compiled", {
        entryFile: "test.tsx",
        entryDir: ""
      });
    });

    it("should handle custom entry directory", async () => {
      const mockExecuteModuleSource = jest.fn().mockReturnValue({ component: "test" });
      tsxCompilerService.executeModuleSource = mockExecuteModuleSource;
      
      const mockRequire = jest.fn();
      const result = await tsxCompilerService.compileTSX("test.tsx", mockRequire, "/custom/path");
      
      expect(result).toEqual({ component: "test" });
      expect(tsxCompilerService.logClient).toHaveBeenCalledWith("tsx:compiled", {
        entryFile: "test.tsx",
        entryDir: "/custom/path"
      });
    });

    it("should throw an error when fetch fails", async () => {
      await expect(tsxCompilerService.compileTSX("error.tsx", jest.fn()))
        .rejects.toThrow("Failed to load error.tsx");
    });

    it("should preload modules if preloadModulesFromSource is available", async () => {
      const mockExecuteModuleSource = jest.fn().mockReturnValue({ component: "test" });
      tsxCompilerService.executeModuleSource = mockExecuteModuleSource;
      
      const mockRequire = jest.fn();
      await tsxCompilerService.compileTSX("test.tsx", mockRequire, "/path");
      
      expect(mockSourceUtils.preloadModulesFromSource).toHaveBeenCalledWith(
        'console.log("hello world");', 
        mockRequire, 
        "/path"
      );
    });
  });

  describe("exports getter", () => {
    beforeEach(() => {
      tsxCompilerService.initialize();
    });

    it("should return the public API", () => {
      const exports = tsxCompilerService.exports;
      
      expect(typeof exports.compileTSX).toBe("function");
      expect(typeof exports.transformSource).toBe("function");
      expect(typeof exports.executeModuleSource).toBe("function");
      expect(Array.isArray(exports.moduleContextStack)).toBe(true);
    });

    it("should bind methods to the service instance", () => {
      const exports = tsxCompilerService.exports;
      
      // These should be bound methods
      expect(exports.compileTSX).not.toBe(tsxCompilerService.compileTSX);
      expect(exports.transformSource).not.toBe(tsxCompilerService.transformSource);
      expect(exports.executeModuleSource).not.toBe(tsxCompilerService.executeModuleSource);
    });
  });

  describe("install method", () => {
    let freshService;

    beforeEach(() => {
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel,
        fetch: mockFetch,
        dependencies: {
          logging: mockLogging,
          sourceUtils: mockSourceUtils
        }
      });
      
      freshService = new TsxCompilerService(config);
      freshService.initialize();
    });

    it("should throw if not initialized", () => {
      const uninitializedService = new TsxCompilerService(freshService.config);
      
      expect(() => uninitializedService.install()).toThrow("TsxCompilerService not initialized");
    });

    it("should register the service and set up helpers", () => {
      const result = freshService.install();
      
      expect(result).toBe(freshService);
      
      // Check that service was registered
      const registered = mockServiceRegistry.registeredServices.get("tsxCompiler");
      expect(registered).toBeDefined();
      expect(registered.metadata).toEqual({
        folder: "services/local",
        domain: "local",
      });
      
      // Check that helpers were set up
      expect(mockNamespace.helpers.tsxCompiler).toBeDefined();
    });

    it("should return the instance to allow chaining", () => {
      const result = freshService.install();
      expect(result).toBe(freshService);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      // Before initialization
      expect(tsxCompilerService.initialized).toBe(false);
      
      // Initialize
      const initResult = tsxCompilerService.initialize();
      expect(initResult).toBe(tsxCompilerService);
      expect(tsxCompilerService.initialized).toBe(true);
      
      // Install
      const installResult = tsxCompilerService.install();
      expect(installResult).toBe(tsxCompilerService);
      
      // Verify service was registered
      expect(mockServiceRegistry.registeredServices.get("tsxCompiler")).toBeDefined();
    });

    it("should handle complete TSX compilation flow", async () => {
      tsxCompilerService.initialize();
      
      // Mock the transformation and execution
      tsxCompilerService.transformSource = jest.fn().mockReturnValue(
        "module.exports = { App: () => '<div>Test</div>' };"
      );
      const mockExecuteModuleSource = jest.fn().mockReturnValue({ App: () => '<div>Test</div>' });
      tsxCompilerService.executeModuleSource = mockExecuteModuleSource;
      
      const mockRequire = jest.fn();
      const result = await tsxCompilerService.compileTSX("test.tsx", mockRequire);
      
      expect(result).toEqual({ App: expect.any(Function) });
      expect(mockExecuteModuleSource).toHaveBeenCalled();
    });
  });
});