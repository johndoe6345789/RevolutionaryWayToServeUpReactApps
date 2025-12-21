const LocalPathsConfig = require("../../../../bootstrap/configs/local/local-paths.js");

describe("bootstrap/configs/local/local-paths.js", () => {
  it("stores the provided service registry and namespace", () => {
    const registry = { register: jest.fn() };
    const namespace = { helpers: {} };

    const config = new LocalPathsConfig({
      serviceRegistry: registry,
      namespace,
    });

    expect(config.serviceRegistry).toBe(registry);
    expect(config.namespace).toBe(namespace);
  });

  it("keeps properties undefined when not supplied", () => {
    const config = new LocalPathsConfig();
    expect(config.serviceRegistry).toBeUndefined();
    expect(config.namespace).toBeUndefined();
  });
});
