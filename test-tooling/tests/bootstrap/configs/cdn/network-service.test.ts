const NetworkServiceConfig = require("../../../../../bootstrap/configs/cdn/network-service.js");

describe("bootstrap/configs/cdn/network-service.js", () => {
  it("defaults isCommonJs to the module environment", () => {
    const expected = typeof module !== "undefined" && module.exports;
    const config = new NetworkServiceConfig();

    expect(config.isCommonJs).toBe(expected);
    expect(config.logClient).toBeUndefined();
    expect(config.wait).toBeUndefined();
    expect(config.namespace).toBeUndefined();
  });

  it("stores provided configuration values", () => {
    const overrides = {
      logClient: jest.fn(),
      wait: jest.fn(),
      namespace: { helpers: {} },
      providerConfig: { providers: [] },
      probeConfig: { timeout: 10 },
      moduleResolverConfig: { maxRetries: 2 },
      isCommonJs: false,
    };
    const config = new NetworkServiceConfig(overrides);

    expect(config.logClient).toBe(overrides.logClient);
    expect(config.wait).toBe(overrides.wait);
    expect(config.namespace).toBe(overrides.namespace);
    expect(config.providerConfig).toBe(overrides.providerConfig);
    expect(config.probeConfig).toBe(overrides.probeConfig);
    expect(config.moduleResolverConfig).toBe(overrides.moduleResolverConfig);
    expect(config.isCommonJs).toBe(false);
  });
});
