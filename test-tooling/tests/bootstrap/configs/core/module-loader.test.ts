const ModuleLoaderConfig = require("../../../../../bootstrap/configs/core/module-loader.js");

describe("bootstrap/configs/core/module-loader.js", () => {
  it("stores the provided dependencies, registry, and environment root", () => {
    const dependencies = { helper: true };
    const registry = { register: jest.fn() };
    const envRoot = { name: "env" };

    const config = new ModuleLoaderConfig({
      dependencies,
      serviceRegistry: registry,
      environmentRoot: envRoot,
    });

    expect(config.dependencies).toBe(dependencies);
    expect(config.serviceRegistry).toBe(registry);
    expect(config.environmentRoot).toBe(envRoot);
  });

  it("leaves values undefined when not provided", () => {
    const config = new ModuleLoaderConfig();
    expect(config.dependencies).toBeUndefined();
    expect(config.serviceRegistry).toBeUndefined();
    expect(config.environmentRoot).toBeUndefined();
  });
});
