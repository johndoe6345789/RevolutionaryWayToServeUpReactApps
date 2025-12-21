import Bootstrapper from "../../bootstrap/controllers/bootstrapper.js";
import BootstrapperConfig from "../../bootstrap/configs/core/bootstrapper.js";

// Mock dependencies
jest.mock("../../bootstrap/configs/core/bootstrapper.js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((config) => config)
  };
});

// Create a mock GlobalRootHandler that simulates both browser and non-browser environments
const createMockGlobalRootHandler = (hasDocument = true, hasWindow = true) => {
  return {
    hasDocument: jest.fn().mockReturnValue(hasDocument),
    hasWindow: jest.fn().mockReturnValue(hasWindow),
    getDocument: jest.fn().mockReturnValue(hasDocument ? { getElementById: jest.fn() } : null),
    getFetch: jest.fn().mockReturnValue(
      jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ entry: "main.tsx" })
      })
    ),
    root: hasWindow ? { document: hasDocument ? {} : undefined } : undefined,
    getNamespace: jest.fn().mockReturnValue({}),
  };
};

// Mock the global root handler at the module level
jest.mock("../../bootstrap/constants/global-root-handler.js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => createMockGlobalRootHandler())
  };
});

describe("Bootstrapper", () => {
  let mockConfig;
  let mockLogging;
  let mockNetwork;
  let mockModuleLoader;
  let originalConsoleError;
  let originalWindow;
  let originalDocument;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Store original window/document to restore later
    originalWindow = global.window;
    originalDocument = global.document;
  });

  afterAll(() => {
    console.error = originalConsoleError;
    
    // Restore original window/document
    global.window = originalWindow;
    global.document = originalDocument;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockLogging = {
      setCiLoggingEnabled: jest.fn(),
      detectCiLogging: jest.fn().mockReturnValue(false),
      logClient: jest.fn(),
      isCiLoggingEnabled: jest.fn().mockReturnValue(false),
      serializeForLog: jest.fn()
    };
    
    mockNetwork = {
      setFallbackProviders: jest.fn(),
      setDefaultProviderBase: jest.fn(),
      setProviderAliases: jest.fn(),
      normalizeProviderBase: jest.fn(),
      probeUrl: jest.fn(),
      resolveModuleUrl: jest.fn()
    };
    
    mockModuleLoader = {
      loadTools: jest.fn().mockResolvedValue([]),
      compileSCSS: jest.fn().mockResolvedValue("css content"),
      injectCSS: jest.fn(),
      loadModules: jest.fn().mockResolvedValue({}),
      createLocalModuleLoader: jest.fn(),
      createRequire: jest.fn(),
      compileTSX: jest.fn().mockResolvedValue({}),
      frameworkRender: jest.fn(),
      loadScript: jest.fn()
    };
    
    mockConfig = {
      logging: mockLogging,
      network: mockNetwork,
      moduleLoader: mockModuleLoader,
      fetch: jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ entry: "main.tsx" })
      })
    };
  });

  describe("constructor", () => {
    it("should initialize with valid config", () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      
      expect(bootstrapper).toBeInstanceOf(Bootstrapper);
      expect(bootstrapper.config).toBe(mockConfig);
    });

    it("should initialize with BootstrapperConfig instance", () => {
      const configInstance = new BootstrapperConfig(mockConfig);
      const bootstrapper = new Bootstrapper(configInstance);
      
      expect(bootstrapper).toBeInstanceOf(Bootstrapper);
      expect(bootstrapper.config).toBe(configInstance);
    });

    it("should set up internal properties", () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      
      expect(bootstrapper.cachedConfigPromise).toBeNull();
      expect(bootstrapper.fetchImpl).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should set up internal properties and mark as initialized", () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      expect(bootstrapper.logging).toBe(mockLogging);
      expect(bootstrapper.network).toBe(mockNetwork);
      expect(bootstrapper.moduleLoader).toBe(mockModuleLoader);
      expect(bootstrapper.setCiLoggingEnabled).toBe(mockLogging.setCiLoggingEnabled);
      expect(bootstrapper.detectCiLogging).toBe(mockLogging.detectCiLogging);
      expect(bootstrapper.logClient).toBe(mockLogging.logClient);
      expect(bootstrapper.isCiLoggingEnabled).toBe(mockLogging.isCiLoggingEnabled);
      expect(bootstrapper.initialized).toBe(true);
    });

    it("should throw if already initialized", () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      expect(() => bootstrapper.initialize()).toThrow(/already initialized/);
    });
  });

  describe("_bootstrap method", () => {
    it("should execute the full bootstrap workflow", async () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      // Mock the internal methods
      const loadConfigSpy = jest.spyOn(bootstrapper, 'loadConfig').mockResolvedValue({ entry: "main.tsx" });
      const configureProvidersSpy = jest.spyOn(bootstrapper, '_configureProviders');
      const prepareAssetsSpy = jest.spyOn(bootstrapper, '_prepareAssets').mockResolvedValue();
      const prepareModulesSpy = jest.spyOn(bootstrapper, '_prepareModules').mockResolvedValue({
        registry: {},
        entryDir: "",
        requireFn: jest.fn()
      });
      const compileAndRenderSpy = jest.spyOn(bootstrapper, '_compileAndRender').mockResolvedValue();
      
      await bootstrapper._bootstrap();
      
      expect(loadConfigSpy).toHaveBeenCalled();
      expect(configureProvidersSpy).toHaveBeenCalled();
      expect(prepareAssetsSpy).toHaveBeenCalledWith("styles.scss", undefined);
      expect(prepareModulesSpy).toHaveBeenCalledWith("main.tsx", { entry: "main.tsx" });
      expect(compileAndRenderSpy).toHaveBeenCalled();
    });

    it("should use default entry and scss files", async () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      jest.spyOn(bootstrapper, 'loadConfig').mockResolvedValue({});
      jest.spyOn(bootstrapper, '_configureProviders');
      const prepareAssetsSpy = jest.spyOn(bootstrapper, '_prepareAssets').mockResolvedValue();
      const prepareModulesSpy = jest.spyOn(bootstrapper, '_prepareModules').mockResolvedValue({
        registry: {},
        entryDir: "",
        requireFn: jest.fn()
      });
      jest.spyOn(bootstrapper, '_compileAndRender').mockResolvedValue();
      
      await bootstrapper._bootstrap();
      
      expect(prepareAssetsSpy).toHaveBeenCalledWith("styles.scss", undefined);
      expect(prepareModulesSpy).toHaveBeenCalledWith("main.tsx", {});
    });

    it("should use custom entry and scss files from config", async () => {
      const customConfig = { entry: "custom.tsx", styles: "custom.scss" };
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      jest.spyOn(bootstrapper, 'loadConfig').mockResolvedValue(customConfig);
      jest.spyOn(bootstrapper, '_configureProviders');
      const prepareAssetsSpy = jest.spyOn(bootstrapper, '_prepareAssets').mockResolvedValue();
      const prepareModulesSpy = jest.spyOn(bootstrapper, '_prepareModules').mockResolvedValue({
        registry: {},
        entryDir: "",
        requireFn: jest.fn()
      });
      jest.spyOn(bootstrapper, '_compileAndRender').mockResolvedValue();
      
      await bootstrapper._bootstrap();
      
      expect(prepareAssetsSpy).toHaveBeenCalledWith("custom.scss", undefined);
      expect(prepareModulesSpy).toHaveBeenCalledWith("custom.tsx", customConfig);
    });
  });

  describe("_prepareAssets method", () => {
    it("should load tools and compile/inject styles", async () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      await bootstrapper._prepareAssets("styles.scss", ["tool1", "tool2"]);
      
      expect(mockModuleLoader.loadTools).toHaveBeenCalledWith(["tool1", "tool2"]);
      expect(mockModuleLoader.compileSCSS).toHaveBeenCalledWith("styles.scss");
      expect(mockModuleLoader.injectCSS).toHaveBeenCalledWith("css content");
    });

    it("should handle missing tools", async () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      await bootstrapper._prepareAssets("styles.scss");
      
      expect(mockModuleLoader.loadTools).toHaveBeenCalledWith([]);
      expect(mockModuleLoader.compileSCSS).toHaveBeenCalledWith("styles.scss");
      expect(mockModuleLoader.injectCSS).toHaveBeenCalledWith("css content");
    });
  });

  describe("_prepareModules method", () => {
    it("should load modules, create local loader and require function", async () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      const result = await bootstrapper._prepareModules("main.tsx", { modules: ["mod1", "mod2"] });
      
      expect(mockModuleLoader.loadModules).toHaveBeenCalledWith(["mod1", "mod2"]);
      expect(mockModuleLoader.createLocalModuleLoader).toHaveBeenCalledWith("");
      expect(mockModuleLoader.createRequire).toHaveBeenCalled();
      expect(result).toHaveProperty('registry');
      expect(result).toHaveProperty('entryDir');
      expect(result).toHaveProperty('requireFn');
    });

    it("should handle modules in subdirectories correctly", async () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      const result = await bootstrapper._prepareModules("src/main.tsx", { modules: [] });
      
      expect(mockModuleLoader.createLocalModuleLoader).toHaveBeenCalledWith("src");
      expect(result.entryDir).toBe("src");
    });
  });

  describe("_compileAndRender method", () => {
    it("should compile TSX and render the application", async () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      const mockApp = { name: "TestApp" };
      mockModuleLoader.compileTSX.mockResolvedValue(mockApp);
      
      await bootstrapper._compileAndRender(
        "main.tsx", 
        "styles.scss", 
        { entry: "main.tsx" }, 
        {}, 
        "", 
        jest.fn()
      );
      
      expect(mockModuleLoader.compileTSX).toHaveBeenCalledWith("main.tsx", expect.any(Function), "");
      expect(mockModuleLoader.frameworkRender).toHaveBeenCalledWith(
        { entry: "main.tsx" }, 
        {}, 
        mockApp
      );
      expect(mockLogging.logClient).toHaveBeenCalledWith("bootstrap:success", {
        entryFile: "main.tsx",
        scssFile: "styles.scss"
      });
    });
  });

  describe("_configureProviders method", () => {
    it("should set up network providers and enable CI logging", () => {
      const config = {
        fallbackProviders: ["provider1", "provider2"],
        providers: {
          default: "defaultProvider",
          aliases: { alias1: "target1" }
        }
      };
      
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      const enableCiLoggingSpy = jest.spyOn(bootstrapper, '_enableCiLogging');
      
      bootstrapper._configureProviders(config);
      
      expect(mockNetwork.setFallbackProviders).toHaveBeenCalledWith(["provider1", "provider2"]);
      expect(mockNetwork.setDefaultProviderBase).toHaveBeenCalledWith("defaultProvider");
      expect(mockNetwork.setProviderAliases).toHaveBeenCalledWith({ alias1: "target1" });
      expect(enableCiLoggingSpy).toHaveBeenCalledWith(config);
    });

    it("should handle missing provider configuration", () => {
      const config = {};
      
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      const enableCiLoggingSpy = jest.spyOn(bootstrapper, '_enableCiLogging');
      
      bootstrapper._configureProviders(config);
      
      expect(mockNetwork.setFallbackProviders).toHaveBeenCalledWith(undefined);
      expect(mockNetwork.setDefaultProviderBase).toHaveBeenCalledWith(undefined);
      expect(mockNetwork.setProviderAliases).toHaveBeenCalledWith(undefined);
      expect(enableCiLoggingSpy).toHaveBeenCalledWith(config);
    });
  });

  describe("loadConfig method", () => {
    it("should load config from window cache if available", async () => {
      global.window = { __rwtraConfig: { cached: "config" } };
      
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      const result = await bootstrapper.loadConfig();
      
      expect(result).toEqual({ cached: "config" });
    });

    it("should load config from window promise if available", async () => {
      const configPromise = Promise.resolve({ promised: "config" });
      global.window = { __rwtraConfigPromise: configPromise };
      
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      const result = await bootstrapper.loadConfig();
      
      expect(result).toEqual({ promised: "config" });
    });

    it("should fetch config if no cache is present", async () => {
      delete global.window.__rwtraConfig;
      delete global.window.__rwtraConfigPromise;
      
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      const fetchConfigSpy = jest.spyOn(bootstrapper, '_fetchConfig').mockResolvedValue({ fetched: "config" });
      const consumePromiseSpy = jest.spyOn(bootstrapper, '_consumeConfigPromise').mockResolvedValue({ fetched: "config" });
      
      const result = await bootstrapper.loadConfig();
      
      expect(fetchConfigSpy).toHaveBeenCalled();
      expect(consumePromiseSpy).toHaveBeenCalled();
      expect(result).toEqual({ fetched: "config" });
    });
  });

  describe("_fetchConfig method", () => {
    it("should fetch and return config from config.json", async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ test: "config" })
      });
      
      const bootstrapper = new Bootstrapper({
        ...mockConfig,
        fetch: mockFetch
      });
      bootstrapper.initialize();
      
      const result = await bootstrapper._fetchConfig();
      
      expect(mockFetch).toHaveBeenCalledWith("config.json", { cache: "no-store" });
      expect(result).toEqual({ test: "config" });
    });

    it("should use custom config URL if provided", async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ test: "config" })
      });
      
      const bootstrapper = new Bootstrapper({
        ...mockConfig,
        configUrl: "custom-config.json",
        fetch: mockFetch
      });
      bootstrapper.initialize();
      
      await bootstrapper._fetchConfig();
      
      expect(mockFetch).toHaveBeenCalledWith("custom-config.json", { cache: "no-store" });
    });

    it("should throw if fetch is unavailable", async () => {
      const bootstrapper = new Bootstrapper({
        ...mockConfig,
        fetch: null
      });
      bootstrapper.initialize();
      
      await expect(bootstrapper._fetchConfig()).rejects.toThrow("Fetch is unavailable when loading config.json");
    });

    it("should throw if response is not ok", async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false
      });
      
      const bootstrapper = new Bootstrapper({
        ...mockConfig,
        fetch: mockFetch
      });
      bootstrapper.initialize();
      
      await expect(bootstrapper._fetchConfig()).rejects.toThrow("Failed to load config.json");
    });
  });

  describe("_enableCiLogging method", () => {
    it("should enable CI logging when detected", () => {
      const mockConfigWithCi = { ciLogging: true };
      mockLogging.detectCiLogging.mockReturnValue(true);
      
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      bootstrapper._enableCiLogging(mockConfigWithCi);
      
      expect(mockLogging.setCiLoggingEnabled).toHaveBeenCalledWith(true);
      expect(mockLogging.logClient).toHaveBeenCalledWith("ci:enabled", {
        config: true,
        href: undefined
      });
    });

    it("should not enable CI logging when not detected", () => {
      const mockConfigWithoutCi = { ciLogging: false };
      mockLogging.detectCiLogging.mockReturnValue(false);
      
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      bootstrapper._enableCiLogging(mockConfigWithoutCi);
      
      expect(mockLogging.setCiLoggingEnabled).toHaveBeenCalledWith(false);
      expect(mockStorage.logClient).not.toHaveBeenCalledWith("ci:enabled", expect.any(Object));
    });
  });

  describe("_handleBootstrapError method", () => {
    it("should log error and render bootstrap error", () => {
      const mockError = new Error("Bootstrap failed");
      const renderErrorSpy = jest.spyOn(Bootstrapper.prototype, '_renderBootstrapError').mockImplementation();
      
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      bootstrapper._handleBootstrapError(mockError);
      
      expect(console.error).toHaveBeenCalledWith(mockError);
      expect(mockLogging.logClient).toHaveBeenCalledWith("bootstrap:error", {
        message: "Bootstrap failed",
        stack: mockError.stack
      });
      expect(renderErrorSpy).toHaveBeenCalledWith(mockError);
      
      renderErrorSpy.mockRestore();
    });

    it("should handle error with no message", () => {
      const mockError = { toString: () => "Error occurred" };
      const renderErrorSpy = jest.spyOn(Bootstrapper.prototype, '_renderBootstrapError').mockImplementation();
      
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      bootstrapper._handleBootstrapError(mockError);
      
      expect(mockLogging.logClient).toHaveBeenCalledWith("bootstrap:error", {
        message: "Error occurred",
        stack: undefined
      });
      
      renderErrorSpy.mockRestore();
    });
  });

  describe("_renderBootstrapError method", () => {
    it("should render error message to root element when document is available", () => {
      const mockDocument = {
        getElementById: jest.fn().mockReturnValue({ textContent: "" })
      };
      
      // Temporarily modify the GlobalRootHandler mock for this test
      jest.mock("../../bootstrap/constants/global-root-handler.js", () => {
        return {
          __esModule: true,
          default: jest.fn().mockImplementation(() => createMockGlobalRootHandler(true, true))
        };
      });
      
      const mockError = new Error("Test error");
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      bootstrapper._renderBootstrapError(mockError);
      
      const rootElement = mockDocument.getElementById("root");
      if (rootElement) {
        expect(rootElement.textContent).toBe("Bootstrap error: Test error");
      }
    });

    it("should do nothing when document is not available", () => {
      // Temporarily modify the GlobalRootHandler mock for this test
      jest.mock("../../bootstrap/constants/global-root-handler.js", () => {
        return {
          __esModule: true,
          default: jest.fn().mockImplementation(() => createMockGlobalRootHandler(false, false))
        };
      });
      
      const mockError = new Error("Test error");
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      bootstrapper._renderBootstrapError(mockError);
      
      // Should not attempt to access document
    });

    it("should handle missing root element", () => {
      const mockDocument = {
        getElementById: jest.fn().mockReturnValue(null)
      };
      
      // Temporarily modify the GlobalRootHandler mock for this test
      jest.mock("../../bootstrap/constants/global-root-handler.js", () => {
        return {
          __esModule: true,
          default: jest.fn().mockImplementation(() => createMockGlobalRootHandler(true, true))
        };
      });
      
      const mockError = new Error("Test error");
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      bootstrapper._renderBootstrapError(mockError);
      
      // Should handle the case where root element is null
    });
  });

  describe("bootstrap method", () => {
    it("should run the bootstrap workflow", async () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      const bootstrapSpy = jest.spyOn(bootstrapper, '_bootstrap').mockResolvedValue();
      
      await bootstrapper.bootstrap();
      
      expect(bootstrapSpy).toHaveBeenCalled();
    });

    it("should handle bootstrap errors", async () => {
      const mockError = new Error("Bootstrap failed");
      const handleBootstrapErrorSpy = jest.spyOn(Bootstrapper.prototype, '_handleBootstrapError');
      
      const bootstrapper = new Bootstrapper(mockConfig);
      bootstrapper.initialize();
      
      jest.spyOn(bootstrapper, '_bootstrap').mockRejectedValue(mockError);
      
      await bootstrapper.bootstrap();
      
      expect(handleBootstrapErrorSpy).toHaveBeenCalledWith(mockError);
    });
  });

  describe("_determineEntryDir method", () => {
    it("should return empty string for files without path", () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      
      expect(bootstrapper._determineEntryDir("main.tsx")).toBe("");
    });

    it("should return directory path for files with path", () => {
      const bootstrapper = new Bootstrapper(mockConfig);
      
      expect(bootstrapper._determineEntryDir("src/main.tsx")).toBe("src");
      expect(bootstrapper._determineEntryDir("src/components/App.tsx")).toBe("src/components");
    });
  });

  describe("_windowHref method", () => {
    it("should return window location href when available", () => {
      global.window = { location: { href: "http://example.com" } };
      
      const bootstrapper = new Bootstrapper(mockConfig);
      
      expect(bootstrapper._windowHref()).toBe("http://example.com");
    });

    it("should return undefined when window is not available", () => {
      delete global.window;
      
      const bootstrapper = new Bootstrapper(mockConfig);
      
      expect(bootstrapper._windowHref()).toBeUndefined();
    });

    it("should return undefined when window location is not available", () => {
      global.window = {};
      
      const bootstrapper = new Bootstrapper(mockConfig);
      
      expect(bootstrapper._windowHref()).toBeUndefined();
    });
  });
});