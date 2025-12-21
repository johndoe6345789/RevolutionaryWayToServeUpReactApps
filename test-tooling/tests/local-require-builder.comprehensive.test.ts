import LocalRequireBuilder from "../../bootstrap/services/local/local-require-builder.js";

describe("LocalRequireBuilder", () => {
  let localRequireBuilder;
  let mockHelperRegistry;

  beforeEach(() => {
    mockHelperRegistry = {
      register: jest.fn(),
      get: jest.fn(),
      isRegistered: jest.fn().mockReturnValue(false),
    };
    
    const config = new LocalRequireBuilder.Config({ helperRegistry: mockHelperRegistry });
    localRequireBuilder = new LocalRequireBuilder(config);
  });

  describe("constructor", () => {
    it("should create an instance with provided config", () => {
      expect(localRequireBuilder).toBeInstanceOf(LocalRequireBuilder);
      expect(localRequireBuilder.config).toBeDefined();
    });

    it("should create an instance with default config when none provided", () => {
      const builder = new LocalRequireBuilder();
      expect(builder).toBeInstanceOf(LocalRequireBuilder);
      expect(builder.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      const mockLoadDynamicModule = jest.fn();
      const mockIsLocalModule = jest.fn();
      
      const result = localRequireBuilder.initialize({
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
      
      expect(localRequireBuilder.loadDynamicModule).toBe(mockLoadDynamicModule);
      expect(localRequireBuilder.isLocalModule).toBe(mockIsLocalModule);
      expect(localRequireBuilder.initialized).toBe(true);
      expect(result).toBe(localRequireBuilder);
    });

    it("should register itself with the helper registry", () => {
      const mockLoadDynamicModule = jest.fn();
      const mockIsLocalModule = jest.fn();
      
      localRequireBuilder.initialize({
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
      
      expect(mockHelperRegistry.register).toHaveBeenCalledWith(
        "localRequireBuilderInstance",
        localRequireBuilder,
        { folder: "services/local/helpers", domain: "helpers" }
      );
    });

    it("should throw if already initialized", () => {
      const mockLoadDynamicModule = jest.fn();
      const mockIsLocalModule = jest.fn();
      
      localRequireBuilder.initialize({
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
      
      expect(() => {
        localRequireBuilder.initialize({
          loadDynamicModule: mockLoadDynamicModule,
          isLocalModule: mockIsLocalModule
        });
      }).toThrow("LocalRequireBuilder already initialized");
    });

    it("should not register if no helper registry is provided", () => {
      const config = new LocalRequireBuilder.Config({ helperRegistry: undefined });
      const builder = new LocalRequireBuilder(config);
      
      const mockLoadDynamicModule = jest.fn();
      const mockIsLocalModule = jest.fn();
      
      builder.initialize({
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
      
      expect(mockHelperRegistry.register).not.toHaveBeenCalled();
    });
  });

  describe("create method", () => {
    beforeEach(() => {
      const mockLoadDynamicModule = jest.fn();
      const mockIsLocalModule = jest.fn();
      localRequireBuilder.initialize({
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
    });

    it("should throw if not initialized", () => {
      const uninitializedBuilder = new LocalRequireBuilder();
      
      expect(() => {
        uninitializedBuilder.create({});
      }).toThrow("LocalRequireBuilder not initialized");
    });

    it("should create a require function with async method", () => {
      const registry = { testModule: "testValue" };
      const config = {};
      const entryDir = "";
      const localModuleLoader = jest.fn();
      const dynamicModuleLoader = jest.fn();
      
      const requireFn = localRequireBuilder.create({
        registry,
        config,
        entryDir,
        localModuleLoader,
        dynamicModuleLoader
      });
      
      expect(typeof requireFn).toBe("function");
      expect(typeof requireFn._async).toBe("function");
    });

    it("should return existing modules from registry", () => {
      const registry = { existingModule: "exists" };
      const config = {};
      const entryDir = "";
      const localModuleLoader = jest.fn();
      const dynamicModuleLoader = jest.fn();
      
      const requireFn = localRequireBuilder.create({
        registry,
        config,
        entryDir,
        localModuleLoader,
        dynamicModuleLoader
      });
      
      const result = requireFn("existingModule");
      expect(result).toBe("exists");
    });

    it("should throw error for missing modules", () => {
      const registry = {};
      const config = {};
      const entryDir = "";
      const localModuleLoader = jest.fn();
      const dynamicModuleLoader = jest.fn();
      
      const requireFn = localRequireBuilder.create({
        registry,
        config,
        entryDir,
        localModuleLoader,
        dynamicModuleLoader
      });
      
      expect(() => {
        requireFn("missingModule");
      }).toThrow("Module not yet loaded: missingModule (use a preload step via requireAsync for dynamic modules)");
    });
  });

  describe("_createRequire method", () => {
    it("should return a function that retrieves modules from registry", () => {
      const registry = { module1: "value1", module2: "value2" };
      const requireFn = localRequireBuilder._createRequire(registry);
      
      expect(requireFn("module1")).toBe("value1");
      expect(requireFn("module2")).toBe("value2");
    });

    it("should throw error when module is not in registry", () => {
      const registry = { module1: "value1" };
      const requireFn = localRequireBuilder._createRequire(registry);
      
      expect(() => {
        requireFn("missingModule");
      }).toThrow("Module not yet loaded: missingModule (use a preload step via requireAsync for dynamic modules)");
    });
  });

  describe("_createRequireAsync method", () => {
    beforeEach(() => {
      const mockLoadDynamicModule = jest.fn();
      const mockIsLocalModule = jest.fn().mockReturnValue(false);
      localRequireBuilder.initialize({
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
    });

    it("should return a function that retrieves modules from registry", async () => {
      const registry = { asyncModule: "asyncValue" };
      const requireAsync = localRequireBuilder._createRequireAsync({
        registry,
        config: {},
        resolvedEntryDir: "",
        localModuleLoader: jest.fn(),
        resolvedDynamicModuleLoader: jest.fn(),
        requireFn: jest.fn()
      });
      
      const result = await requireAsync("asyncModule");
      expect(result).toBe("asyncValue");
    });

    it("should use localModuleLoader for local modules", async () => {
      const mockIsLocalModule = jest.fn().mockReturnValue(true);
      localRequireBuilder.isLocalModule = mockIsLocalModule;
      
      const registry = {};
      const mockLocalModuleLoader = jest.fn().mockResolvedValue("loadedModule");
      const requireAsync = localRequireBuilder._createRequireAsync({
        registry,
        config: {},
        resolvedEntryDir: "",
        localModuleLoader: mockLocalModuleLoader,
        resolvedDynamicModuleLoader: jest.fn(),
        requireFn: jest.fn()
      });
      
      const result = await requireAsync("localModule");
      
      expect(mockIsLocalModule).toHaveBeenCalledWith("localModule");
      expect(mockLocalModuleLoader).toHaveBeenCalledWith(
        "localModule",
        "",
        expect.any(Function),
        registry
      );
      expect(result).toBe("loadedModule");
    });

    it("should use dynamicModuleLoader for dynamic modules", async () => {
      const registry = {};
      const mockDynamicModuleLoader = jest.fn().mockResolvedValue("dynamicModule");
      const config = { dynamicModules: [{ prefix: "dynamic:" }] };
      const requireAsync = localRequireBuilder._createRequireAsync({
        registry,
        config,
        resolvedEntryDir: "",
        localModuleLoader: jest.fn(),
        resolvedDynamicModuleLoader: mockDynamicModuleLoader,
        requireFn: jest.fn()
      });
      
      const result = await requireAsync("dynamic:testModule");
      
      expect(mockDynamicModuleLoader).toHaveBeenCalledWith("dynamic:testModule", config, registry);
      expect(result).toBe("dynamicModule");
    });

    it("should throw error for unregistered modules", async () => {
      const registry = {};
      const requireAsync = localRequireBuilder._createRequireAsync({
        registry,
        config: {},
        resolvedEntryDir: "",
        localModuleLoader: jest.fn(),
        resolvedDynamicModuleLoader: jest.fn(),
        requireFn: jest.fn()
      });
      
      await expect(requireAsync("unknownModule")).rejects.toThrow("Module not registered: unknownModule");
    });
  });

  describe("_resolveEntryDir method", () => {
    it("should return provided entryDir and dynamicModuleLoader when normal arguments", () => {
      const result = localRequireBuilder._resolveEntryDir("someDir", "loader", 0);
      
      expect(result.resolvedEntryDir).toBe("someDir");
      expect(result.resolvedDynamicModuleLoader).toBe("loader");
    });

    it("should handle case when entryDir is a function and argumentCount is 3", () => {
      const mockFunction = jest.fn();
      const result = localRequireBuilder._resolveEntryDir(mockFunction, "loader", 3);
      
      expect(result.resolvedEntryDir).toBe("");
      expect(result.resolvedDynamicModuleLoader).toBe(mockFunction);
    });

    it("should default resolvedEntryDir to empty string when entryDir is not provided", () => {
      const result = localRequireBuilder._resolveEntryDir(undefined, "loader", 0);
      
      expect(result.resolvedEntryDir).toBe("");
      expect(result.resolvedDynamicModuleLoader).toBe("loader");
    });

    it("should use loadDynamicModule as fallback when no dynamicModuleLoader provided", () => {
      const mockLoadDynamicModule = jest.fn();
      localRequireBuilder.loadDynamicModule = mockLoadDynamicModule;
      
      const result = localRequireBuilder._resolveEntryDir("dir", undefined, 0);
      
      expect(result.resolvedEntryDir).toBe("dir");
      expect(result.resolvedDynamicModuleLoader).toBe(mockLoadDynamicModule);
    });
  });

  describe("_isLocalModule method", () => {
    it("should return result of isLocalModule function when it exists", () => {
      const mockIsLocalModule = jest.fn().mockReturnValue(true);
      localRequireBuilder.isLocalModule = mockIsLocalModule;
      
      const result = localRequireBuilder._isLocalModule("testModule");
      
      expect(mockIsLocalModule).toHaveBeenCalledWith("testModule");
      expect(result).toBe(true);
    });

    it("should return false when isLocalModule is not a function", () => {
      localRequireBuilder.isLocalModule = null;
      
      const result = localRequireBuilder._isLocalModule("testModule");
      
      expect(result).toBe(false);
    });

    it("should return false when isLocalModule is undefined", () => {
      localRequireBuilder.isLocalModule = undefined;
      
      const result = localRequireBuilder._isLocalModule("testModule");
      
      expect(result).toBe(false);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      const mockLoadDynamicModule = jest.fn();
      const mockIsLocalModule = jest.fn().mockReturnValue(false);
      
      expect(localRequireBuilder.initialized).toBe(false);
      
      const result = localRequireBuilder.initialize({
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
      
      expect(result).toBe(localRequireBuilder);
      expect(localRequireBuilder.initialized).toBe(true);
      expect(localRequireBuilder.loadDynamicModule).toBe(mockLoadDynamicModule);
      expect(localRequireBuilder.isLocalModule).toBe(mockIsLocalModule);
    });

    it("should handle complete require creation flow", () => {
      const mockLoadDynamicModule = jest.fn();
      const mockIsLocalModule = jest.fn().mockReturnValue(false);
      
      localRequireBuilder.initialize({
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });
      
      const registry = { existingModule: "value" };
      const config = {};
      const entryDir = "";
      const localModuleLoader = jest.fn();
      const dynamicModuleLoader = jest.fn();
      
      const requireFn = localRequireBuilder.create({
        registry,
        config,
        entryDir,
        localModuleLoader,
        dynamicModuleLoader
      });
      
      // Test synchronous require
      expect(requireFn("existingModule")).toBe("value");
      
      // Test async require
      expect(typeof requireFn._async).toBe("function");
    });
  });
});