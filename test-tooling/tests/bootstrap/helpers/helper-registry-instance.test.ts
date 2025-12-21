describe("bootstrap/helpers/helper-registry-instance.js", () => {
  const instancePath = '../../../../bootstrap/helpers/helper-registry-instance.js';
  const HelperRegistry = require('../../../../bootstrap/helpers/helper-registry.js');

  beforeEach(() => {
    delete require.cache[require.resolve(instancePath)];
  });

  it('exports a singleton HelperRegistry instance', () => {
    const registry = require(instancePath);

    expect(registry).toBeInstanceOf(HelperRegistry);
    expect(registry).toBe(require(instancePath));
  });

  it('persists registrations across multiple imports', () => {
    const registry = require(instancePath);

    registry.register("shared:clock", { now: () => 123 });

    const reimported = require(instancePath);
    expect(reimported.getHelper("shared:clock")).toBeDefined();
    expect(reimported.getHelper("shared:clock")).toBe(registry.getHelper("shared:clock"));
  });
});
