const modulePath = "../../../bootstrap/bootstrap-app.js";

const loadBootstrapApp = () => {
  jest.resetModules();

  let latestLoggingManagerInstance = null;
  let latestBootstrapperInstance = null;

  const loggingManagerMock = jest.fn().mockImplementation(() => {
    latestLoggingManagerInstance = {
      initialize: jest.fn(),
      install: jest.fn(),
    };
    return latestLoggingManagerInstance;
  });

  class LoggingManagerConfigMock {
    constructor(options) {
      return options;
    }
  }

  const bootstrapperMock = jest.fn().mockImplementation(() => {
    latestBootstrapperInstance = {
      initialize: jest.fn(),
      bootstrap: jest.fn(),
      loadConfig: jest.fn(),
    };
    return latestBootstrapperInstance;
  });

  class BootstrapperConfigMock {
    constructor(options) {
      return options;
    }
  }

  const serviceRegistryInstance = {
    register: jest.fn(),
    get: jest.fn(),
  };

  const loggingHelper = {
    setCiLoggingEnabled: jest.fn(),
    detectCiLogging: jest.fn(),
    logClient: { send: jest.fn() },
    serializeForLog: jest.fn(),
    isCiLoggingEnabled: jest.fn(),
  };

  const networkHelper = {
    normalizeProviderBase: jest.fn(),
    probeUrl: jest.fn(),
    resolveModuleUrl: jest.fn(),
  };

  const moduleLoaderHelper = {
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
    loadScript: jest.fn(),
  };

  jest.doMock("../../../bootstrap/services/core/logging-manager.js", () => loggingManagerMock);
  jest.doMock("../../../bootstrap/configs/core/logging-manager.js", () => LoggingManagerConfigMock);
  jest.doMock("../../../bootstrap/controllers/bootstrapper.js", () => bootstrapperMock);
  jest.doMock("../../../bootstrap/configs/core/bootstrapper.js", () => BootstrapperConfigMock);
  jest.doMock("../../../bootstrap/services/service-registry-instance.js", () => serviceRegistryInstance);
  jest.doMock("../../../bootstrap/cdn/logging.js", () => loggingHelper);
  jest.doMock("../../../bootstrap/cdn/network.js", () => networkHelper);
  jest.doMock("../../../bootstrap/entrypoints/module-loader.js", () => moduleLoaderHelper);

  let BootstrapApp;
  jest.isolateModules(() => {
    BootstrapApp = require(modulePath);
  });
  const instance = new BootstrapApp();

  return {
    BootstrapApp,
    instance,
    latestLoggingManagerInstance: () => latestLoggingManagerInstance,
    latestBootstrapperInstance: () => latestBootstrapperInstance,
    moduleLoaderHelper,
    networkHelper,
    loggingHelper,
  };
};

describe("bootstrap/bootstrap-app.js", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.unmock("../../../bootstrap/services/core/logging-manager.js");
    jest.unmock("../../../bootstrap/configs/core/logging-manager.js");
    jest.unmock("../../../bootstrap/controllers/bootstrapper.js");
    jest.unmock("../../../bootstrap/configs/core/bootstrapper.js");
    jest.unmock("../../../bootstrap/services/service-registry-instance.js");
    jest.unmock("../../../bootstrap/cdn/logging.js");
    jest.unmock("../../../bootstrap/cdn/network.js");
    jest.unmock("../../../bootstrap/entrypoints/module-loader.js");
  });

  it("initializes the logging manager and bootstrapper and returns itself", () => {
    const { instance, latestLoggingManagerInstance, latestBootstrapperInstance } =
      loadBootstrapApp();

    const result = instance.initialize();
    expect(latestLoggingManagerInstance().initialize).toHaveBeenCalled();
    expect(latestBootstrapperInstance().initialize).toHaveBeenCalled();
    expect(result).toBe(instance);
  });

  it("exposes the helper modules alongside bootstrapper load/boot helpers", () => {
    const {
      instance,
      latestBootstrapperInstance,
      moduleLoaderHelper,
      networkHelper,
    } = loadBootstrapApp();

    const exports = instance.getExports();

    expect(exports.loadTools).toBe(moduleLoaderHelper.loadTools);
    expect(exports.makeNamespace).toBe(moduleLoaderHelper.makeNamespace);
    expect(exports.loadScript).toBe(moduleLoaderHelper.loadScript);
    expect(exports.normalizeProviderBase).toBe(networkHelper.normalizeProviderBase);
    expect(exports.probeUrl).toBe(networkHelper.probeUrl);
    expect(exports.resolveModuleUrl).toBe(networkHelper.resolveModuleUrl);

    exports.bootstrap();
    expect(latestBootstrapperInstance().bootstrap).toHaveBeenCalled();
  });

  it("installLogging calls the helper when a browser window is provided", () => {
    const { instance, latestLoggingManagerInstance } = loadBootstrapApp();
    const windowObj = { document: {} };
    instance.installLogging(windowObj);
    expect(latestLoggingManagerInstance().install).toHaveBeenCalledWith(windowObj);
  });

  it("installLogging is a no-op outside browser contexts", () => {
    const { instance, latestLoggingManagerInstance } = loadBootstrapApp();
    instance.installLogging({});
    expect(latestLoggingManagerInstance().install).not.toHaveBeenCalled();
  });

  it("runBootstrapper invokes bootstrapper when allowed", () => {
    const { instance, latestBootstrapperInstance } = loadBootstrapApp();
    const windowObj = { document: {}, __RWTRA_BOOTSTRAP_TEST_MODE__: false };
    instance.runBootstrapper(windowObj);
    expect(latestBootstrapperInstance().bootstrap).toHaveBeenCalled();
  });

  it("runBootstrapper skips bootstrapping when already in test mode", () => {
    const { instance, latestBootstrapperInstance } = loadBootstrapApp();
    const windowObj = { document: {}, __RWTRA_BOOTSTRAP_TEST_MODE__: true };
    instance.runBootstrapper(windowObj);
    expect(latestBootstrapperInstance().bootstrap).not.toHaveBeenCalled();
  });

  it("runBootstrapper skips when not running in a browser", () => {
    const { instance, latestBootstrapperInstance } = loadBootstrapApp();
    instance.runBootstrapper({});
    expect(latestBootstrapperInstance().bootstrap).not.toHaveBeenCalled();
  });

  it("provides the logging helper bindings", () => {
    const { instance, loggingHelper } = loadBootstrapApp();
    const bindings = instance._loggingBindings();
    expect(bindings.setCiLoggingEnabled).toBe(loggingHelper.setCiLoggingEnabled);
    expect(bindings.detectCiLogging).toBe(loggingHelper.detectCiLogging);
    expect(bindings.logClient).toBe(loggingHelper.logClient);
    expect(bindings.serializeForLog).toBe(loggingHelper.serializeForLog);
    expect(bindings.isCiLoggingEnabled).toBe(loggingHelper.isCiLoggingEnabled);
  });
});
