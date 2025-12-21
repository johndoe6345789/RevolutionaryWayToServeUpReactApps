// Comprehensive test suite for LocalRequireBuilder class
const LocalRequireBuilder = require("../../../../../bootstrap/services/local/local-require-builder.js");

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
  return mockFn;
}

describe("LocalRequireBuilder", () => {
  let localRequireBuilder;
  let mockHelperRegistry;

  beforeEach(() => {
    mockHelperRegistry = {
      register: createMockFunction(),
      isRegistered: createMockFunction().mockReturnValue(false)
    };

    const config = {
      helperRegistry: mockHelperRegistry
    };

    localRequireBuilder = new LocalRequireBuilder(config);
  });

  describe("constructor", () => {
    test("should create an instance with provided config", () => {
      const config = { test: "value" };
      const builder = new LocalRequireBuilder(config);
      
      expect(builder).toBeInstanceOf(LocalRequireBuilder);
      expect(builder.config).toBe(config);
    });

    test("should create an instance with default config when none provided", () => {
      const builderWithDefault = new LocalRequireBuilder();
      expect(builderWithDefault).toBeInstanceOf(LocalRequireBuilder);
      expect(builderWithDefault.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    test("should properly initialize the service with required dependencies", () => {
      const mockLoadDynamicModule = createMockFunction();
      const mockIsLocalModule = createMockFunction();
      
      const result = localRequireBuilder.initialize({
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
      
      expect(result).toBe(localRequireBuilder);
      expect(localRequireBuilder.initialized).toBe(true);
      expect(localRequireBuilder.loadDynamicModule).toBe(mockLoadDynamicModule);
      expect(localRequireBuilder.isLocalModule).toBe(mockIsLocalModule);
    });

    test("should register the helper if registry is provided", () => {
      localRequireBuilder.initialize({
        loadDynamicModule: createMockFunction(),
        isLocalModule: createMockFunction()
      });
      
      expect(mockHelperRegistry.register.calls.length).toBe(1);
      expect(mockHelperRegistry.register.calls[0][0]).toBe("localRequireBuilderInstance");
      expect(mockHelperRegistry.register.calls[0][1]).toBe(localRequireBuilder);
    });

    test("should throw if initialized twice", () => {
      localRequireBuilder.initialize({
        loadDynamicModule: createMockFunction(),
        isLocalModule: createMockFunction()
      });

      expect(() => {
        localRequireBuilder.initialize({
          loadDynamicModule: createMockFunction(),
          isLocalModule: createMockFunction()
        });
      }).toThrow("LocalRequireBuilder already initialized");
    });
  });

  describe("create method", () => {
    let mockRegistry;
    let mockConfig;
    let mockLocalModuleLoader;
    let mockDynamicModuleLoader;

    beforeEach(() => {
      mockRegistry = { "test-module": "test-value" };
      mockConfig = { dynamicModules: [{ prefix: "dynamic/" }] };
      mockLocalModuleLoader = createMockFunction().mockReturnValue(Promise.resolve("local-module-value"));
      mockDynamicModuleLoader = createMockFunction().mockReturnValue(Promise.resolve("dynamic-module-value"));
      
      localRequireBuilder.initialize({
        loadDynamicModule: mockDynamicModuleLoader,
        isLocalModule: (name) => name.startsWith("local/")
      });
    });

    test("should create a require function with async capability", () => {
      const requireFn = localRequireBuilder.create({
        registry: mockRegistry,
        config: mockConfig,
        entryDir: "/test",
        localModuleLoader: mockLocalModuleLoader,
        dynamicModuleLoader: mockDynamicModuleLoader
      });
      
      expect(typeof requireFn).toBe("function");
      expect(typeof requireFn._async).toBe("function");
    });

    test("should return registered modules directly from registry", () => {
      const requireFn = localRequireBuilder.create({
        registry: mockRegistry,
        config: mockConfig,
        entryDir: "/test",
        localModuleLoader: mockLocalModuleLoader,
        dynamicModuleLoader: mockDynamicModuleLoader
      });
      
      const result = requireFn("test-module");
      expect(result).toBe("test-value");
    });

    test("should throw error for unregistered modules in sync require", () => {
      const requireFn = localRequireBuilder.create({
        registry: mockRegistry,
        config: mockConfig,
        entryDir: "/test",
        localModuleLoader: mockLocalModuleLoader,
        dynamicModuleLoader: mockDynamicModuleLoader
      });
      
      expect(() => {
        requireFn("unregistered-module");
      }).toThrow("Module not yet loaded: unregistered-module (use a preload step via requireAsync for dynamic modules)");
    });

    test("should handle local modules in async require", async () => {
      const requireFn = localRequireBuilder.create({
        registry: {},
        config: mockConfig,
        entryDir: "/test",
        localModuleLoader: mockLocalModuleLoader,
        dynamicModuleLoader: mockDynamicModuleLoader
      });
      
      const result = await requireFn._async("local/test-module");
      expect(result).toBe("local-module-value");
      expect(mockLocalModuleLoader.calls.length).toBe(1);
    });

    test("should handle dynamic modules in async require", async () => {
      const requireFn = localRequireBuilder.create({
        registry: {},
        config: mockConfig,
        entryDir: "/test",
        localModuleLoader: mockLocalModuleLoader,
        dynamicModuleLoader: mockDynamicModuleLoader
      });
      
      const result = await requireFn._async("dynamic/test-module");
      expect(result).toBe("dynamic-module-value");
      expect(mockDynamicModuleLoader.calls.length).toBe(1);
    });

    test("should throw error for unhandled modules in async require", async () => {
      const requireFn = localRequireBuilder.create({
        registry: {},
        config: mockConfig,
        entryDir: "/test",
        localModuleLoader: mockLocalModuleLoader,
        dynamicModuleLoader: mockDynamicModuleLoader
      });
      
      await expect(requireFn._async("unhandled-module")).rejects.toThrow("Module not registered: unhandled-module");
    });
  });

  describe("_createRequire method", () => {
    test("should create a require function that returns registry values", () => {
      const mockRegistry = { "test": "value" };
      localRequireBuilder.initialize({
        loadDynamicModule: createMockFunction(),
        isLocalModule: createMockFunction()
      });
      
      const requireFn = localRequireBuilder._createRequire(mockRegistry);
      expect(requireFn("test")).toBe("value");
    });

    test("should throw error for modules not in registry", () => {
      const mockRegistry = {};
      localRequireBuilder.initialize({
        loadDynamicModule: createMockFunction(),
        isLocalModule: createMockFunction()
      });
      
      const requireFn = localRequireBuilder._createRequire(mockRegistry);
      expect(() => {
        requireFn("non-existent");
      }).toThrow("Module not yet loaded: non-existent (use a preload step via requireAsync for dynamic modules)");
    });
  });

  describe("_createRequireAsync method", () => {
    test("should return registry values directly", async () => {
      const mockRegistry = { "test": "value" };
      localRequireBuilder.initialize({
        loadDynamicModule: createMockFunction(),
        isLocalModule: createMockFunction()
      });
      
      const requireAsync = localRequireBuilder._createRequireAsync({
        registry: mockRegistry,
        config: {},
        resolvedEntryDir: "/test",
        localModuleLoader: createMockFunction(),
        resolvedDynamicModuleLoader: createMockFunction(),
        requireFn: () => {}
      });
      
      const result = await requireAsync("test");
      expect(result).toBe("value");
    });

    test("should use localModuleLoader for local modules", async () => {
      const mockLocalModuleLoader = createMockFunction().mockReturnValue(Promise.resolve("local-value"));
      localRequireBuilder.initialize({
        loadDynamicModule: createMockFunction(),
        isLocalModule: (name) => name.startsWith("local/")
      });
      
      const requireAsync = localRequireBuilder._createRequireAsync({
        registry: {},
        config: {},
        resolvedEntryDir: "/test",
        localModuleLoader: mockLocalModuleLoader,
        resolvedDynamicModuleLoader: createMockFunction(),
        requireFn: () => {}
      });
      
      const result = await requireAsync("local/test");
      expect(result).toBe("local-value");
      expect(mockLocalModuleLoader.calls.length).toBe(1);
    });

    test("should use dynamicModuleLoader for dynamic modules", async () => {
      const mockDynamicModuleLoader = createMockFunction().mockReturnValue(Promise.resolve("dynamic-value"));
      localRequireBuilder.initialize({
        loadDynamicModule: mockDynamicModuleLoader,
        isLocalModule: createMockFunction()
      });
      
      const requireAsync = localRequireBuilder._createRequireAsync({
        registry: {},
        config: { dynamicModules: [{ prefix: "dynamic/" }] },
        resolvedEntryDir: "/test",
        localModuleLoader: createMockFunction(),
        resolvedDynamicModuleLoader: mockDynamicModuleLoader,
        requireFn: () => {}
      });
      
      const result = await requireAsync("dynamic/test");
      expect(result).toBe("dynamic-value");
      expect(mockDynamicModuleLoader.calls.length).toBe(1);
    });
  });

  describe("_resolveEntryDir method", () => {
    test("should resolve entry directory when provided as string", () => {
      localRequireBuilder.initialize({
        loadDynamicModule: createMockFunction(),
        isLocalModule: createMockFunction()
      });
      
      const result = localRequireBuilder._resolveEntryDir("/test", createMockFunction(), 2);
      expect(result.resolvedEntryDir).toBe("/test");
    });

    test("should handle entryDir as function with correct argument count", () => {
      const mockFunction = createMockFunction();
      localRequireBuilder.initialize({
        loadDynamicModule: createMockFunction(),
        isLocalModule: createMockFunction()
      });
      
      const result = localRequireBuilder._resolveEntryDir(mockFunction, null, 3);
      expect(result.resolvedDynamicModuleLoader).toBe(mockFunction);
      expect(result.resolvedEntryDir).toBe("");
    });

    test("should use default dynamic module loader when none provided", () => {
      const mockLoadDynamicModule = createMockFunction();
      localRequireBuilder.loadDynamicModule = mockLoadDynamicModule;
      
      const result = localRequireBuilder._resolveEntryDir("/test", null, 2);
      expect(result.resolvedDynamicModuleLoader).toBe(mockLoadDynamicModule);
    });
  });

  describe("_isLocalModule method", () => {
    test("should return true for local modules", () => {
      const mockIsLocalModule = (name) => name.startsWith("local/");
      localRequireBuilder.isLocalModule = mockIsLocalModule;
      
      expect(localRequireBuilder._isLocalModule("local/test")).toBe(true);
    });

    test("should return false for non-local modules", () => {
      const mockIsLocalModule = (name) => name.startsWith("local/");
      localRequireBuilder.isLocalModule = mockIsLocalModule;
      
      expect(localRequireBuilder._isLocalModule("remote/test")).toBe(false);
    });

    test("should return false when isLocalModule is not a function", () => {
      localRequireBuilder.isLocalModule = null;
      
      expect(localRequireBuilder._isLocalModule("test")).toBe(false);
    });
  });

  describe("integration", () => {
    test("should work through full lifecycle", () => {
      const mockLoadDynamicModule = createMockFunction();
      const mockIsLocalModule = (name) => name.startsWith("local/");
      
      // Initialize the service
      const initializedService = localRequireBuilder.initialize({
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
      
      expect(initializedService).toBe(localRequireBuilder);
      expect(localRequireBuilder.initialized).toBe(true);
      
      // Create a require function
      const requireFn = localRequireBuilder.create({
        registry: { "test": "value" },
        config: { dynamicModules: [{ prefix: "dynamic/" }] },
        entryDir: "/test",
        localModuleLoader: createMockFunction().mockReturnValue(Promise.resolve("local-value")),
        dynamicModuleLoader: createMockFunction().mockReturnValue(Promise.resolve("dynamic-value"))
      });
      
      // Test that the require function works
      expect(requireFn("test")).toBe("value");
      expect(typeof requireFn._async).toBe("function");
    });
  });
});