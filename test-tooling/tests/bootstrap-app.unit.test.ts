import BootstrapApp from "../../bootstrap/bootstrap-app.js";

describe("BootstrapApp", () => {
  let bootstrapApp: any;

  beforeEach(() => {
    // Create a new instance of BootstrapApp for each test
    bootstrapApp = new BootstrapApp();
  });

  describe("constructor", () => {
    it("should initialize with default properties", () => {
      expect(bootstrapApp).toBeDefined();
      expect(bootstrapApp.logging).toBeDefined();
      expect(bootstrapApp.network).toBeDefined();
      expect(bootstrapApp.moduleLoader).toBeDefined();
      expect(bootstrapApp.loggingManager).toBeDefined();
      expect(bootstrapApp.bootstrapper).toBeDefined();
    });

    it("should resolve helpers properly", () => {
      // This test verifies that the helper resolution works
      expect(bootstrapApp.logging).toBeDefined();
      expect(bootstrapApp.network).toBeDefined();
      expect(bootstrapApp.moduleLoader).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should call initialize on loggingManager and bootstrapper", () => {
      const loggingManagerSpy = jest.spyOn(bootstrapApp.loggingManager, 'initialize');
      const bootstrapperSpy = jest.spyOn(bootstrapApp.bootstrapper, 'initialize');

      const result = bootstrapApp.initialize();

      expect(loggingManagerSpy).toHaveBeenCalled();
      expect(bootstrapperSpy).toHaveBeenCalled();
      expect(result).toBe(bootstrapApp);
    });
  });

  describe("getExports method", () => {
    it("should return the expected export functions", () => {
      const exports = bootstrapApp.getExports();

      // Check that key functions are available in the exports
      expect(exports.loadConfig).toBeDefined();
      expect(exports.loadScript).toBeDefined();
      expect(exports.normalizeProviderBase).toBeDefined();
      expect(exports.probeUrl).toBeDefined();
      expect(exports.resolveModuleUrl).toBeDefined();
      expect(exports.loadTools).toBeDefined();
      expect(exports.makeNamespace).toBeDefined();
      expect(exports.loadModules).toBeDefined();
      expect(exports.loadDynamicModule).toBeDefined();
      expect(exports.createRequire).toBeDefined();
      expect(exports.compileSCSS).toBeDefined();
      expect(exports.injectCSS).toBeDefined();
      expect(exports.collectDynamicModuleImports).toBeDefined();
      expect(exports.preloadDynamicModulesFromSource).toBeDefined();
      expect(exports.collectModuleSpecifiers).toBeDefined();
      expect(exports.preloadModulesFromSource).toBeDefined();
      expect(exports.compileTSX).toBeDefined();
      expect(exports.frameworkRender).toBeDefined();
      expect(exports.bootstrap).toBeDefined();
    });
  });

  describe("installLogging method", () => {
    it("should call install on loggingManager if window is provided", () => {
      const mockWindow = {
        document: {},
        __RWTRA_BOOTSTRAP_TEST_MODE__: false
      };
      
      const loggingManagerSpy = jest.spyOn(bootstrapApp.loggingManager, 'install');

      bootstrapApp.installLogging(mockWindow);

      expect(loggingManagerSpy).toHaveBeenCalledWith(mockWindow);
    });

    it("should not call install if window is not a browser environment", () => {
      const mockNonWindow = {}; // Not a proper window object

      const loggingManagerSpy = jest.spyOn(bootstrapApp.loggingManager, 'install');

      // Mock the isBrowser method to return false
      const originalIsBrowser = (BootstrapApp as any).__proto__.constructor.isBrowser;
      (BootstrapApp as any).__proto__.constructor.isBrowser = jest.fn(() => false);

      bootstrapApp.installLogging(mockNonWindow);

      expect(loggingManagerSpy).not.toHaveBeenCalled();

      // Restore original method
      (BootstrapApp as any).__proto__.constructor.isBrowser = originalIsBrowser;
    });
  });

  describe("runBootstrapper method", () => {
    it("should call bootstrap on bootstrapper if window is provided and not in test mode", () => {
      const mockWindow = {
        document: {},
        __RWTRA_BOOTSTRAP_TEST_MODE__: false
      };

      const bootstrapperSpy = jest.spyOn(bootstrapApp.bootstrapper, 'bootstrap');

      // Mock the isBrowser method to return true
      const originalIsBrowser = (BootstrapApp as any).__proto__.constructor.isBrowser;
      (BootstrapApp as any).__proto__.constructor.isBrowser = jest.fn(() => true);

      bootstrapApp.runBootstrapper(mockWindow);

      expect(bootstrapperSpy).toHaveBeenCalled();

      // Restore original method
      (BootstrapApp as any).__proto__.constructor.isBrowser = originalIsBrowser;
    });

    it("should not call bootstrap if in test mode", () => {
      const mockWindow = {
        document: {},
        __RWTRA_BOOTSTRAP_TEST_MODE__: true
      };

      const bootstrapperSpy = jest.spyOn(bootstrapApp.bootstrapper, 'bootstrap');

      // Mock the isBrowser method to return true
      const originalIsBrowser = (BootstrapApp as any).__proto__.constructor.isBrowser;
      (BootstrapApp as any).__proto__.constructor.isBrowser = jest.fn(() => true);

      bootstrapApp.runBootstrapper(mockWindow);

      expect(bootstrapperSpy).not.toHaveBeenCalled();

      // Restore original method
      (BootstrapApp as any).__proto__.constructor.isBrowser = originalIsBrowser;
    });
  });

  describe("static isBrowser method", () => {
    it("should return true when window and document are available", () => {
      const mockWindow = {
        document: {}
      } as any;

      const result = BaseBootstrapApp.isBrowser(mockWindow);
      expect(result).toBe(true);
    });

    it("should return false when window is not provided", () => {
      const result = BaseBootstrapApp.isBrowser(undefined);
      expect(result).toBe(false);
    });

    it("should return false when window has no document", () => {
      const mockWindow = {} as any;

      const result = BaseBootstrapApp.isBrowser(mockWindow);
      expect(result).toBe(false);
    });
  });
});