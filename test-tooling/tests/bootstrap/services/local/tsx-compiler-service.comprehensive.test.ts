import TsxCompilerService from "../../../../../bootstrap/services/local/tsx-compiler-service.js";
import TsxCompilerConfig from "../../../../../bootstrap/configs/local/tsx-compiler.js";

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
  transform: jest.fn((source, options) => {
    return {
      code: `// transformed: ${source}`
    };
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
    text: () => Promise.resolve('console.log("test");')
  });
};

// Mock namespace for testing
const mockNamespace = {
  helpers: {}
};

describe("TsxCompilerService", () => {
  let tsxCompilerService;
  let mockServiceRegistry;
  let mockRequireFn;

  beforeEach(() => {
    mockServiceRegistry = new MockServiceRegistry();
    mockRequireFn = jest.fn();
    
    const config = new TsxCompilerConfig({
      serviceRegistry: mockServiceRegistry,
      namespace: mockNamespace,
      fetch: mockFetch,
      Babel: mockBabel
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
        fetch: mockFetch,
        Babel: mockBabel
      };
      
      const service = new TsxCompilerService(plainConfig);
      
      expect(service.config.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.config.namespace).toBe(mockNamespace);
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
      expect(tsxCompilerService.helpers).toBeDefined();
      expect(tsxCompilerService.isCommonJs).toBeDefined();
      expect(tsxCompilerService.Babel).toBe(mockBabel);
      expect(tsxCompilerService.fetchImpl).toBe(mockFetch);
      expect(tsxCompilerService.moduleContextStack).toEqual([]);
      expect(tsxCompilerService.initialized).toBe(true);
    });

    it("should prevent double initialization", () => {
      tsxCompilerService.initialize();
      
      expect(() => tsxCompilerService.initialize()).toThrow("TsxCompilerService already initialized");
    });

    it("should return the instance to allow chaining", () => {
      const result = tsxCompilerService.initialize();
      expect(result).toBe(tsxCompilerService);
    });

    it("should handle dependencies correctly", () => {
      const mockLogging = { logClient: jest.fn() };
      const mockSourceUtils = { preloadModulesFromSource: jest.fn() };

      const configWithDeps = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        dependencies: {
          logging: mockLogging,
          sourceUtils: mockSourceUtils
        },
        Babel: mockBabel
      });

      const service = new TsxCompilerService(configWithDeps);
      service.initialize();

      // When dependencies are provided directly, they should be used
      expect(service.logging).toBe(mockLogging);
      expect(service.sourceUtils).toBe(mockSourceUtils);
      expect(service.preloadModulesFromSource).toBe(mockSourceUtils.preloadModulesFromSource);
    });

    it("should set up logClient function", () => {
      const mockLogging = { logClient: jest.fn() };

      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        dependencies: { logging: mockLogging },
        Babel: mockBabel
      });

      const service = new TsxCompilerService(config);
      service.initialize();

      // The logClient should be the one from the logging dependency
      expect(typeof service.logClient).toBe("function");
    });

    it("should set up default logClient if logging not available", () => {
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel
      });
      
      const service = new TsxCompilerService(config);
      service.initialize();
      
      expect(typeof service.logClient).toBe("function");
    });
  });

  describe("transformSource method", () => {
    beforeEach(() => {
      tsxCompilerService.initialize();
    });

    it("should throw an error when Babel is unavailable", () => {
      tsxCompilerService.Babel = null;
      
      expect(() => tsxCompilerService.transformSource("test", "test.tsx"))
        .toThrow("Babel is unavailable when transforming TSX");
    });

    it("should transform source code using Babel", () => {
      const source = "const App = () => <div>Hello</div>;";
      const result = tsxCompilerService.transformSource(source, "App.tsx");
      
      expect(mockBabel.transform).toHaveBeenCalledWith(source, {
        filename: "App.tsx",
        presets: [
          ["typescript", { allExtensions: true, isTSX: true }],
          "react",
          "env"
        ],
        sourceMaps: "inline"
      });
      expect(result).toBe("// transformed: const App = () => <div>Hello</div>;");
    });
  });

  describe("executeModuleSource method", () => {
    beforeEach(() => {
      tsxCompilerService.initialize();
    });

    it("should execute compiled module source", () => {
      const mockTransformSource = jest.fn().mockReturnValue('module.exports = { test: "value" };');
      tsxCompilerService.transformSource = mockTransformSource;
      
      const result = tsxCompilerService.executeModuleSource("source", "test.tsx", "/path", mockRequireFn);
      
      expect(mockTransformSource).toHaveBeenCalledWith("source", "test.tsx");
      expect(result).toEqual({ test: "value" });
    });

    it("should return default export if available", () => {
      const mockTransformSource = jest.fn().mockReturnValue(`
        module.exports = {};
        module.exports.default = { default: "export" };
      `);
      tsxCompilerService.transformSource = mockTransformSource;
      
      const result = tsxCompilerService.executeModuleSource("source", "test.tsx", "/path", mockRequireFn);
      
      expect(result).toEqual({ default: "export" });
    });

    it("should manage module context stack", () => {
      const mockTransformSource = jest.fn().mockReturnValue('module.exports = {};');
      tsxCompilerService.transformSource = mockTransformSource;
      
      tsxCompilerService.executeModuleSource("source", "test.tsx", "/path", mockRequireFn);
      
      expect(tsxCompilerService.moduleContextStack).toEqual([]);
    });
  });

  describe("compileTSX method", () => {
    beforeEach(() => {
      tsxCompilerService.initialize();
    });

    it("should throw an error when fetch is unavailable", async () => {
      tsxCompilerService.fetchImpl = null;
      
      await expect(tsxCompilerService.compileTSX("test.tsx", mockRequireFn))
        .rejects.toThrow("Fetch is unavailable when compiling TSX");
    });

    it("should compile TSX successfully", async () => {
      const mockExecuteModuleSource = jest.fn().mockReturnValue({ component: "test" });
      const originalLogClient = tsxCompilerService.logClient;
      tsxCompilerService.logClient = jest.fn();
      tsxCompilerService.executeModuleSource = mockExecuteModuleSource;

      const result = await tsxCompilerService.compileTSX("test.tsx", mockRequireFn);

      expect(result).toEqual({ component: "test" });
      expect(tsxCompilerService.logClient).toHaveBeenCalledWith("tsx:compiled", {
        entryFile: "test.tsx",
        entryDir: ""
      });

      // Restore original logClient
      tsxCompilerService.logClient = originalLogClient;
    });

    it("should handle custom entry directory", async () => {
      const mockExecuteModuleSource = jest.fn().mockReturnValue({ component: "test" });
      tsxCompilerService.executeModuleSource = mockExecuteModuleSource;
      
      const result = await tsxCompilerService.compileTSX("test.tsx", mockRequireFn, "/custom/path");
      
      expect(result).toEqual({ component: "test" });
      expect(tsxCompilerService.logClient).toHaveBeenCalledWith("tsx:compiled", {
        entryFile: "test.tsx",
        entryDir: "/custom/path"
      });
    });

    it("should throw an error when fetch fails", async () => {
      await expect(tsxCompilerService.compileTSX("error.tsx", mockRequireFn))
        .rejects.toThrow("Failed to load error.tsx");
    });

    it("should preload modules if preloadModulesFromSource is available", async () => {
      const mockPreload = jest.fn().mockResolvedValue();
      tsxCompilerService.preloadModulesFromSource = mockPreload;
      const mockExecuteModuleSource = jest.fn().mockReturnValue({ component: "test" });
      tsxCompilerService.executeModuleSource = mockExecuteModuleSource;
      
      await tsxCompilerService.compileTSX("test.tsx", mockRequireFn, "/path");
      
      expect(mockPreload).toHaveBeenCalledWith('console.log("test");', mockRequireFn, "/path");
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
      
      // These should not throw errors when called
      expect(() => exports.transformSource("test", "test.tsx")).not.toThrow();
      expect(() => exports.moduleContextStack).not.toThrow();
    });
  });

  describe("install method", () => {
    beforeEach(() => {
      tsxCompilerService.initialize();
    });

    it("should throw if not initialized", () => {
      const freshService = new TsxCompilerService(tsxCompilerService.config);
      
      expect(() => freshService.install()).toThrow("TsxCompilerService not initialized");
    });

    it("should register the service and set up helpers", () => {
      const result = tsxCompilerService.install();
      
      expect(result).toBe(tsxCompilerService);
      
      // Check that service was registered
      const registered = mockServiceRegistry.registeredServices.get("tsxCompiler");
      expect(registered).toBeDefined();
      expect(registered.metadata).toEqual({
        folder: "services/local",
        domain: "local"
      });
      
      // Check that helpers were set up
      expect(tsxCompilerService.helpers.tsxCompiler).toBeDefined();
    });

    it("should return the instance to allow chaining", () => {
      const result = tsxCompilerService.install();
      expect(result).toBe(tsxCompilerService);
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
      
      // Mock the necessary methods for the full flow
      const mockTransform = jest.fn().mockReturnValue('module.exports = { test: "compiled" };');
      const mockExecute = jest.fn().mockReturnValue({ test: "compiled" });
      
      tsxCompilerService.transformSource = mockTransform;
      tsxCompilerService.executeModuleSource = mockExecute;
      
      const result = await tsxCompilerService.compileTSX("test.tsx", mockRequireFn);
      
      expect(result).toEqual({ test: "compiled" });
      expect(mockTransform).toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalled();
      expect(tsxCompilerService.logClient).toHaveBeenCalledWith("tsx:compiled", {
        entryFile: "test.tsx",
        entryDir: ""
      });
    });
  });
});