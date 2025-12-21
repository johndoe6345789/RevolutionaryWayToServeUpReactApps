import BootstrapApp from "../../bootstrap/bootstrap-app.js";

// Mock the dependencies
jest.mock("../../bootstrap/interfaces/base-bootstrap-app.js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        _resolveHelper: jest.fn((name, path) => {
          // Return mock helpers based on name
          return {
            logging: {
              logClient: jest.fn(),
              serializeForLog: jest.fn(),
              setCiLoggingEnabled: jest.fn(),
              detectCiLogging: jest.fn(),
              isCiLoggingEnabled: jest.fn(),
            },
            network: {
              normalizeProviderBase: jest.fn(),
              probeUrl: jest.fn(),
              resolveModuleUrl: jest.fn(),
            },
            moduleLoader: {
              loadTools: jest.fn(),
              makeNamespace: jest.fn(),
              loadModules: jest.fn(),
              loadDynamicModule: jest.fn(),
              createRequire: jest.fn(),
              compileSCSS: jest.fn(),
              injectCSS: jest.fn(),
              collectDynamicModuleImports: jest.fn(),
              preloadDynamicModulesFromSource: jest.fn(),
              collectModuleSpecifiers: jest.fn(),
              preloadModulesFromSource: jest.fn(),
              compileTSX: jest.fn(),
              frameworkRender: jest.fn(),
              createLocalModuleLoader: jest.fn(),
              loadScript: jest.fn(),
            }
          }[name] || {};
        })
      };
    })
  };
});

jest.mock("../../bootstrap/services/core/logging-manager.js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((config) => {
      return {
        initialize: jest.fn(),
        install: jest.fn(),
      };
    })
  };
});

jest.mock("../../bootstrap/configs/core/logging-manager.js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((config) => config)
  };
});

jest.mock("../../bootstrap/controllers/bootstrapper.js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((config) => {
      return {
        initialize: jest.fn(),
        bootstrap: jest.fn(),
        loadConfig: jest.fn(),
      };
    })
  };
});

jest.mock("../../bootstrap/configs/core/bootstrapper.js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((config) => config)
  };
});

jest.mock("../../bootstrap/services/service-registry-instance.js", () => {
  return {};
});

describe("BootstrapApp", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });
  let bootstrapApp: any;
  let originalConsoleError;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a new instance of BootstrapApp for each test
    bootstrapApp = new BootstrapApp();
  });

  describe("constructor", () => {
    it("should initialize with default options", () => {
      const app = new BootstrapApp();

      expect(app).toBeDefined();
      expect(app.logging).toBeDefined();
      expect(app.network).toBeDefined();
      expect(app.moduleLoader).toBeDefined();
    });

    it("should initialize with custom options", () => {
      const options = { rootHandler: {} };
      const app = new BootstrapApp(options);

      expect(app).toBeDefined();
    });

    it("should create logging manager with proper config", () => {
      const app = new BootstrapApp();

      expect(require("../../bootstrap/services/core/logging-manager.js").default).toHaveBeenCalled();
    });

    it("should create bootstrapper with proper config", () => {
      const app = new BootstrapApp();

      expect(require("../../bootstrap/controllers/bootstrapper.js").default).toHaveBeenCalled();
    });

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
    it("should initialize logging manager and bootstrapper", () => {
      const app = new BootstrapApp();
      const loggingManagerSpy = jest.spyOn(app.loggingManager, 'initialize');
      const bootstrapperSpy = jest.spyOn(app.bootstrapper, 'initialize');

      const result = app.initialize();

      expect(loggingManagerSpy).toHaveBeenCalled();
      expect(bootstrapperSpy).toHaveBeenCalled();
      expect(result).toBe(app);
    });

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
    it("should return all expected export functions", () => {
      const app = new BootstrapApp();
      const exports = app.getExports();

      expect(exports).toHaveProperty('loadConfig');
      expect(exports).toHaveProperty('loadScript');
      expect(exports).toHaveProperty('normalizeProviderBase');
      expect(exports).toHaveProperty('probeUrl');
      expect(exports).toHaveProperty('resolveModuleUrl');
      expect(exports).toHaveProperty('loadTools');
      expect(exports).toHaveProperty('makeNamespace');
      expect(exports).toHaveProperty('loadModules');
      expect(exports).toHaveProperty('loadDynamicModule');
      expect(exports).toHaveProperty('createRequire');
      expect(exports).toHaveProperty('compileSCSS');
      expect(exports).toHaveProperty('injectCSS');
      expect(exports).toHaveProperty('collectDynamicModuleImports');
      expect(exports).toHaveProperty('preloadDynamicModulesFromSource');
      expect(exports).toHaveProperty('collectModuleSpecifiers');
      expect(exports).toHaveProperty('preloadModulesFromSource');
      expect(exports).toHaveProperty('compileTSX');
      expect(exports).toHaveProperty('frameworkRender');
      expect(exports).toHaveProperty('bootstrap');
    });

    it("should bind loadConfig to bootstrapper", () => {
      const app = new BootstrapApp();
      const exports = app.getExports();

      expect(typeof exports.loadConfig).toBe('function');
    });

    it("should bind bootstrap to bootstrapper", () => {
      const app = new BootstrapApp();
      const exports = app.getExports();

      expect(typeof exports.bootstrap).toBe('function');
    });

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
    it("should call logging manager install when in browser context", () => {
      // Mock isBrowser to return true
      BootstrapApp.isBrowser = jest.fn().mockReturnValue(true);

      const app = new BootstrapApp();
      const installSpy = jest.spyOn(app.loggingManager, 'install');

      const mockWindow = { document: {} };
      app.installLogging(mockWindow);

      expect(installSpy).toHaveBeenCalledWith(mockWindow);
    });

    it("should not call logging manager install when not in browser context", () => {
      // Mock isBrowser to return false
      BootstrapApp.isBrowser = jest.fn().mockReturnValue(false);

      const app = new BootstrapApp();
      const installSpy = jest.spyOn(app.loggingManager, 'install');

      app.installLogging({});

      expect(installSpy).not.toHaveBeenCalled();
    });

    it("should handle undefined window object", () => {
      // Mock isBrowser to return false
      BootstrapApp.isBrowser = jest.fn().mockReturnValue(false);

      const app = new BootstrapApp();
      const installSpy = jest.spyOn(app.loggingManager, 'install');

      app.installLogging();

      expect(installSpy).not.toHaveBeenCalled();
    });

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
    it("should call bootstrapper bootstrap when in browser and not in test mode", () => {
      // Mock isBrowser to return true
      BootstrapApp.isBrowser = jest.fn().mockReturnValue(true);

      const mockWindow = { __RWTRA_BOOTSTRAP_TEST_MODE__: false };
      const app = new BootstrapApp();
      const bootstrapSpy = jest.spyOn(app.bootstrapper, 'bootstrap');

      app.runBootstrapper(mockWindow);

      expect(bootstrapSpy).toHaveBeenCalled();
    });

    it("should not call bootstrapper bootstrap when in test mode", () => {
      // Mock isBrowser to return true
      BootstrapApp.isBrowser = jest.fn().mockReturnValue(true);

      const mockWindow = { __RWTRA_BOOTSTRAP_TEST_MODE__: true };
      const app = new BootstrapApp();
      const bootstrapSpy = jest.spyOn(app.bootstrapper, 'bootstrap');

      app.runBootstrapper(mockWindow);

      expect(bootstrapSpy).not.toHaveBeenCalled();
    });

    it("should not call bootstrapper bootstrap when not in browser", () => {
      // Mock isBrowser to return false
      BootstrapApp.isBrowser = jest.fn().mockReturnValue(false);

      const mockWindow = {};
      const app = new BootstrapApp();
      const bootstrapSpy = jest.spyOn(app.bootstrapper, 'bootstrap');

      app.runBootstrapper(mockWindow);

      expect(bootstrapSpy).not.toHaveBeenCalled();
    });

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

  describe("_loggingBindings method", () => {
    it("should return proper logging bindings object", () => {
      const app = new BootstrapApp();
      const bindings = app._loggingBindings();

      expect(bindings).toHaveProperty('setCiLoggingEnabled');
      expect(bindings).toHaveProperty('detectCiLogging');
      expect(bindings).toHaveProperty('logClient');
      expect(bindings).toHaveProperty('serializeForLog');
      expect(bindings).toHaveProperty('isCiLoggingEnabled');
    });
  });

  describe("static isBrowser method", () => {
    it("should return true when window and document are available", () => {
      const mockWindow = { document: {} };
      const result = BootstrapApp.isBrowser(mockWindow);

      expect(result).toBe(true);
    });

    it("should return false when window has no document", () => {
      const mockWindow = {};
      const result = BootstrapApp.isBrowser(mockWindow);

      expect(result).toBe(false);
    });

    it("should return false when window is undefined", () => {
      const result = BootstrapApp.isBrowser(undefined);

      expect(result).toBe(false);
    });

    it("should return true when window and document are available", () => {
      const mockWindow = {
        document: {}
      } as any;

      const result = (BootstrapApp as any).__proto__.constructor.isBrowser(mockWindow);
      expect(result).toBe(true);
    });

    it("should return false when window is not provided", () => {
      const result = (BootstrapApp as any).__proto__.constructor.isBrowser(undefined);
      expect(result).toBe(false);
    });

    it("should return false when window has no document", () => {
      const mockWindow = {} as any;

      const result = (BootstrapApp as any).__proto__.constructor.isBrowser(mockWindow);
      expect(result).toBe(false);
    });
  });
});
