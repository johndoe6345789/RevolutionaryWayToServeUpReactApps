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

const createBootstrapper = ({ logging: loggingOverrides, network: networkOverrides, moduleLoader: moduleLoaderOverrides } = {}) => {
  const Bootstrapper = require(modulePath);
  const logging = createLogging(loggingOverrides);
  const network = createNetwork(networkOverrides);
  const moduleLoader = {
    loadModules: jest.fn().mockResolvedValue({}),
    createLocalModuleLoader: jest.fn(),
    createRequire: jest.fn(),
    compileTSX: jest.fn().mockResolvedValue(() => null),
    frameworkRender: jest.fn(),
    loadTools: jest.fn().mockResolvedValue(undefined),
    compileSCSS: jest.fn().mockResolvedValue(""),
    injectCSS: jest.fn(),
    ...moduleLoaderOverrides,
  };

  const bootstrapper = new Bootstrapper({ logging, network, moduleLoader });
  bootstrapper.initialize();
  return { bootstrapper, logging, network, moduleLoader };
};

describe("bootstrap/controllers/bootstrapper.js", () => {
  beforeEach(() => {
    jest.resetModules();
    delete global.window;
    delete global.document;
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it("determines the directory used to resolve entry files", () => {
    const { bootstrapper } = createBootstrapper();
    expect(bootstrapper._determineEntryDir("main.tsx")).toBe("");
    expect(bootstrapper._determineEntryDir("components/App.tsx")).toBe("components");
    expect(bootstrapper._determineEntryDir("components/ui/App.tsx")).toBe("components/ui");
  });

  it("configures provider fallbacks and delegates to the CI logging helpers", () => {
    const { bootstrapper, network } = createBootstrapper();
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
  });

  it("enables CI logging when detection returns true and logs it", () => {
    const { bootstrapper, logging } = createBootstrapper({
      logging: {
        detectCiLogging: jest.fn().mockReturnValue(true),
        isCiLoggingEnabled: jest.fn().mockReturnValue(true),
      },
    });
    const config = { entry: "main.tsx" };

    bootstrapper._enableCiLogging(config);

    expect(logging.detectCiLogging).toHaveBeenCalledWith(config);
    expect(logging.setCiLoggingEnabled).toHaveBeenCalledWith(true);
    expect(logging.logClient).toHaveBeenCalledWith(
      "ci:enabled",
      expect.objectContaining({ config: true })
    );
  });

  it("reads the href from the global window when available", () => {
    global.window = { location: { href: "https://bootstrap/tests" } };
    const { bootstrapper } = createBootstrapper();
    expect(bootstrapper._windowHref()).toBe("https://bootstrap/tests");
  });
});
