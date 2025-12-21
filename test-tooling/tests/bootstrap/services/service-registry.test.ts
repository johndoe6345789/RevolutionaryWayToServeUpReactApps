describe("bootstrap/services/service-registry.js", () => {
  const modulePath = '../../../../bootstrap/services/service-registry.js';
  const ServiceRegistry = require(modulePath);

  it('stores service instances and metadata by name', () => {
    const registry = new ServiceRegistry();
    const service = { start: () => "ok" };
    const metadata = { scope: "app", eager: true };

    registry.register("logging", service, metadata);

    expect(registry.getService("logging")).toBe(service);
    expect(registry.getMetadata("logging")).toBe(metadata);
    expect(registry.listServices()).toEqual(["logging"]);
    expect(registry.isRegistered("logging")).toBe(true);
    expect(registry.isRegistered("missing")).toBe(false);
  });

  it('rejects duplicates, missing names, and supports reset', () => {
    const registry = new ServiceRegistry();

    registry.register("network", { connect: () => true });
    expect(() => registry.register("network", { connect: () => false }))
      .toThrow("Service already registered: network");
    expect(() => registry.register("", { connect: () => true }))
      .toThrow("Service name is required");

    registry.reset();
    expect(registry.listServices()).toEqual([]);
    expect(registry.isRegistered("network")).toBe(false);
  });
});
