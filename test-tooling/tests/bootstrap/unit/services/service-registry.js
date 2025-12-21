const ServiceRegistry = require("../../../bootstrap/registries/service-registry.js");

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

      registry.register("alpha", service, metadata, []);

      expect(registry.getService("alpha")).toBe(service);
      expect(registry.getMetadata("alpha")).toBe(metadata);
      expect(registry.isRegistered("alpha")).toBe(true);
    });

    test("throws when the name is missing", () => {
      const registry = new ServiceRegistry();
      expect(() => registry.register("", {}, {}, [])).toThrow("Service name is required");
    });

    test("throws when registering the same name twice", () => {
      const registry = new ServiceRegistry();
      registry.register("alpha", {}, {}, []);
      expect(() => registry.register("alpha", {}, {}, [])).toThrow("Service already registered: alpha");
    });

    test("validates required services when provided", () => {
      const registry = new ServiceRegistry();
      registry.register("alpha", {}, {}, []);
      registry.register("beta", {}, {}, []);

      // Should not throw when all required services are present
      expect(() => {
        registry.register("gamma", {}, {}, ["alpha", "beta"]);
      }).not.toThrow();

      expect(registry.isRegistered("gamma")).toBe(true);
    });

    test("throws when required services are missing", () => {
      const registry = new ServiceRegistry();
      registry.register("alpha", {}, {}, []);

      // Should throw when required service is missing
      expect(() => {
        registry.register("beta", {}, {}, ["missing"]);
      }).toThrow("Required services are not registered: missing");

      expect(() => {
        registry.register("gamma", {}, {}, ["alpha", "missing"]);
      }).toThrow("Required services are not registered: missing");

      expect(() => {
        registry.register("delta", {}, {}, ["missing1", "missing2"]);
      }).toThrow("Required services are not registered: missing1, missing2");
    });

    test("does not validate when no required services provided", () => {
      const registry = new ServiceRegistry();
      registry.register("alpha", {}, {}, []);

      // Should work normally when no required services are specified
      expect(() => {
        registry.register("beta", {}, {}, []);
      }).not.toThrow();

      // Should work when empty array is passed as required services
      expect(() => {
        registry.register("gamma", {}, {}, []);
      }).not.toThrow();
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
      registry.register("alpha", {}, {}, []);
      registry.register("beta", {}, {}, []);
      expect(registry.listServices()).toEqual(["alpha", "beta"]);
    });
  });

  describe("getMetadata", () => {
    test("returns undefined when metadata is missing", () => {
      const registry = new ServiceRegistry();
      registry.register("alpha", {}, {}, []);
      expect(registry.getMetadata("alpha")).toEqual({});
      expect(registry.getMetadata("missing")).toBeUndefined();
    });
  });

  describe("isRegistered", () => {
    test("reports registered and missing services", () => {
      const registry = new ServiceRegistry();
      registry.register("alpha", {}, {}, []);
      expect(registry.isRegistered("alpha")).toBe(true);
      expect(registry.isRegistered("missing")).toBe(false);
    });
  });

  describe("reset", () => {
    test("clears all registered services", () => {
      const registry = new ServiceRegistry();
      registry.register("alpha", {}, {}, []);
      registry.register("beta", {}, {}, []);
      registry.reset();
      expect(registry.listServices()).toEqual([]);
      expect(registry.isRegistered("alpha")).toBe(false);
    });
  });
});
