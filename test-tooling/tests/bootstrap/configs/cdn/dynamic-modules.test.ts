const DynamicModulesConfig = require("../../../../../bootstrap/configs/cdn/dynamic-modules.js");

describe("bootstrap/configs/cdn/dynamic-modules.js", () => {
  it("keeps dependencies and registry undefined by default", () => {
    const config = new DynamicModulesConfig();
    expect(config.dependencies).toBeUndefined();
    expect(config.serviceRegistry).toBeUndefined();
    expect(config.namespace).toBeUndefined();
  });

  it("stores provided dependencies and namespaces", () => {
    const overrides = {
      dependencies: { moduleLoader: {} },
      serviceRegistry: { register: jest.fn() },
      namespace: { helpers: {} },
    };
    const config = new DynamicModulesConfig(overrides);

    expect(config.dependencies).toBe(overrides.dependencies);
    expect(config.serviceRegistry).toBe(overrides.serviceRegistry);
    expect(config.namespace).toBe(overrides.namespace);
  });
});
