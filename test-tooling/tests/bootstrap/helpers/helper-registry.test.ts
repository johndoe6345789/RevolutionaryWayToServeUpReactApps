describe("bootstrap/helpers/helper-registry.js", () => {
  const modulePath = '../../../../bootstrap/helpers/helper-registry.js';
  const HelperRegistry = require(modulePath);

  it('registers a helper with metadata and exposes it by name', () => {
    const registry = new HelperRegistry();
    const helper = { ping: () => "pong" };
    const metadata = { scope: "runtime", version: 2 };

    registry.register("core:health", helper, metadata);

    expect(registry.getHelper("core:health")).toBe(helper);
    expect(registry.getMetadata("core:health")).toBe(metadata);
    expect(registry.listHelpers()).toEqual(["core:health"]);
    expect(registry.isRegistered("core:health")).toBe(true);
    expect(registry.isRegistered("missing")).toBe(false);
  });

  it('rejects duplicate registrations and missing names', () => {
    const registry = new HelperRegistry();

    registry.register("ui:nav", { render: () => null });
    expect(() => registry.register("ui:nav", { render: () => null }))
      .toThrow("Helper already registered: ui:nav");
    expect(() => registry.register("", { render: () => null }))
      .toThrow("Helper name is required");
  });
});
