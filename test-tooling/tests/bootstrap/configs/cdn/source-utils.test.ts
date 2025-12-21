const SourceUtilsConfig = require("../../../../../bootstrap/configs/cdn/source-utils.js");

describe("bootstrap/configs/cdn/source-utils.js", () => {
  it("defaults to undefined registry and namespace", () => {
    const config = new SourceUtilsConfig();
    expect(config.serviceRegistry).toBeUndefined();
    expect(config.namespace).toBeUndefined();
  });

  it("stores provided registry and namespace", () => {
    const serviceRegistry = { register: jest.fn() };
    const namespace = { helpers: {} };
    const config = new SourceUtilsConfig({ serviceRegistry, namespace });

    expect(config.serviceRegistry).toBe(serviceRegistry);
    expect(config.namespace).toBe(namespace);
  });
});
