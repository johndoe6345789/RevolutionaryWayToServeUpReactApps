const LocalLoaderConfig = require("../../../../bootstrap/configs/local/local-loader.js");

describe("bootstrap/configs/local/local-loader.js", () => {
  it("captures dependencies, registry, namespace, and document references", () => {
    const dependencies = { helper: true };
    const registry = { register: jest.fn() };
    const namespace = { helpers: {} };
    const document = { body: {} };

    const config = new LocalLoaderConfig({
      dependencies,
      serviceRegistry: registry,
      namespace,
      document,
    });

    expect(config.dependencies).toBe(dependencies);
    expect(config.serviceRegistry).toBe(registry);
    expect(config.namespace).toBe(namespace);
    expect(config.document).toBe(document);
  });

  it("allows undefined values when optional data is missing", () => {
    const config = new LocalLoaderConfig();
    expect(config.dependencies).toBeUndefined();
    expect(config.serviceRegistry).toBeUndefined();
    expect(config.namespace).toBeUndefined();
    expect(config.document).toBeUndefined();
  });
});
