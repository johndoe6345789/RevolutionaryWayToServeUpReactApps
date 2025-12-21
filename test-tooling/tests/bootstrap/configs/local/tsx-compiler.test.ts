const TsxCompilerConfig = require("../../../../bootstrap/configs/local/tsx-compiler.js");

describe("bootstrap/configs/local/tsx-compiler.js", () => {
  it("captures logging, source utils, registry, namespace, fetch, and Babel overrides", () => {
    const logging = { log: jest.fn() };
    const sourceUtils = { collect: jest.fn() };
    const registry = { register: jest.fn() };
    const namespace = { helpers: {} };
    const fetch = jest.fn();
    const Babel = jest.fn();

    const config = new TsxCompilerConfig({
      logging,
      sourceUtils,
      serviceRegistry: registry,
      namespace,
      fetch,
      Babel,
    });

    expect(config.logging).toBe(logging);
    expect(config.sourceUtils).toBe(sourceUtils);
    expect(config.serviceRegistry).toBe(registry);
    expect(config.namespace).toBe(namespace);
    expect(config.fetch).toBe(fetch);
    expect(config.Babel).toBe(Babel);
  });

  it("allows optional overrides to be omitted", () => {
    const config = new TsxCompilerConfig();
    expect(config.logging).toBeUndefined();
    expect(config.sourceUtils).toBeUndefined();
    expect(config.serviceRegistry).toBeUndefined();
    expect(config.namespace).toBeUndefined();
    expect(config.fetch).toBeUndefined();
    expect(config.Babel).toBeUndefined();
  });
});
