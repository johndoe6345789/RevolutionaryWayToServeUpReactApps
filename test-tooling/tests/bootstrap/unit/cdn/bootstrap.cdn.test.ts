import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  resetServiceRegistry
} from "./testGlobals";

const createLocation = (href: string) => {
  const url = new URL(href);
  return {
    href: url.href,
    hostname: url.hostname,
    search: url.search,
    host: url.host,
    origin: url.origin,
    protocol: url.protocol,
    pathname: url.pathname
  };
};

const resetGlobals = () => {
  global.__rwtraBootstrap = { helpers: {} };
  delete global.__RWTRA_PROXY_MODE__;
  resetServiceRegistry();
};

beforeEach(() => {
  resetGlobals();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("logging helpers", () => {
  const loadLogging = async () => {
    delete (require.cache as Record<string, unknown>)[require.resolve("../../bootstrap/cdn/logging.js")];
    return require("../../bootstrap/cdn/logging.js");
  };

  it("detects ci logging via query params and host", async () => {
    const logging = await loadLogging();
    expect(
      logging.detectCiLogging({}, createLocation("http://localhost/?ci=1"))
    ).toBe(true);

    expect(
      logging.detectCiLogging({}, createLocation("https://example.com/?ci=true"))
    ).toBe(true);

    expect(
      logging.detectCiLogging(
        { ciLogging: true },
        createLocation("https://example.com/")
      )
    ).toBe(true);
  });

  it("serializes errors and sends client logs when enabled", async () => {
    const logging = await loadLogging();
    const sendBeacon = jest.fn();
    Object.defineProperty(navigator, "sendBeacon", { value: sendBeacon, configurable: true });
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

    logging.setCiLoggingEnabled(true);
    const serialized = logging.serializeForLog(new Error("boom"));
    expect(serialized).toMatchObject({ message: "boom" });

    logging.logClient("event", { nested: { ok: true } });
    expect(sendBeacon).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith("[bootstrap]", "event", { nested: { ok: true } });
  });
});

describe("network helpers", () => {
  const loadNetwork = async () => {
    jest.resetModules();
    const logging = require("../../bootstrap/cdn/logging.js");
    const logClientSpy = jest
      .spyOn(logging, "logClient")
      .mockImplementation(() => {});
    jest.spyOn(logging, "wait").mockImplementation(() => Promise.resolve());

    const networkPath = require.resolve("../../bootstrap/cdn/network.js");
    delete require.cache[networkPath];
    const network = require(networkPath);

    return { network, logClientSpy };
  };

  it("normalizes provider bases and resolves providers respecting proxy mode", async () => {
    const { network } = await loadNetwork();
    network.setProviderAliases({ cdn: "https://cdn.example/" });
    expect(network.normalizeProviderBase("cdn")).toBe("https://cdn.example/");
    expect(network.normalizeProviderBase("example.com"))
      .toBe("https://example.com/");

    global.__RWTRA_PROXY_MODE__ = "proxy";
    const proxied = network.resolveProvider({ ci_provider: "https://ci/", production_provider: "https://prod/" });
    expect(proxied).toBe("https://ci/");

    global.__RWTRA_PROXY_MODE__ = "direct";
    const direct = network.resolveProvider({ ci_provider: "https://ci/", production_provider: "https://prod/" });
    expect(direct).toBe("https://prod/");
  });

  it("probes urls with retries and logs failures", async () => {
    const { network, logClientSpy } = await loadNetwork();
    const fetchMock = jest.spyOn(global, "fetch");
    // First HEAD fails, GET succeeds
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 405 } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

    await expect(network.probeUrl("https://example.com"))
      .resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Now exhaust retries and ensure failure is logged
    logClientSpy.mockClear();
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    await expect(network.probeUrl("https://fail.test", { retries: 0 })).resolves.toBe(false);
    expect(logClientSpy).toHaveBeenCalled();
  });

  it("resolves module urls from candidates and throws when none respond", async () => {
    const { network } = await loadNetwork();
    network.setFallbackProviders(["https://fallback/"]);
    const fetchMock = jest.spyOn(global, "fetch");
    fetchMock.mockResolvedValue({ ok: true, status: 200 } as Response);

    const url = await network.resolveModuleUrl({
      name: "test",
      package: "pkg",
      version: "1.0.0",
      file: "file.js",
      provider: "https://primary/"
    });
    expect(url).toContain("https://primary/pkg@1.0.0/file.js");

    fetchMock.mockResolvedValue({ ok: false, status: 500 } as Response);
    await expect(network.resolveModuleUrl({ name: "broken" })).rejects.toThrow(
      /Unable to resolve URL/
    );
  });
});

describe("dynamic modules", () => {
  const loadDynamicModules = async () => {
    jest.resetModules();
    const logging = require("../../bootstrap/cdn/logging.js");
    const logClient = jest
      .spyOn(logging, "logClient")
      .mockImplementation(() => {});
    jest.spyOn(logging, "wait").mockImplementation(() => Promise.resolve());

    jest.doMock("../../bootstrap/cdn/network.js", () => ({
      loadScript: jest.fn(() => Promise.resolve()),
      probeUrl: jest.fn(async (url: string) => url.includes("ci")),
      normalizeProviderBase: (b: string) => (b.endsWith("/") ? b : `${b}/`),
      getFallbackProviders: () => ["https://fallback/"],
      getDefaultProviderBase: () => "https://default/"
    }));

    delete require.cache[require.resolve("../../bootstrap/cdn/dynamic-modules.js")];
    const dynamicModules = require("../../bootstrap/cdn/dynamic-modules.js");
    jest.dontMock("../../bootstrap/cdn/network.js");

    return { exports: dynamicModules, logClient };
  };

  it("loads globals for matching rules and records registry entries", async () => {
    const { exports: dynamicModules, logClient } = await loadDynamicModules();

    // Script would normally attach this global
    // @ts-expect-error - test global
    window.ICON_test = { default: { ready: true }, extra: "value" };

    const registry: Record<string, unknown> = {};
    const result = await dynamicModules.loadDynamicModule(
      "icon:test",
      {
        dynamicModules: [
          {
            prefix: "icon:",
            provider: "https://provider/",
            production_provider: "https://prod/",
            ci_provider: "https://ci/",
            allowJsDelivr: true,
            package: "pkg",
            version: "9.9.9",
            filePattern: "{icon}.js",
            globalPattern: "ICON_{icon}",
            format: "global"
          }
        ]
      },
      registry
    );

    expect(result.default).toEqual({ ready: true });
    expect(registry["icon:test"]).toBe(result);
    expect(logClient).toHaveBeenCalledWith("dynamic-module:loaded", expect.any(Object));
  });

  it("throws when no matching dynamic rule exists", async () => {
    const { exports: dynamicModules } = await loadDynamicModules();
    await expect(
      dynamicModules.loadDynamicModule("missing:icon", { dynamicModules: [] }, {})
    ).rejects.toThrow(/No dynamic rule/);
  });
});
