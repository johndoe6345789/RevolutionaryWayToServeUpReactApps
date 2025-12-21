import BootstrapApp from "../../bootstrap/bootstrap-app.js";

// Mock the dependencies
jest.mock("../../bootstrap/base-bootstrap-app.js", () => {
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
  });
});