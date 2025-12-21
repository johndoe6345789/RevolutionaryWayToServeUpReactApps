const SassCompilerConfig = require("../../../../bootstrap/configs/local/sass-compiler.js");

describe("bootstrap/configs/local/sass-compiler.js", () => {
  it("stores fetch, document, Sass implementation, registry, and namespace", () => {
    const fetch = jest.fn();
    const document = { head: {} };
    const SassImpl = jest.fn();
    const registry = { register: jest.fn() };
    const namespace = { helpers: {} };

    const config = new SassCompilerConfig({
      fetch,
      document,
      SassImpl,
      serviceRegistry: registry,
      namespace,
    });

    expect(config.fetch).toBe(fetch);
    expect(config.document).toBe(document);
    expect(config.SassImpl).toBe(SassImpl);
    expect(config.serviceRegistry).toBe(registry);
    expect(config.namespace).toBe(namespace);
  });

  it("allows undefined values when constructors omit optional helpers", () => {
    const config = new SassCompilerConfig();
    expect(config.fetch).toBeUndefined();
    expect(config.document).toBeUndefined();
    expect(config.SassImpl).toBeUndefined();
    expect(config.serviceRegistry).toBeUndefined();
    expect(config.namespace).toBeUndefined();
  });
});
