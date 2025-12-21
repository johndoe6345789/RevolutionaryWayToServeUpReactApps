describe("bootstrap/services/service-registry.js", () => {
  const modulePath = '../../../../bootstrap/services/service-registry.js';
  const ServiceRegistry = require(modulePath);

  it('stores service instances and metadata by name', () => {
    const registry = new ServiceRegistry();
    const service = { start: () => "ok" };
    const metadata = { scope: "app", eager: true };

    registry.register("logging", service, metadata, []);

    expect(registry.getService("logging")).toBe(service);
    expect(registry.getMetadata("logging")).toBe(metadata);
    expect(registry.listServices()).toEqual(["logging"]);
    expect(registry.isRegistered("logging")).toBe(true);
    expect(registry.isRegistered("missing")).toBe(false);
  });

  it('rejects duplicates, missing names, and supports reset', () => {
    const registry = new ServiceRegistry();

    registry.register("network", { connect: () => true }, {}, []);
    expect(() => registry.register("network", { connect: () => false }, {}, []))
      .toThrow("Service already registered: network");
    expect(() => registry.register("", { connect: () => true }, {}, []))
      .toThrow("Service name is required");

    registry.reset();
    expect(registry.listServices()).toEqual([]);
    expect(registry.isRegistered("network")).toBe(false);
  });

  it('validates required services', () => {
    const registry = new ServiceRegistry();

    // Register initial services
    registry.register("logger", { log: () => {} }, {}, []);
    registry.register("config", { get: () => {} }, {}, []);

    // Should succeed when all required services are registered
    expect(() => {
      registry.register("database", { connect: () => {} }, {}, ["logger", "config"]);
    }).not.toThrow();

    expect(registry.isRegistered("database")).toBe(true);

    // Should fail when required services are missing
    expect(() => {
      registry.register("api", { call: () => {} }, {}, ["missing-service"]);
    }).toThrow("Required services are not registered: missing-service");

    expect(() => {
      registry.register("cache", { get: () => {} }, {}, ["logger", "missing1", "missing2"]);
    }).toThrow("Required services are not registered: missing1, missing2");
  });
});
