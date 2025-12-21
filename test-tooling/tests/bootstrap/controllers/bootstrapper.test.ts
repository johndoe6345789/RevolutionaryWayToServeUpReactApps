const modulePath = "../../../../bootstrap/controllers/bootstrapper.js";

const createLogging = (overrides = {}) => ({
  setCiLoggingEnabled: jest.fn(),
  detectCiLogging: jest.fn().mockReturnValue(false),
  logClient: jest.fn(),
  isCiLoggingEnabled: jest.fn().mockReturnValue(false),
  ...overrides,
});

const createNetwork = (overrides = {}) => ({
  setFallbackProviders: jest.fn(),
  setDefaultProviderBase: jest.fn(),
  setProviderAliases: jest.fn(),
  ...overrides,
});

const createModuleLoader = (overrides = {}) => ({
  loadModules: jest.fn().mockResolvedValue({}),
  createLocalModuleLoader: jest.fn(),
  createRequire: jest.fn(),
  compileTSX: jest.fn().mockResolvedValue(() => null),
  frameworkRender: jest.fn(),
  loadTools: jest.fn().mockResolvedValue(undefined),
  compileSCSS: jest.fn().mockResolvedValue(""),
  injectCSS: jest.fn(),
  ...overrides,
});

const withBootstrapper = ({
  loggingOverrides,
  networkOverrides,
  moduleLoaderOverrides,
  configOverrides,
  windowObj,
  documentObj,
} = {}) => {
  jest.resetModules();
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  globalThis.window = windowObj !== undefined ? windowObj : originalWindow;
  globalThis.document = documentObj !== undefined ? documentObj : originalDocument;

  const Bootstrapper = require(modulePath);
  const logging = createLogging(loggingOverrides);
  const network = createNetwork(networkOverrides);
  const moduleLoader = createModuleLoader(moduleLoaderOverrides);
  const config = {
    logging,
    network,
    moduleLoader,
    ...configOverrides,
  };
  const bootstrapper = new Bootstrapper(config);
  bootstrapper.initialize();

  const restore = () => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  };

  return { bootstrapper, logging, network, moduleLoader, restore };
};

describe("bootstrap/controllers/bootstrapper.js", () => {
  let restoreGlobals = null;

  afterEach(() => {
    if (typeof restoreGlobals === "function") {
      restoreGlobals();
      restoreGlobals = null;
    }
  });

  it("initializes with logging, network, and module loader bindings", () => {
    const { bootstrapper, logging, network, moduleLoader, restore } = withBootstrapper();
    restoreGlobals = restore;
    expect(bootstrapper.logging).toBe(logging);
    expect(bootstrapper.network).toBe(network);
    expect(bootstrapper.moduleLoader).toBe(moduleLoader);
    restore();
  });

  it("determines the directory used to resolve entry files", () => {
    const { bootstrapper, restore } = withBootstrapper();
    restoreGlobals = restore;
    expect(bootstrapper._determineEntryDir("main.tsx")).toBe("");
    expect(bootstrapper._determineEntryDir("components/App.tsx")).toBe("components");
    expect(bootstrapper._determineEntryDir("components/ui/App.tsx")).toBe("components/ui");
    restore();
  });

  it("configures provider fallbacks and delegates to CI logging helpers", () => {
    const { bootstrapper, network, restore } = withBootstrapper();
    restoreGlobals = restore;
    const config = {
      fallbackProviders: ["http://fallback.test"],
      providers: {
        default: "base-provider",
        aliases: { core: "core-alias" },
      },
    };
    const enableSpy = jest.spyOn(bootstrapper, "_enableCiLogging").mockImplementation(() => {});

    bootstrapper._configureProviders(config);

    expect(network.setFallbackProviders).toHaveBeenCalledWith(config.fallbackProviders);
    expect(network.setDefaultProviderBase).toHaveBeenCalledWith("base-provider");
    expect(network.setProviderAliases).toHaveBeenCalledWith(config.providers.aliases);
    expect(enableSpy).toHaveBeenCalledWith(config);
    restore();
  });

  it("enables CI logging and logs the event", () => {
    const { bootstrapper, logging, restore } = withBootstrapper({
      loggingOverrides: {
        detectCiLogging: jest.fn().mockReturnValue(true),
        isCiLoggingEnabled: jest.fn().mockReturnValue(true),
      },
      windowObj: { location: { href: "https://bootstrap/tests" } },
    });
    restoreGlobals = restore;

    bootstrapper._enableCiLogging({ entry: "main.tsx" });

    expect(logging.detectCiLogging).toHaveBeenCalled();
    expect(logging.setCiLoggingEnabled).toHaveBeenCalledWith(true);
    expect(logging.logClient).toHaveBeenCalledWith(
      "ci:enabled",
      expect.objectContaining({ config: true, href: "https://bootstrap/tests" })
    );
    restore();
  });

  it("loads config from the cached window value when available", async () => {
    const cachedConfig = { entry: "main.tsx" };
    const windowObj = { __rwtraConfig: cachedConfig };
    const { bootstrapper, restore } = withBootstrapper({ windowObj });
    restoreGlobals = restore;
    const fetchSpy = jest.spyOn(bootstrapper, "_fetchConfig");

    const config = await bootstrapper.loadConfig();
    expect(config).toBe(cachedConfig);
    expect(fetchSpy).not.toHaveBeenCalled();
    restore();
  });

  it("loads config from the cached window promise when available", async () => {
    const cachedPromise = Promise.resolve({ entry: "main.tsx" });
    const windowObj = { __rwtraConfigPromise: cachedPromise };
    const { bootstrapper, restore } = withBootstrapper({ windowObj });
    restoreGlobals = restore;

    const config = await bootstrapper.loadConfig();
    expect(config).toEqual({ entry: "main.tsx" });
    restore();
  });

  it("fetches config when no cache is present and stores it on window", async () => {
    const fetchImpl = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ entry: "app.tsx" }),
      })
    );
    const windowObj = {};
    const { bootstrapper, restore } = withBootstrapper({
      windowObj,
      configOverrides: { fetch: fetchImpl },
    });
    restoreGlobals = restore;

    const config = await bootstrapper.loadConfig();
    expect(fetchImpl).toHaveBeenCalledWith("config.json", { cache: "no-store" });
    expect(windowObj.__rwtraConfig).toEqual({ entry: "app.tsx" });
    expect(config).toEqual({ entry: "app.tsx" });
    restore();
  });

  it("throws when fetch is unavailable for config loading", async () => {
    const { bootstrapper, restore } = withBootstrapper({
      configOverrides: { fetch: null },
    });
    restoreGlobals = restore;
    await expect(bootstrapper._fetchConfig()).rejects.toThrow(
      "Fetch is unavailable when loading config.json"
    );
    restore();
  });

  it("reports config fetch failures when the response is not ok", async () => {
    const fetchImpl = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    );
    const { bootstrapper, restore } = withBootstrapper({
      configOverrides: { fetch: fetchImpl },
    });
    restoreGlobals = restore;
    await expect(bootstrapper._fetchConfig()).rejects.toThrow("Failed to load config.json");
    restore();
  });

  it("prepares assets by loading tools, compiling SCSS, and injecting CSS", async () => {
    const { bootstrapper, moduleLoader, restore } = withBootstrapper();
    restoreGlobals = restore;
    await bootstrapper._prepareAssets("styles.scss", [{ name: "tool" }]);
    expect(moduleLoader.loadTools).toHaveBeenCalledWith([{ name: "tool" }]);
    expect(moduleLoader.compileSCSS).toHaveBeenCalledWith("styles.scss");
    expect(moduleLoader.injectCSS).toHaveBeenCalledWith("");
    restore();
  });

  it("prepares modules and returns the registry, entry dir, and require helper", async () => {
    const registry = { mod: true };
    const requireFn = jest.fn();
    const localLoader = {};
    const { bootstrapper, moduleLoader, restore } = withBootstrapper({
      moduleLoaderOverrides: {
        loadModules: jest.fn().mockResolvedValue(registry),
        createLocalModuleLoader: jest.fn(() => localLoader),
        createRequire: jest.fn(() => requireFn),
      },
    });
    restoreGlobals = restore;

    const result = await bootstrapper._prepareModules("src/main.tsx", { modules: [] });
    expect(result.registry).toBe(registry);
    expect(result.entryDir).toBe("src");
    expect(result.requireFn).toBe(requireFn);
    expect(moduleLoader.createLocalModuleLoader).toHaveBeenCalledWith("src");
    restore();
  });

  it("compiles and renders the app, then logs success", async () => {
    const { bootstrapper, moduleLoader, logging, restore } = withBootstrapper();
    restoreGlobals = restore;
    await bootstrapper._compileAndRender(
      "entry.tsx",
      "styles.scss",
      { entry: "entry.tsx" },
      {},
      "",
      jest.fn()
    );
    expect(moduleLoader.compileTSX).toHaveBeenCalled();
    expect(moduleLoader.frameworkRender).toHaveBeenCalled();
    expect(logging.logClient).toHaveBeenCalledWith("bootstrap:success", {
      entryFile: "entry.tsx",
      scssFile: "styles.scss",
    });
    restore();
  });

  it("handles bootstrap errors by logging and rendering", () => {
    const { bootstrapper, logging, restore } = withBootstrapper({
      documentObj: { getElementById: () => ({ textContent: "" }) },
    });
    restoreGlobals = restore;
    const renderSpy = jest.spyOn(bootstrapper, "_renderBootstrapError");
    bootstrapper._handleBootstrapError(new Error("boom"));
    expect(logging.logClient).toHaveBeenCalledWith(
      "bootstrap:error",
      expect.objectContaining({ message: "boom" })
    );
    expect(renderSpy).toHaveBeenCalled();
    restore();
  });

  it("renders the bootstrap error into the root element when available", () => {
    const rootNode = { textContent: "" };
    const documentObj = { getElementById: () => rootNode };
    const { bootstrapper, restore } = withBootstrapper({ documentObj });
    restoreGlobals = restore;

    bootstrapper._renderBootstrapError(new Error("nope"));
    expect(rootNode.textContent).toBe("Bootstrap error: nope");
    restore();
  });

  it("bootstraps and catches failures via the public bootstrap method", async () => {
    const { bootstrapper, restore } = withBootstrapper();
    restoreGlobals = restore;
    const error = new Error("failure");
    jest.spyOn(bootstrapper, "_bootstrap").mockRejectedValue(error);
    const handleSpy = jest.spyOn(bootstrapper, "_handleBootstrapError");

    await bootstrapper.bootstrap();
    expect(handleSpy).toHaveBeenCalledWith(error);
    restore();
  });
});
