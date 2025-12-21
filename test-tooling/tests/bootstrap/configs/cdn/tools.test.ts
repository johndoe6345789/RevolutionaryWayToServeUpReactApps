const ToolsLoaderConfig = require("../../../../../bootstrap/configs/cdn/tools.js");

describe("bootstrap/configs/cdn/tools.js", () => {
  it("defaults to undefined dependencies", () => {
    const config = new ToolsLoaderConfig();
    expect(config.dependencies).toBeUndefined();
    expect(config.serviceRegistry).toBeUndefined();
    expect(config.namespace).toBeUndefined();
  });

  it("stores provided dependencies", () => {
    const overrides = {
      dependencies: { logging: {} },
      serviceRegistry: { register: jest.fn() },
      namespace: { helpers: {} },
    };
    const config = new ToolsLoaderConfig(overrides);

    expect(config.dependencies).toBe(overrides.dependencies);
    expect(config.serviceRegistry).toBe(overrides.serviceRegistry);
    expect(config.namespace).toBe(overrides.namespace);
  });
});
