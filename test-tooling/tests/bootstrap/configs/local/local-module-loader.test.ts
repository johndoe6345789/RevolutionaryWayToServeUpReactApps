const LocalModuleLoaderConfig = require("../../../../bootstrap/configs/local/local-module-loader.js");

describe("bootstrap/configs/local/local-module-loader.js", () => {
  it("keeps dependency, registry, namespace, and fetch overrides", () => {
    const dependencies = { helper: true };
    const registry = { register: jest.fn() };
    const namespace = { helpers: {} };
    const fetch = jest.fn();

    const config = new LocalModuleLoaderConfig({
      dependencies,
      serviceRegistry: registry,
      namespace,
      fetch,
    });

    expect(config.dependencies).toBe(dependencies);
    expect(config.serviceRegistry).toBe(registry);
    expect(config.namespace).toBe(namespace);
    expect(config.fetch).toBe(fetch);
  });

  it("allows defaults when properties are omitted", () => {
    const config = new LocalModuleLoaderConfig();
    expect(config.dependencies).toBeUndefined();
    expect(config.serviceRegistry).toBeUndefined();
    expect(config.namespace).toBeUndefined();
    expect(config.fetch).toBeUndefined();
  });
});
