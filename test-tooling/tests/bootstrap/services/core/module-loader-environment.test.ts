describe("bootstrap/services/core/module-loader-environment.js", () => {
  const modulePath = '../../../../../bootstrap/services/core/module-loader-environment.js';

  it('creates a bootstrap namespace and helpers on the provided root', () => {
    const ModuleLoaderEnvironment = require(modulePath);
    const root = {};

    const env = new ModuleLoaderEnvironment(root);

    expect(env.global).toBe(root);
    expect(root.__rwtraBootstrap).toBe(env.namespace);
    expect(root.__rwtraBootstrap.helpers).toBe(env.helpers);
    expect(env.helpers).toEqual({});
  });

  it('reuses existing namespace helpers and reports the CommonJS flag', () => {
    const ModuleLoaderEnvironment = require(modulePath);
    const helpers = { read: () => "ok" };
    const root = { __rwtraBootstrap: { helpers } };

    const env = new ModuleLoaderEnvironment(root);

    expect(env.namespace).toBe(root.__rwtraBootstrap);
    expect(env.helpers).toBe(helpers);
    expect(env.isCommonJs).toBe(typeof module !== "undefined" && module.exports);
  });
});
