const ModuleLoaderEnvironment = require('../../../../bootstrap/services/core/module-loader-environment.js');

describe('bootstrap/services/core/module-loader-environment.js', () => {
  test('requires a root object to initialize the environment', () => {
    expect(() => new ModuleLoaderEnvironment()).toThrow(
      'Root object required for ModuleLoaderEnvironment'
    );
  });

  test('creates a bootstrap namespace with helper slots on the root', () => {
    const root = {};
    const env = new ModuleLoaderEnvironment(root);

    expect(env.global).toBe(root);
    expect(root.__rwtraBootstrap).toBeDefined();
    expect(env.namespace).toBe(root.__rwtraBootstrap);
    expect(env.helpers).toBe(root.__rwtraBootstrap.helpers);
    expect(env.isCommonJs).toBe(true);
  });
});
