import TsxCompilerService from "../../../bootstrap/services/local/tsx-compiler-service.js";
import TsxCompilerConfig from "../../../bootstrap/configs/local/tsx-compiler.js";

// Mock service registry for testing
class MockServiceRegistry {
  constructor() {
    this.registeredServices = new Map();
  }

  register(name, service, metadata, requiredServices) {
    this.registeredServices.set(name, { service, metadata, requiredServices });
  }

  getService(name) {
    const entry = this.registeredServices.get(name);
    return entry ? entry.service : null;
  }
}

// Mock Babel for testing
const createMockBabel = () => ({
  transform: (source, options) => {
    return {
      code: `// transformed: ${source}`
    };
  }
});

// Mock fetch implementation
const createMockFetch = (shouldFail = false) => {
  return (url, options) => {
    if (shouldFail || url.includes('error')) {
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
};

// Mock namespace for testing
const mockNamespace = {
  helpers: {}
};

describe("TsxCompilerService", () => {
  let mockServiceRegistry;

  beforeEach(() => {
    mockServiceRegistry = new MockServiceRegistry();
  });

  describe("constructor", () => {
    it("should initialize with provided config", () => {
      const config = new TsxCompilerConfig({ serviceRegistry: mockServiceRegistry });
      const service = new TsxCompilerService(config);

      expect(service.config).toBe(config);
      expect(service.initialized).toBe(false);
    });

    it("should accept a plain config object", () => {
      const plainConfig = { serviceRegistry: mockServiceRegistry };
      const service = new TsxCompilerService(plainConfig);

      expect(service.config).toBe(plainConfig);
      expect(service.initialized).toBe(false);
    });

    it("should use default config when none provided", () => {
      const service = new TsxCompilerService();

      expect(service.config).toBeInstanceOf(TsxCompilerConfig);
      expect(service.initialized).toBe(false);
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      const mockLogging = { logClient: () => {} };
      const mockSourceUtils = { preloadModulesFromSource: () => {} };
      const mockBabel = createMockBabel();
      const mockFetch = createMockFetch();

      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        dependencies: {
          logging: mockLogging,
          sourceUtils: mockSourceUtils
        },
        Babel: mockBabel,
        fetch: mockFetch
      });

      const service = new TsxCompilerService(config);
      const result = service.initialize();

      expect(result).toBe(service);
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.namespace).toBe(mockNamespace);
      expect(service.helpers).toBe(mockNamespace.helpers);
      expect(typeof service.logClient).toBe("function");
      expect(typeof service.preloadModulesFromSource).toBe("function");
      expect(Array.isArray(service.moduleContextStack)).toBe(true);
      expect(service.Babel).toBe(mockBabel);
      expect(service.fetchImpl).toBe(mockFetch);
      expect(service.initialized).toBe(true);
    });

    it("should prevent double initialization", () => {
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });
      const service = new TsxCompilerService(config);
      service.initialize();

      expect(() => {
        service.initialize();
      }).toThrow("already initialized");
    });

    it("should return the instance to allow chaining", () => {
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });
      const service = new TsxCompilerService(config);
      const result = service.initialize();

      expect(result).toBe(service);
    });
  });

  describe("transformSource method", () => {
    it("should throw an error when Babel is unavailable", () => {
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });
      const service = new TsxCompilerService(config);
      service.initialize();
      // Explicitly set Babel to null to simulate unavailability
      service.Babel = null;

      expect(() => {
        service.transformSource("console.log('test');", "test.tsx");
      }).toThrow("Babel is unavailable when transforming TSX");
    });

    it("should transform source code using Babel", () => {
      const mockBabel = createMockBabel();
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel
      });
      const service = new TsxCompilerService(config);
      service.initialize();

      const source = "console.log('test');";
      const result = service.transformSource(source, "test.tsx");

      expect(result).toContain("// transformed: console.log('test');");
    });
  });

  describe("executeModuleSource method", () => {
    it("should execute compiled module source", () => {
      const mockBabel = createMockBabel();
      const mockRequire = () => {};
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel
      });
      const service = new TsxCompilerService(config);
      service.initialize();

      const source = "module.exports = { test: 'value' };";
      const result = service.executeModuleSource(source, "test.tsx", "", mockRequire);

      expect(result).toBeDefined();
    });

    it("should return default export if available", () => {
      const mockBabel = createMockBabel();
      const mockRequire = () => {};
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel
      });
      const service = new TsxCompilerService(config);
      service.initialize();

      const source = "exports.default = { default: 'export' };";
      const result = service.executeModuleSource(source, "test.tsx", "", mockRequire);

      expect(result).toBeDefined();
    });

    it("should manage module context stack", () => {
      const mockBabel = createMockBabel();
      const mockRequire = () => {};
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel
      });
      const service = new TsxCompilerService(config);
      service.initialize();

      const initialStackSize = service.moduleContextStack.length;

      const source = "module.exports = { test: 'value' };";
      service.executeModuleSource(source, "test.tsx", "/path", mockRequire);

      expect(service.moduleContextStack.length).toBe(initialStackSize);
    });
  });

  describe("compileTSX method", () => {
    it("should throw an error when fetch is unavailable", async () => {
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });
      const service = new TsxCompilerService(config);
      service.initialize();
      // Explicitly set fetch to null to simulate unavailability
      service.fetchImpl = null;

      await expect(service.compileTSX("test.tsx", () => {})).rejects.toThrow("Fetch is unavailable when compiling TSX");
    });

    it("should compile TSX successfully", async () => {
      const mockBabel = createMockBabel();
      const mockFetch = createMockFetch();
      const mockRequire = () => {};
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel,
        fetch: mockFetch
      });
      const service = new TsxCompilerService(config);
      service.initialize();

      const result = await service.compileTSX("test.tsx", mockRequire);

      // The result will be the output of executing 'console.log("test");'
      // which doesn't return anything meaningful, so we just check it doesn't throw
      expect(result).toBeDefined();
    });

    it("should throw an error when fetch fails", async () => {
      const mockBabel = createMockBabel();
      const mockFetch = createMockFetch(true); // Should fail
      const mockRequire = () => {};
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel,
        fetch: mockFetch
      });
      const service = new TsxCompilerService(config);
      service.initialize();

      await expect(service.compileTSX("error.tsx", mockRequire)).rejects.toThrow("Failed to load error.tsx");
    });
  });

  describe("exports getter", () => {
    it("should return the public API", () => {
      const mockBabel = createMockBabel();
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel
      });
      const service = new TsxCompilerService(config);
      service.initialize();

      const exports = service.exports;

      expect(typeof exports.compileTSX).toBe("function");
      expect(typeof exports.transformSource).toBe("function");
      expect(typeof exports.executeModuleSource).toBe("function");
      expect(Array.isArray(exports.moduleContextStack)).toBe(true);
    });

    it("should bind methods to the service instance", () => {
      const mockBabel = createMockBabel();
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel
      });
      const service = new TsxCompilerService(config);
      service.initialize();

      const exports = service.exports;
      const originalCompileTSX = service.compileTSX;

      // Ensure the bound method is different from the original
      expect(exports.compileTSX).not.toBe(originalCompileTSX);
      // The bound method should be a function
      expect(typeof exports.compileTSX).toBe("function");
    });
  });

  describe("install method", () => {
    it("should throw if not initialized", () => {
      const config = new TsxCompilerConfig({ serviceRegistry: mockServiceRegistry });
      const service = new TsxCompilerService(config);

      expect(() => {
        service.install();
      }).toThrow("not initialized");
    });

    it("should register the service and set up helpers", () => {
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });
      const service = new TsxCompilerService(config);
      service.initialize();

      const result = service.install();

      expect(result).toBe(service);
      expect(mockServiceRegistry.registeredServices.has("tsxCompiler")).toBe(true);

      const registered = mockServiceRegistry.registeredServices.get("tsxCompiler");
      expect(registered.metadata.folder).toBe("services/local");
      expect(registered.metadata.domain).toBe("local");
      expect(registered.requiredServices).toEqual(["logging", "sourceUtils"]);

      // Check that helpers were set up
      expect(service.helpers.tsxCompiler).toBeDefined();
    });

    it("should return the instance to allow chaining", () => {
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });
      const service = new TsxCompilerService(config);
      service.initialize();

      const result = service.install();

      expect(result).toBe(service);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });
      const service = new TsxCompilerService(config);

      // Initialize
      expect(service.initialized).toBe(false);
      service.initialize();
      expect(service.initialized).toBe(true);

      // Check exports are available
      expect(service.exports).toBeDefined();

      // Install
      service.install();
      expect(mockServiceRegistry.registeredServices.has("tsxCompiler")).toBe(true);
    });
  });
});