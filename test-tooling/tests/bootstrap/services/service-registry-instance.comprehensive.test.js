const ServiceRegistry = require("../../../../bootstrap/services/service-registry.js");
const serviceRegistryInstance = require("../../../../bootstrap/services/service-registry-instance.js");

describe("bootstrap/services/service-registry-instance.js", () => {
  // Since this is a singleton, we need to reset it between tests to avoid state pollution
  beforeEach(() => {
    // Reset the registry to a clean state by clearing all services
    serviceRegistryInstance.reset();
  });

  describe("singleton instance", () => {
    test("exports a ServiceRegistry instance", () => {
      expect(serviceRegistryInstance).toBeInstanceOf(ServiceRegistry);
    });

    test("maintains state across imports", () => {
      // Register a service
      const service = { name: "test-service" };
      serviceRegistryInstance.register("test", service);
      
      // Verify it's registered
      expect(serviceRegistryInstance.isRegistered("test")).toBe(true);
      expect(serviceRegistryInstance.getService("test")).toBe(service);
    });
  });

  describe("register method", () => {
    test("stores a service and metadata", () => {
      const service = { name: "service" };
      const metadata = { folder: "services" };

      serviceRegistryInstance.register("alpha", service, metadata);

      expect(serviceRegistryInstance.getService("alpha")).toBe(service);
      expect(serviceRegistryInstance.getMetadata("alpha")).toBe(metadata);
      expect(serviceRegistryInstance.isRegistered("alpha")).toBe(true);
    });

    test("throws when the name is missing", () => {
      expect(() => serviceRegistryInstance.register("", {}))
        .toThrow("Service name is required");
    });

    test("throws when registering the same name twice", () => {
      serviceRegistryInstance.register("alpha", {});
      expect(() => serviceRegistryInstance.register("alpha", {}))
        .toThrow("Service already registered: alpha");
    });

    test("uses empty metadata object when not provided", () => {
      serviceRegistryInstance.register("alpha", {});
      expect(serviceRegistryInstance.getMetadata("alpha")).toEqual({});
    });
  });

  describe("getService method", () => {
    test("returns registered service", () => {
      const service = { name: "my-service" };
      serviceRegistryInstance.register("test-service", service);
      
      expect(serviceRegistryInstance.getService("test-service")).toBe(service);
    });

    test("returns undefined when no service exists", () => {
      expect(serviceRegistryInstance.getService("missing")).toBeUndefined();
    });
  });

  describe("listServices method", () => {
    test("returns empty array when no services registered", () => {
      expect(serviceRegistryInstance.listServices()).toEqual([]);
    });

    test("lists registered service names", () => {
      serviceRegistryInstance.register("alpha", {});
      serviceRegistryInstance.register("beta", {});
      expect(serviceRegistryInstance.listServices()).toEqual(["alpha", "beta"]);
    });

    test("maintains registration order", () => {
      serviceRegistryInstance.register("first", {});
      serviceRegistryInstance.register("second", {});
      serviceRegistryInstance.register("third", {});
      expect(serviceRegistryInstance.listServices()).toEqual(["first", "second", "third"]);
    });
  });

  describe("getMetadata method", () => {
    test("returns metadata for registered service", () => {
      const metadata = { folder: "test", domain: "core" };
      serviceRegistryInstance.register("test", {}, metadata);
      
      expect(serviceRegistryInstance.getMetadata("test")).toBe(metadata);
    });

    test("returns empty object for service registered without metadata", () => {
      serviceRegistryInstance.register("test", {});
      expect(serviceRegistryInstance.getMetadata("test")).toEqual({});
    });

    test("returns undefined when service doesn't exist", () => {
      expect(serviceRegistryInstance.getMetadata("missing")).toBeUndefined();
    });
  });

  describe("isRegistered method", () => {
    test("returns true for registered service", () => {
      serviceRegistryInstance.register("test", {});
      expect(serviceRegistryInstance.isRegistered("test")).toBe(true);
    });

    test("returns false for unregistered service", () => {
      expect(serviceRegistryInstance.isRegistered("missing")).toBe(false);
    });
  });

  describe("reset method", () => {
    test("clears all registered services", () => {
      serviceRegistryInstance.register("alpha", {});
      serviceRegistryInstance.register("beta", {});
      
      expect(serviceRegistryInstance.listServices()).toHaveLength(2);
      
      serviceRegistryInstance.reset();
      
      expect(serviceRegistryInstance.listServices()).toEqual([]);
      expect(serviceRegistryInstance.isRegistered("alpha")).toBe(false);
      expect(serviceRegistryInstance.isRegistered("beta")).toBe(false);
    });

    test("allows re-registration after reset", () => {
      serviceRegistryInstance.register("test", {});
      serviceRegistryInstance.reset();
      // Should not throw
      serviceRegistryInstance.register("test", {});
      expect(serviceRegistryInstance.isRegistered("test")).toBe(true);
    });
  });

  describe("singleton behavior", () => {
    test("exports the same instance across multiple requires", () => {
      // Since it's a singleton, re-requiring should return the same instance
      // The module is evaluated once and cached, so require returns the same object
      expect(require("../../../../bootstrap/services/service-registry-instance.js")).toBe(serviceRegistryInstance);
    });

    test("state persists across require calls", () => {
      const service = { name: "persistent-service" };
      serviceRegistryInstance.register("persistent", service);

      // State should persist because it's the same instance
      expect(serviceRegistryInstance.getService("persistent")).toBe(service);
    });
  });
});