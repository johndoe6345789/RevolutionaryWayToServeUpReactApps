const BootstrapperConfig = require("../../../../../bootstrap/configs/core/bootstrapper.js");

describe("bootstrap/configs/core/bootstrapper.js", () => {
  it("sets defaults when constructed with no overrides", () => {
    const config = new BootstrapperConfig();
    expect(config.configUrl).toBe("config.json");
    expect(config.fetch).toBeUndefined();
    expect(config.logging).toBeUndefined();
    expect(config.network).toBeUndefined();
    expect(config.moduleLoader).toBeUndefined();
  });

  it("stores provided overrides", () => {
    const overrides = {
      configUrl: "/custom-config.json",
      fetch: jest.fn(),
      logging: { logClient: jest.fn() },
      network: { normalizeProviderBase: jest.fn() },
      moduleLoader: { loadModules: jest.fn() },
    };

    const config = new BootstrapperConfig(overrides);

    expect(config.configUrl).toBe("/custom-config.json");
    expect(config.fetch).toBe(overrides.fetch);
    expect(config.logging).toBe(overrides.logging);
    expect(config.network).toBe(overrides.network);
    expect(config.moduleLoader).toBe(overrides.moduleLoader);
  });
});
