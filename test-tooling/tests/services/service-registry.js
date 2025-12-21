const ServiceRegistry = require("../../../bootstrap/services/service-registry.js");

describe("bootstrap/services/service-registry.js", () => {
  describe("constructor", () => {
    test("starts with no services registered", () => {
      const registry = new ServiceRegistry();
      expect(registry.listServices()).toEqual([]);
    });
  });

  describe("register", () => {
    test("stores a service and metadata", () => {
      const registry = new ServiceRegistry();
      const service = { name: "service" };
      const metadata = { folder: "services" };

      registry.register("alpha", service, metadata);

      expect(registry.getService("alpha")).toBe(service);
      expect(registry.getMetadata("alpha")).toBe(metadata);
      expect(registry.isRegistered("alpha")).toBe(true);
    });

    test("throws when the name is missing", () => {
      const registry = new ServiceRegistry();
      expect(() => registry.register("", {})).toThrow("Service name is required");
    });

    test("throws when registering the same name twice", () => {
      const registry = new ServiceRegistry();
      registry.register("alpha", {});
      expect(() => registry.register("alpha", {})).toThrow("Service already registered: alpha");
    });
  });

  describe("getService", () => {
    test("returns undefined when no service exists", () => {
      const registry = new ServiceRegistry();
      expect(registry.getService("missing")).toBeUndefined();
    });
  });

  describe("listServices", () => {
    test("lists registered service names", () => {
      const registry = new ServiceRegistry();
      registry.register("alpha", {});
      registry.register("beta", {});
      expect(registry.listServices()).toEqual(["alpha", "beta"]);
    });
  });

  describe("getMetadata", () => {
    test("returns undefined when metadata is missing", () => {
      const registry = new ServiceRegistry();
      registry.register("alpha", {});
      expect(registry.getMetadata("alpha")).toEqual({});
      expect(registry.getMetadata("missing")).toBeUndefined();
    });
  });

  describe("isRegistered", () => {
    test("reports registered and missing services", () => {
      const registry = new ServiceRegistry();
      registry.register("alpha", {});
      expect(registry.isRegistered("alpha")).toBe(true);
      expect(registry.isRegistered("missing")).toBe(false);
    });
  });

  describe("reset", () => {
    test("clears all registered services", () => {
      const registry = new ServiceRegistry();
      registry.register("alpha", {});
      registry.register("beta", {});
      registry.reset();
      expect(registry.listServices()).toEqual([]);
      expect(registry.isRegistered("alpha")).toBe(false);
    });
  });
});
