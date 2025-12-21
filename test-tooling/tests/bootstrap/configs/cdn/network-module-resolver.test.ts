const NetworkModuleResolverConfig = require("../../../../../bootstrap/configs/cdn/network-module-resolver.js");

describe("bootstrap/configs/cdn/network-module-resolver.js", () => {
  it("defaults to a no-op logger", () => {
    const config = new NetworkModuleResolverConfig();
    expect(config.providerService).toBeUndefined();
    expect(config.probeService).toBeUndefined();
    expect(typeof config.logClient).toBe("function");
    expect(() => config.logClient("message")).not.toThrow();
  });

  it("stores provided services and logger", () => {
    const providerService = { resolveProvider: jest.fn() };
    const probeService = { probeUrl: jest.fn() };
    const logClient = jest.fn();
    const config = new NetworkModuleResolverConfig({ providerService, probeService, logClient });

    expect(config.providerService).toBe(providerService);
    expect(config.probeService).toBe(probeService);
    expect(config.logClient).toBe(logClient);
  });
});
