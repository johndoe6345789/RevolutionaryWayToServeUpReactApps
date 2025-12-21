const NetworkProviderService = require("../../../../../bootstrap/services/cdn/network/network-provider-service.js");
const NetworkProviderServiceConfig = require("../../../../../bootstrap/configs/cdn/network-provider-service.js");

describe("bootstrap/services/cdn/network/network-provider-service.js", () => {
  const buildService = (overrides = {}) => {
    const config = new NetworkProviderServiceConfig({
      globalObject: overrides.globalObject ?? {},
      defaultFallbackProviders: overrides.defaultFallbackProviders ?? [
        "https://cdn.example/",
      ],
      fallbackProviders: overrides.fallbackProviders ?? ["https://fallback.example/"],
      defaultProviderBase: overrides.defaultProviderBase ?? "https://primary.example/",
      defaultProviderAliases: overrides.defaultProviderAliases ?? {
        jsdelivr: "cdn.jsdelivr.net",
      },
      proxyModeAuto: overrides.proxyModeAuto ?? "auto",
      proxyModeProxy: overrides.proxyModeProxy ?? "proxy",
      proxyModeDirect: overrides.proxyModeDirect ?? "direct",
    });
    return new NetworkProviderService(config).initialize();
  };

  describe("initialize", () => {
    test("applies config and marks initialized", () => {
      const globalObject = { name: "global" };
      const service = buildService({ globalObject });
      expect(service.initialized).toBe(true);
      expect(service.globalObject).toBe(globalObject);
      expect(service.fallbackProviders).toEqual(["https://fallback.example/"]);
    });
  });

  describe("_applyConfig", () => {
    test("copies config values onto the service", () => {
      const globalObject = { name: "global" };
      const config = new NetworkProviderServiceConfig({
        globalObject,
        defaultFallbackProviders: ["https://a.example/"],
        fallbackProviders: ["https://b.example/"],
        defaultProviderBase: "https://base.example/",
        defaultProviderAliases: { cdn: "cdn.example" },
        proxyModeAuto: "auto",
        proxyModeProxy: "proxy",
        proxyModeDirect: "direct",
      });
      const service = new NetworkProviderService(config);

      service._applyConfig();

      expect(service.globalObject).toBe(globalObject);
      expect(service.defaultFallbackProviders).toEqual(["https://a.example/"]);
      expect(service.fallbackProviders).toEqual(["https://b.example/"]);
      expect(service.defaultProviderBase).toBe("https://base.example/");
      expect(service.providerAliases.get("cdn")).toBe("https://cdn.example/");
    });
  });

  describe("setFallbackProviders", () => {
    test("resets to defaults when providers are missing", () => {
      const service = buildService({
        defaultFallbackProviders: ["https://default.example/"],
        fallbackProviders: ["https://old.example/"],
      });

      service.setFallbackProviders(null);

      expect(service.getFallbackProviders()).toEqual(["https://default.example/"]);
    });

    test("normalizes and filters provider bases", () => {
      const service = buildService({
        defaultFallbackProviders: ["https://default.example/"],
      });

      service.setFallbackProviders(["cdn.example", ""]);

      expect(service.getFallbackProviders()).toEqual(["https://cdn.example/"]);
    });

    test("falls back to defaults when normalization yields no entries", () => {
      const service = buildService({
        defaultFallbackProviders: ["https://default.example/"],
      });

      service.setFallbackProviders(["", null]);

      expect(service.getFallbackProviders()).toEqual(["https://default.example/"]);
    });
  });

  describe("getFallbackProviders", () => {
    test("returns a copy of the fallback providers", () => {
      const service = buildService();
      const list = service.getFallbackProviders();
      list.push("https://mutate.example/");
      expect(service.getFallbackProviders()).toEqual(["https://fallback.example/"]);
    });
  });

  describe("setDefaultProviderBase/getDefaultProviderBase", () => {
    test("normalizes and stores the default provider base", () => {
      const service = buildService();
      service.setDefaultProviderBase("cdn.example");
      expect(service.getDefaultProviderBase()).toBe("https://cdn.example/");
    });
  });

  describe("setProviderAliases", () => {
    test("merges defaults with provided aliases", () => {
      const service = buildService({
        defaultProviderAliases: { legacy: "legacy.example" },
      });

      service.setProviderAliases({ modern: "modern.example" });

      expect(service.providerAliases.get("legacy")).toBe("https://legacy.example/");
      expect(service.providerAliases.get("modern")).toBe("https://modern.example/");
    });
  });

  describe("normalizeProxyMode", () => {
    test("returns auto when mode is missing or invalid", () => {
      const service = buildService();
      expect(service.normalizeProxyMode()).toBe("auto");
      expect(service.normalizeProxyMode("unknown")).toBe("auto");
    });

    test("normalizes valid proxy modes", () => {
      const service = buildService();
      expect(service.normalizeProxyMode("PROXY")).toBe("proxy");
      expect(service.normalizeProxyMode(" direct ")).toBe("direct");
    });
  });

  describe("getProxyMode", () => {
    test("prefers the global override", () => {
      const service = buildService({
        globalObject: { __RWTRA_PROXY_MODE__: "proxy" },
      });
      expect(service.getProxyMode()).toBe("proxy");
    });

    test("falls back to environment variable when global is auto", () => {
      const service = buildService({
        globalObject: { process: { env: { RWTRA_PROXY_MODE: "direct" } } },
      });
      expect(service.getProxyMode()).toBe("direct");
    });

    test("defaults to auto when no overrides apply", () => {
      const service = buildService({ globalObject: {} });
      expect(service.getProxyMode()).toBe("auto");
    });
  });

  describe("isCiLikeHost", () => {
    test("returns false when window is unavailable", () => {
      const service = buildService({ globalObject: {} });
      expect(service.isCiLikeHost()).toBe(false);
    });

    test("detects localhost-like hosts", () => {
      const service = buildService({
        globalObject: { window: { location: { hostname: "localhost" } } },
      });
      expect(service.isCiLikeHost()).toBe(true);
    });
  });

  describe("normalizeProviderBase", () => {
    test("returns alias when configured", () => {
      const service = buildService({
        defaultProviderAliases: { alias: "cdn.example" },
      });
      expect(service.normalizeProviderBase("alias")).toBe("https://cdn.example/");
    });

    test("normalizes raw provider values when no alias exists", () => {
      const service = buildService();
      expect(service.normalizeProviderBase("cdn.example")).toBe("https://cdn.example/");
    });
  });

  describe("normalizeProviderBaseRaw", () => {
    test("normalizes raw provider values", () => {
      const service = buildService();
      expect(service.normalizeProviderBaseRaw("cdn.example")).toBe("https://cdn.example/");
    });
  });

  describe("resolveProvider", () => {
    test("resolves based on proxy mode preferences", () => {
      const service = buildService({
        globalObject: { __RWTRA_PROXY_MODE__: "proxy" },
      });
      const mod = { ci_provider: "https://ci.example/", production_provider: "https://prod.example/" };
      expect(service.resolveProvider(mod)).toBe("https://ci.example/");
    });

    test("falls back to default provider base when module has none", () => {
      const service = buildService({ defaultProviderBase: "https://default.example/" });
      expect(service.resolveProvider({})).toBe("https://default.example/");
    });
  });

  describe("collectBases", () => {
    test("collects normalized bases with fallbacks", () => {
      const service = buildService({
        fallbackProviders: ["cdn.example", "https://fallback.example/"],
      });
      const mod = { provider: "primary.example" };
      expect(service.collectBases(mod)).toEqual([
        "https://primary.example/",
        "https://cdn.example/",
        "https://fallback.example/",
      ]);
    });

    test("skips fallbacks when jsdelivr is disabled", () => {
      const service = buildService({
        fallbackProviders: ["cdn.example"],
      });
      const mod = { provider: "primary.example", allowJsDelivr: false };
      expect(service.collectBases(mod)).toEqual(["https://primary.example/"]);
    });
  });
});
