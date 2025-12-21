const NetworkEntryPoint = require("../../../../bootstrap/cdn/network-entrypoint.js");

describe("bootstrap/cdn/network-entrypoint.js", () => {
  let exports;
  let service;

  beforeEach(() => {
    const entrypoint = new NetworkEntryPoint();
    const result = entrypoint.run();
    exports = result.exports;
    service = result.service;
  });

  it("exposes the expected public network helpers", () => {
    [
      "loadScript",
      "normalizeProviderBase",
      "resolveProvider",
      "shouldRetryStatus",
      "probeUrl",
      "resolveModuleUrl",
      "setFallbackProviders",
      "getFallbackProviders",
      "setDefaultProviderBase",
      "getDefaultProviderBase",
      "setProviderAliases",
      "getProxyMode",
      "normalizeProviderBaseRaw",
    ].forEach((key) => {
      expect(typeof exports[key]).toBe("function");
    });
  });

  it("lets callers update fallback providers and observe the results", () => {
    exports.setFallbackProviders(["https://cdn.example.com/"]);
    expect(exports.getFallbackProviders()).toContain("https://cdn.example.com/");
    expect(exports.normalizeProviderBase("https://cdn.example.com/")).toBe("https://cdn.example.com/");
  });

  it("resolves production providers when no proxy overrides apply", () => {
    const mod = { provider: "https://production", ci_provider: "https://ci" };
    const resolved = exports.resolveProvider(mod);
    expect(resolved).toMatch(/https?:\/\/(ci|production)/);
    expect(exports.getProxyMode()).toBeTruthy();
  });
});
