import LocalRequireBuilder from "../../bootstrap/services/local/local-require-builder.js";
import LocalRequireBuilderConfig from "../../bootstrap/configs/local/local-require-builder.js";

// Create a mock helper registry for testing
class MockHelperRegistry {
  constructor() {
    this._helpers = new Map();
    this._metadata = new Map();
  }

  register(name, helper, metadata = {}) {
    if (this._helpers.has(name)) {
      throw new Error(`Helper already registered: ${name}`);
    }
    this._helpers.set(name, helper);
    this._metadata.set(name, metadata);
  }

  getHelper(name) {
    return this._helpers.get(name);
  }

  isRegistered(name) {
    return this._helpers.has(name);
  }

  getMetadata(name) {
    return this._metadata.get(name);
  }

  listHelpers() {
    return Array.from(this._helpers.keys());
  }
}

describe("LocalRequireBuilder", () => {
  let localRequireBuilder;
  let mockRegistry;

  beforeEach(() => {
    mockRegistry = new MockHelperRegistry();
    localRequireBuilder = new LocalRequireBuilder();
  });

  describe("constructor", () => {
    it("should create an instance with provided config", () => {
      const config = new LocalRequireBuilderConfig();
      config.helperRegistry = mockRegistry;
      const builder = new LocalRequireBuilder(config);

      expect(builder.config).toBe(config);
      expect(builder.initialized).toBe(false);
    });

    it("should create an instance with default config when none provided", () => {
      const builder = new LocalRequireBuilder();

      expect(builder.config).toBeInstanceOf(LocalRequireBuilderConfig);
      expect(builder.initialized).toBe(false);
    });

    it("should inherit from BaseHelper", () => {
      expect(localRequireBuilder).toBeInstanceOf(require("../../bootstrap/helpers/base-helper.js"));
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties", () => {
      const mockLoadDynamicModule = () => {};
      const mockIsLocalModule = () => {};
      const config = new LocalRequireBuilderConfig();
      config.helperRegistry = mockRegistry;
      const builder = new LocalRequireBuilder(config);

      const result = builder.initialize({
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });

      expect(result).toBe(builder);
      expect(builder.loadDynamicModule).toBe(mockLoadDynamicModule);
      expect(builder.isLocalModule).toBe(mockIsLocalModule);
      expect(builder.initialized).toBe(true);
    });

    it("should register itself with the helper registry", () => {
      const config = new LocalRequireBuilderConfig();
      config.helperRegistry = mockRegistry;
      const builder = new LocalRequireBuilder(config);

      builder.initialize({
        loadDynamicModule: jest.fn(),
        isLocalModule: jest.fn()
      });

      expect(mockRegistry.isRegistered("localRequireBuilderInstance")).toBe(true);
      expect(mockRegistry.getHelper("localRequireBuilderInstance")).toBe(builder);
      expect(mockRegistry.getMetadata("localRequireBuilderInstance")).toEqual({
        folder: "services/local/helpers",
        domain: "helpers",
      });
    });

    it("should throw if already initialized", () => {
      const config = new LocalRequireBuilderConfig();
      config.helperRegistry = mockRegistry;
      const builder = new LocalRequireBuilder(config);

      builder.initialize({
        loadDynamicModule: () => {},
        isLocalModule: () => {}
      });

      expect(() => {
        builder.initialize({
          loadDynamicModule: () => {},
          isLocalModule: () => {}
        });
      }).toThrow("LocalRequireBuilder already initialized");
    });

    it("should not register if no helper registry is provided", () => {
      const config = new LocalRequireBuilderConfig();
      // Don't set helperRegistry
      const builder = new LocalRequireBuilder(config);

      builder.initialize({
        loadDynamicModule: () => {},
        isLocalModule: () => {}
      });

      // Should still be initialized but not registered
      expect(builder.initialized).toBe(true);
    });
  });

  describe("create method", () => {
    let initializedBuilder;

    beforeEach(() => {
      const config = new LocalRequireBuilderConfig();
      config.helperRegistry = mockRegistry;
      initializedBuilder = new LocalRequireBuilder(config);
      initializedBuilder.initialize({
        loadDynamicModule: () => {},
        isLocalModule: () => {}
      });
    });

    it("should throw if not initialized", () => {
      const uninitializedBuilder = new LocalRequireBuilder();

      expect(() => {
        uninitializedBuilder.create({
          registry: {},
          config: {},
          entryDir: "",
          localModuleLoader: () => {},
          dynamicModuleLoader: () => {}
        });
      }).toThrow("LocalRequireBuilder not initialized");
    });

    it("should create a require function with async method", () => {
      const registry = { module1: "module1-content" };
      const requireFn = initializedBuilder.create({
        registry,
        config: {},
        entryDir: "",
        localModuleLoader: () => {},
        dynamicModuleLoader: () => {}
      });

      expect(typeof requireFn).toBe("function");
      expect(typeof requireFn._async).toBe("function");
    });

    it("should return existing modules from registry", () => {
      const registry = { module1: "module1-content" };
      const requireFn = initializedBuilder.create({
        registry,
        config: {},
        entryDir: "",
        localModuleLoader: () => {},
        dynamicModuleLoader: () => {}
      });

      const result = requireFn("module1");
      expect(result).toBe("module1-content");
    });

    it("should throw error for missing modules", () => {
      const registry = { module1: "module1-content" };
      const requireFn = initializedBuilder.create({
        registry,
        config: {},
        entryDir: "",
        localModuleLoader: () => {},
        dynamicModuleLoader: () => {}
      });

      expect(() => {
        requireFn("missing-module");
      }).toThrow("Module not yet loaded: missing-module (use a preload step via requireAsync for dynamic modules)");
    });
  });

  describe("_createRequire method", () => {
    it("should return a function that retrieves modules from registry", () => {
      const registry = { testModule: "test-content" };
      const requireFn = localRequireBuilder._createRequire(registry);

      expect(requireFn("testModule")).toBe("test-content");
    });

    it("should throw error when module is not in registry", () => {
      const registry = { testModule: "test-content" };
      const requireFn = localRequireBuilder._createRequire(registry);

      expect(() => {
        requireFn("missing-module");
      }).toThrow("Module not yet loaded: missing-module (use a preload step via requireAsync for dynamic modules)");
    });
  });

  describe("_createRequireAsync method", () => {
    let initializedBuilder;
    let initializedBuilderForDynamic;

    beforeEach(() => {
      const config = new LocalRequireBuilderConfig();
      config.helperRegistry = mockRegistry;

      // Initialize one builder for local modules
      initializedBuilder = new LocalRequireBuilder(config);
      initializedBuilder.initialize({
        loadDynamicModule: () => {},
        isLocalModule: () => true // Mock isLocalModule to return true
      });

      // Initialize another builder for dynamic modules
      const config2 = new LocalRequireBuilderConfig();
      config2.helperRegistry = mockRegistry;
      initializedBuilderForDynamic = new LocalRequireBuilder(config2);
      initializedBuilderForDynamic.initialize({
        loadDynamicModule: () => {},
        isLocalModule: (name) => name.startsWith('.') || name.startsWith('/') // Only actual local modules
      });
    });

    it("should return a function that retrieves modules from registry", async () => {
      const registry = { testModule: "test-content" };
      const config = {};
      const requireFn = () => {};
      const requireAsync = initializedBuilder._createRequireAsync({
        registry,
        config,
        resolvedEntryDir: "",
        localModuleLoader: () => {},
        resolvedDynamicModuleLoader: () => {},
        requireFn
      });

      const result = await requireAsync("testModule");
      expect(result).toBe("test-content");
    });

    it("should use localModuleLoader for local modules", async () => {
      const registry = {};
      const config = {};
      const requireFn = () => {};
      let callArgs = null;
      const localModuleLoader = async (name, baseDir, fn, reg) => {
        callArgs = { name, baseDir, fn, reg };
        return "loaded-content";
      };

      const requireAsync = initializedBuilder._createRequireAsync({
        registry,
        config,
        resolvedEntryDir: "/path",
        localModuleLoader,
        resolvedDynamicModuleLoader: () => {},
        requireFn
      });

      const result = await requireAsync("./local-module", "/base");

      // Check that the localModuleLoader was called with correct arguments
      expect(callArgs.name).toBe("./local-module");
      expect(callArgs.baseDir).toBe("/base");
      expect(callArgs.fn).toBe(requireFn);
      expect(callArgs.reg).toBe(registry);
      expect(result).toBe("loaded-content");
    });

    it("should use dynamicModuleLoader for dynamic modules", async () => {
      const registry = {};
      const config = {
        dynamicModules: [{ prefix: "dynamic:" }]
      };
      const requireFn = () => {};
      let callArgs = null;
      const dynamicModuleLoader = async (name, cfg, reg) => {
        callArgs = { name, cfg, reg };
        return "dynamic-content";
      };

      const requireAsync = initializedBuilderForDynamic._createRequireAsync({
        registry,
        config,
        resolvedEntryDir: "",
        localModuleLoader: () => {},
        resolvedDynamicModuleLoader: dynamicModuleLoader,
        requireFn
      });

      const result = await requireAsync("dynamic:module");

      // Check that the dynamicModuleLoader was called with correct arguments
      expect(callArgs.name).toBe("dynamic:module");
      expect(callArgs.cfg).toBe(config);
      expect(callArgs.reg).toBe(registry);
      expect(result).toBe("dynamic-content");
    });

    it("should throw error for unregistered modules", async () => {
      const registry = {};
      const config = {};
      const requireFn = () => {};
      // Use a localModuleLoader that doesn't interfere
      const localModuleLoader = async (name, baseDir, fn, reg) => {
        // This won't be called since isLocalModule will return false for "unregistered-module"
        return "local-content";
      };
      const requireAsync = initializedBuilderForDynamic._createRequireAsync({
        registry,
        config,
        resolvedEntryDir: "",
        localModuleLoader,
        resolvedDynamicModuleLoader: () => {},
        requireFn
      });

      await expect(requireAsync("unregistered-module")).rejects.toThrow(
        "Module not registered: unregistered-module"
      );
    });
  });

  describe("_resolveEntryDir method", () => {
    it("should return provided entryDir and dynamicModuleLoader when normal arguments", () => {
      const mockDynamicModuleLoader = () => {};
      const result = localRequireBuilder._resolveEntryDir("/path", mockDynamicModuleLoader, 2);

      expect(result.resolvedEntryDir).toBe("/path");
      expect(result.resolvedDynamicModuleLoader).toBe(mockDynamicModuleLoader);
    });

    it("should handle case when entryDir is a function and argumentCount is 3", () => {
      const dynamicModuleLoader = () => {};
      const result = localRequireBuilder._resolveEntryDir(dynamicModuleLoader, undefined, 3);

      expect(result.resolvedEntryDir).toBe("");
      expect(result.resolvedDynamicModuleLoader).toBe(dynamicModuleLoader);
    });

    it("should default resolvedEntryDir to empty string when entryDir is not provided", () => {
      const result = localRequireBuilder._resolveEntryDir(undefined, jest.fn(), 2);
      
      expect(result.resolvedEntryDir).toBe("");
    });

    it("should use loadDynamicModule as fallback when no dynamicModuleLoader provided", () => {
      const mockLoadDynamicModule = jest.fn();
      localRequireBuilder.loadDynamicModule = mockLoadDynamicModule;
      
      const result = localRequireBuilder._resolveEntryDir("/path", undefined, 2);
      
      expect(result.resolvedDynamicModuleLoader).toBe(mockLoadDynamicModule);
    });
  });

  describe("_isLocalModule method", () => {
    it("should return result of isLocalModule function when it exists", () => {
      const mockIsLocalModule = jest.fn().mockReturnValue(true);
      localRequireBuilder.isLocalModule = mockIsLocalModule;
      
      const result = localRequireBuilder._isLocalModule("./test.js");
      
      expect(mockIsLocalModule).toHaveBeenCalledWith("./test.js");
      expect(result).toBe(true);
    });

    it("should return false when isLocalModule is not a function", () => {
      localRequireBuilder.isLocalModule = "not-a-function";
      
      const result = localRequireBuilder._isLocalModule("./test.js");
      
      expect(result).toBe(false);
    });

    it("should return false when isLocalModule is undefined", () => {
      localRequireBuilder.isLocalModule = undefined;
      
      const result = localRequireBuilder._isLocalModule("./test.js");
      
      expect(result).toBe(false);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      const config = new LocalRequireBuilderConfig();
      config.helperRegistry = mockRegistry;
      const builder = new LocalRequireBuilder(config);

      // Initialize
      const loadDynamicModule = jest.fn();
      const isLocalModule = jest.fn().mockReturnValue(true);
      builder.initialize({ loadDynamicModule, isLocalModule });

      expect(builder.initialized).toBe(true);
      expect(builder.loadDynamicModule).toBe(loadDynamicModule);
      expect(builder.isLocalModule).toBe(isLocalModule);

      // Verify registration
      expect(mockRegistry.isRegistered("localRequireBuilderInstance")).toBe(true);

      // Create require function
      const registry = { testModule: "content" };
      const requireFn = builder.create({
        registry,
        config: {},
        entryDir: "",
        localModuleLoader: jest.fn(),
        dynamicModuleLoader: jest.fn()
      });

      // Test require function
      expect(requireFn("testModule")).toBe("content");
      expect(typeof requireFn._async).toBe("function");
    });

    it("should handle complete require creation flow", async () => {
      const config = new LocalRequireBuilderConfig();
      config.helperRegistry = mockRegistry;
      const builder = new LocalRequireBuilder(config);

      // Initialize with mock functions for local modules
      const mockLoadDynamicModule = () => {};
      const mockIsLocalModule = (name) => name.startsWith('.') || name.startsWith('/') || name.startsWith('local:');
      const builder2 = new LocalRequireBuilder(new LocalRequireBuilderConfig());
      builder2.config.helperRegistry = mockRegistry;
      builder2.initialize({
        loadDynamicModule: mockLoadDynamicModule,
        isLocalModule: mockIsLocalModule
      });

      // Create require function with all dependencies
      const registry = { existingModule: "existing-content" };
      let localModuleCallArgs = null;
      const localModuleLoader = async (name, baseDir, fn, reg) => {
        localModuleCallArgs = { name, baseDir, fn, reg };
        return "local-content";
      };
      let dynamicModuleCallArgs = null;
      const dynamicModuleLoader = async (name, cfg, reg) => {
        dynamicModuleCallArgs = { name, cfg, reg };
        return "dynamic-content";
      };

      const requireFn = builder2.create({
        registry,
        config: { dynamicModules: [{ prefix: "dynamic:" }] },
        entryDir: "/base/path",
        localModuleLoader,
        dynamicModuleLoader,
        argumentCount: 2
      });

      // Test sync require
      expect(requireFn("existingModule")).toBe("existing-content");

      // Test async require for existing module
      const asyncResult = await requireFn._async("existingModule");
      expect(asyncResult).toBe("existing-content");

      // Test async require for local module
      const localResult = await requireFn._async("./local-module", "/base");
      expect(localModuleCallArgs.name).toBe("./local-module");
      expect(localModuleCallArgs.baseDir).toBe("/base");
      expect(localModuleCallArgs.fn).toBe(requireFn);
      expect(localModuleCallArgs.reg).toBe(registry);
      expect(localResult).toBe("local-content");

      // Test async require for dynamic module
      const dynamicResult = await requireFn._async("dynamic:module");
      expect(dynamicModuleCallArgs.name).toBe("dynamic:module");
      expect(dynamicModuleCallArgs.cfg).toEqual({ dynamicModules: [{ prefix: "dynamic:" }] });
      expect(dynamicModuleCallArgs.reg).toBe(registry);
      expect(dynamicResult).toBe("dynamic-content");
    });
  });
});