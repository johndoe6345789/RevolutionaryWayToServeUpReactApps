describe("bootstrap/registries/service-registry-instance.js", () => {
  const instancePath = '../../../../bootstrap/registries/service-registry-instance.js';
  const ServiceRegistry = require('../../../../bootstrap/registries/service-registry.js');

  it('exports a singleton ServiceRegistry instance', () => {
    const registry = require(instancePath);

    expect(registry).toBeInstanceOf(ServiceRegistry);
    expect(registry).toBe(require(instancePath));
  });

  it('reuses the same registry between imports and supports reset', () => {
    const registry = require(instancePath);

    registry.register("router", { navigate: () => "/home" }, {}, []);

    const secondImport = require(instancePath);
    expect(secondImport.getService("router")).toBeDefined();

    secondImport.reset();
    expect(registry.listServices()).toEqual([]);
  });
});
