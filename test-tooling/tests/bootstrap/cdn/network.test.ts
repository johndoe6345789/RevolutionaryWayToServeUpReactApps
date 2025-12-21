const network = require("../../../../bootstrap/cdn/network.js");

describe("bootstrap/cdn/network.js helpers", () => {
  it("normalizes provider bases into absolute URLs", () => {
    const normalized = network.normalizeProviderBase("unpkg.com");
    expect(normalized).toBe("https://unpkg.com/");
    expect(network.normalizeProviderBase("")).toBe("");
  });

  it("exposes provider configuration helpers backed by the provider service", () => {
    network.setDefaultProviderBase("https://cdn.example.com/");
    expect(network.getDefaultProviderBase()).toBe("https://cdn.example.com/");

    network.setProviderAliases({ alias: "https://alias.example.com/" });
    expect(network.normalizeProviderBase("alias")).toBe("https://alias.example.com/");
  });

  it("resolves candidate providers using proxy rules", () => {
    const mod = {
      provider: "https://production",
      ci_provider: "https://ci",
    };
    const resolved = network.resolveProvider(mod);
    expect(resolved).toMatch(/https?:\/\/(ci|production)/);
  });

  afterEach(() => {
    network.setFallbackProviders([]);
    network.setProviderAliases({});
    network.setDefaultProviderBase("");
  });
});
