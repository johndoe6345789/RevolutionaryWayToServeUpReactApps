import LocalModuleLoaderService from "../../../../../bootstrap/services/local/local-module-loader-service.js";
import LocalModuleLoaderConfig from "../../../../../bootstrap/configs/local/local-module-loader.js";

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

// Mock fetch implementation
const mockFetch = (url, options) => {
  if (url.includes('missing')) {
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

// Mock dependencies for testing
const mockLogging = { logClient: jest.fn() };
const mockDynamicModules = { loadDynamicModule: jest.fn() };
const mockSourceUtils = { preloadModulesFromSource: jest.fn().mockResolvedValue() };
const mockTsxCompiler = { 
  executeModuleSource: (source, path, dir, requireFn) => ({ test: 'compiled' }),
  transformSource: jest.fn()
};
const mockLocalPaths = {
  normalizeDir: (dir) => dir ? dir.replace(/^\/+/, "").replace(/\/+$/, "") : "",
  makeAliasKey: (name, baseDir) => `${baseDir}|${name}`,
  resolveLocalModuleBase: (name, baseDir) => `${baseDir}/${name}`,
  getModuleDir: (filePath) => filePath.substring(0, filePath.lastIndexOf('/')) || '',
  getCandidateLocalPaths: (basePath) => [basePath, `${basePath}.js`, `${basePath}/index.js`]
};

describe("LocalModuleLoaderService", () => {
  let localModuleLoaderService;
  let mockServiceRegistry;
  let mockNamespace;

  beforeEach(() => {
    mockServiceRegistry = new MockServiceRegistry();
    mockNamespace = { helpers: {} };
    
    const config = new LocalModuleLoaderConfig({
      serviceRegistry: mockServiceRegistry,
      namespace: mockNamespace,
      fetch: mockFetch,
      dependencies: {
        logging: mockLogging,
        dynamicModules: mockDynamicModules,
        sourceUtils: mockSourceUtils,
        tsxCompiler: mockTsxCompiler,
        localPaths: mockLocalPaths
      }
    });
    
    localModuleLoaderService = new LocalModuleLoaderService(config);
  });

  describe("constructor", () => {
    it("should initialize with provided config", () => {
      expect(localModuleLoaderService.config).toBeDefined();
      expect(localModuleLoaderService.initialized).toBe(false);
    });

    it("should accept a plain config object", () => {
      const plainConfig = {
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        fetch: mockFetch
      };
      
      const service = new LocalModuleLoaderService(plainConfig);
      
      expect(service.config.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.config.namespace).toBe(mockNamespace);
    });

    it("should use default config when none provided", () => {
      const service = new LocalModuleLoaderService();
      expect(service.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      localModuleLoaderService.initialize();
      
      expect(localModuleLoaderService.namespace).toBe(mockNamespace);
      expect(localModuleLoaderService.helpers).toBe(mockNamespace.helpers);
      expect(localModuleLoaderService.serviceRegistry).toBe(mockServiceRegistry);
      expect(localModuleLoaderService.initialized).toBe(true);
      expect(localModuleLoaderService.isCommonJs).toBeDefined();
      expect(localModuleLoaderService.fetchImpl).toBe(mockFetch);
    });

    it("should set up dependencies correctly", () => {
      localModuleLoaderService.initialize();
      
      expect(localModuleLoaderService.logging).toBe(mockLogging);
      expect(localModuleLoaderService.dynamicModules).toBe(mockDynamicModules);
      expect(localModuleLoaderService.sourceUtils).toBe(mockSourceUtils);
      expect(localModuleLoaderService.tsxCompiler).toBe(mockTsxCompiler);
      expect(localModuleLoaderService.localPaths).toBe(mockLocalPaths);
    });

    it("should set up utility methods from dependencies", () => {
      localModuleLoaderService.initialize();
      
      expect(localModuleLoaderService.logClient).toBe(mockLogging.logClient);
      expect(localModuleLoaderService.loadDynamicModule).toBe(mockDynamicModules.loadDynamicModule);
      expect(localModuleLoaderService.preloadModulesFromSource).toBe(mockSourceUtils.preloadModulesFromSource);
      expect(localModuleLoaderService.executeModuleSource).toBe(mockTsxCompiler.executeModuleSource);
      expect(localModuleLoaderService.transformSource).toBe(mockTsxCompiler.transformSource);
      expect(localModuleLoaderService.normalizeDir).toBe(mockLocalPaths.normalizeDir);
      expect(localModuleLoaderService.makeAliasKey).toBe(mockLocalPaths.makeAliasKey);
      expect(localModuleLoaderService.resolveLocalModuleBase).toBe(mockLocalPaths.resolveLocalModuleBase);
      expect(localModuleLoaderService.getModuleDir).toBe(mockLocalPaths.getModuleDir);
      expect(localModuleLoaderService.getCandidateLocalPaths).toBe(mockLocalPaths.getCandidateLocalPaths);
    });

    it("should handle missing dependencies gracefully", () => {
      const configWithoutDeps = new LocalModuleLoaderConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace
      });
      
      const service = new LocalModuleLoaderService(configWithoutDeps);
      service.initialize();
      
      // Should set default functions for missing dependencies
      expect(typeof service.logClient).toBe("function");
      expect(typeof service.loadDynamicModule).toBe("function");
    });

    it("should prevent double initialization", () => {
      localModuleLoaderService.initialize();
      
      expect(() => localModuleLoaderService.initialize()).toThrow("LocalModuleLoaderService already initialized");
    });

    it("should return the instance to allow chaining", () => {
      const result = localModuleLoaderService.initialize();
      expect(result).toBe(localModuleLoaderService);
    });
  });

  describe("createLocalModuleLoader method", () => {
    let mockRequireFn;
    let registry;

    beforeEach(() => {
      mockRequireFn = jest.fn();
      registry = {};
      localModuleLoaderService.initialize();
    });

    it("should create a local module loader function", () => {
      const loader = localModuleLoaderService.createLocalModuleLoader("/path");
      expect(typeof loader).toBe("function");
    });

    it("should handle cached modules", async () => {
      const loader = localModuleLoaderService.createLocalModuleLoader("/path");
      
      // First call to load a module
      const result1 = await loader("test", "/base", mockRequireFn, registry);
      
      // Second call should return cached result
      const result2 = await loader("test", "/base", mockRequireFn, registry);
      
      expect(result1).toEqual(result2);
    });

    it("should use aliases and canonical paths", async () => {
      const loader = localModuleLoaderService.createLocalModuleLoader("/path");

      const result = await loader("test", "/base", mockRequireFn, registry);

      // Verify that the registry has the original name (the module was loaded)
      expect(registry["test"]).toBeDefined();
    });
  });

  describe("fetchLocalModuleSource method", () => {
    beforeEach(() => {
      localModuleLoaderService.initialize();
    });

    it("should throw an error when fetch is unavailable", async () => {
      localModuleLoaderService.fetchImpl = null;
      
      await expect(localModuleLoaderService.fetchLocalModuleSource("test.js"))
        .rejects.toThrow("Fetch unavailable for local modules");
    });

    it("should fetch module source successfully", async () => {
      const result = await localModuleLoaderService.fetchLocalModuleSource("test.js");
      
      expect(result.source).toBe('console.log("test");');
      expect(result.resolvedPath).toBe('test.js');
    });

    it("should try multiple candidate paths", async () => {
      // Mock getCandidateLocalPaths to return multiple candidates
      localModuleLoaderService.getCandidateLocalPaths = (basePath) => [`${basePath}.js`, `${basePath}.ts`];
      
      const result = await localModuleLoaderService.fetchLocalModuleSource("test");
      
      expect(result.source).toBe('console.log("test");');
      expect(result.resolvedPath).toBe('test.js');
    });

    it("should throw error when no candidate paths work", async () => {
      await expect(localModuleLoaderService.fetchLocalModuleSource("missing.js"))
        .rejects.toThrow("Failed to load local module: missing.js");
    });
  });

  describe("exports getter", () => {
    beforeEach(() => {
      localModuleLoaderService.initialize();
    });

    it("should return the public API", () => {
      const exports = localModuleLoaderService.exports;
      
      expect(typeof exports.createLocalModuleLoader).toBe("function");
      expect(typeof exports.fetchLocalModuleSource).toBe("function");
    });

    it("should bind methods to the service instance", () => {
      const exports = localModuleLoaderService.exports;
      
      // These should be bound methods
      expect(exports.createLocalModuleLoader).not.toBe(localModuleLoaderService.createLocalModuleLoader);
      expect(exports.fetchLocalModuleSource).not.toBe(localModuleLoaderService.fetchLocalModuleSource);
    });
  });

  describe("install method", () => {
    let freshService;

    beforeEach(() => {
      const config = new LocalModuleLoaderConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        fetch: mockFetch,
        dependencies: {
          logging: mockLogging,
          dynamicModules: mockDynamicModules,
          sourceUtils: mockSourceUtils,
          tsxCompiler: mockTsxCompiler,
          localPaths: mockLocalPaths
        }
      });
      
      freshService = new LocalModuleLoaderService(config);
      freshService.initialize();
    });

    it("should throw if not initialized", () => {
      const uninitializedService = new LocalModuleLoaderService(freshService.config);
      
      expect(() => uninitializedService.install()).toThrow("LocalModuleLoaderService not initialized");
    });

    it("should register the service and set up helpers", () => {
      const result = freshService.install();
      
      expect(result).toBe(freshService);
      
      // Check that service was registered
      const registered = mockServiceRegistry.registeredServices.get("localModuleLoader");
      expect(registered).toBeDefined();
      expect(registered.metadata).toEqual({
        folder: "services/local",
        domain: "local"
      });
      
      // Check that helpers were set up
      expect(mockNamespace.helpers.localModuleLoader).toBeDefined();
    });

    it("should return the instance to allow chaining", () => {
      const result = freshService.install();
      expect(result).toBe(freshService);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      // Before initialization
      expect(localModuleLoaderService.initialized).toBe(false);
      
      // Initialize
      const initResult = localModuleLoaderService.initialize();
      expect(initResult).toBe(localModuleLoaderService);
      expect(localModuleLoaderService.initialized).toBe(true);
      
      // Install
      const installResult = localModuleLoaderService.install();
      expect(installResult).toBe(localModuleLoaderService);
      
      // Verify service was registered
      expect(mockServiceRegistry.registeredServices.get("localModuleLoader")).toBeDefined();
    });

    it("should handle complete module loading flow", async () => {
      localModuleLoaderService.initialize();
      
      // Test fetchLocalModuleSource
      const sourceResult = await localModuleLoaderService.fetchLocalModuleSource("test.js");
      expect(sourceResult.source).toBe('console.log("test");');
      
      // Test createLocalModuleLoader
      const loader = localModuleLoaderService.createLocalModuleLoader("/path");
      const mockRequire = jest.fn();
      const registry = {};
      
      const moduleResult = await loader("test", "/base", mockRequire, registry);
      expect(moduleResult).toBeDefined();
    });
  });
});