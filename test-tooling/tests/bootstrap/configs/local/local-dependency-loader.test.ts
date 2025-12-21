const LocalDependencyLoaderConfig = require("../../../../bootstrap/configs/local/local-dependency-loader.js");

describe("bootstrap/configs/local/local-dependency-loader.js", () => {
  it("stores overrides, helpers, helper registry, and CommonJS flag", () => {
    const overrides = { logging: true };
    const helpers = { logging: { ready: true } };
    const registry = { register: jest.fn() };

    const config = new LocalDependencyLoaderConfig({
      overrides,
      helpers,
      helperRegistry: registry,
      isCommonJs: true,
    });

    expect(config.overrides).toBe(overrides);
    expect(config.helpers).toBe(helpers);
    expect(config.helperRegistry).toBe(registry);
    expect(config.isCommonJs).toBe(true);
  });

  it("defaults to empty overrides/helpers and false CommonJS flag when not provided", () => {
    const config = new LocalDependencyLoaderConfig();
    expect(config.overrides).toEqual({});
    expect(config.helpers).toEqual({});
    expect(config.helperRegistry).toBeNull();
    expect(config.isCommonJs).toBe(false);
  });
});
