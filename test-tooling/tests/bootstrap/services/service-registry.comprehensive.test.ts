const ServiceRegistry = require("../../../../bootstrap/services/service-registry.js");

describe("ServiceRegistry", () => {
  let registry;

  beforeEach(() => {
    registry = new ServiceRegistry();
  });

  describe("constructor", () => {
    it("should initialize with an empty services map", () => {
      expect(registry._services).toBeInstanceOf(Map);
      expect(registry._services.size).toBe(0);
    });
  });

  describe("register method", () => {
    it("should register a named service instance with metadata and required services", () => {
      const mockService = { name: "testService" };
      const metadata = { folder: "test", domain: "test" };
      const requiredServices = [];

      registry.register("testService", mockService, metadata, requiredServices);

      expect(registry.isRegistered("testService")).toBe(true);
      expect(registry.getService("testService")).toBe(mockService);
      expect(registry.getMetadata("testService")).toEqual(metadata);
    });

    it("should register a named service instance without metadata", () => {
      const mockService = { name: "testService" };
      const requiredServices = [];

      registry.register("testService", mockService, {}, requiredServices);

      expect(registry.isRegistered("testService")).toBe(true);
      expect(registry.getService("testService")).toBe(mockService);
      expect(registry.getMetadata("testService")).toEqual({});
    });

    it("should throw an error when service name is not provided", () => {
      const mockService = { name: "testService" };
      const requiredServices = [];

      expect(() => {
        registry.register("", mockService, {}, requiredServices);
      }).toThrow("Service name is required");

      expect(() => {
        registry.register(null, mockService, {}, requiredServices);
      }).toThrow("Service name is required");

      expect(() => {
        registry.register(undefined, mockService, {}, requiredServices);
      }).toThrow("Service name is required");
    });

    it("should throw an error when service with same name already exists", () => {
      const mockService1 = { name: "testService" };
      const mockService2 = { name: "testService" };
      const requiredServices = [];

      registry.register("testService", mockService1, {}, requiredServices);

      expect(() => {
        registry.register("testService", mockService2, {}, requiredServices);
      }).toThrow("Service already registered: testService");
    });

    it("should validate required services are registered", () => {
      const mockService = { name: "testService" };
      const requiredServices = ["missingService"];

      expect(() => {
        registry.register("testService", mockService, {}, requiredServices);
      }).toThrow("Required services are not registered: missingService");
    });

    it("should allow registration when all required services are present", () => {
      const dependencyService = { name: "dependencyService" };
      const mainService = { name: "mainService" };
      const requiredServices = ["dependencyService"];

      registry.register("dependencyService", dependencyService, {}, []);
      registry.register("mainService", mainService, {}, requiredServices);

      expect(registry.isRegistered("mainService")).toBe(true);
      expect(registry.getService("mainService")).toBe(mainService);
    });

    it("should throw error if not all 4 arguments are provided", () => {
      const mockService = { name: "testService" };

      expect(() => {
        // Missing required arguments
        registry.register("testService", mockService);
      }).toThrow("ServiceRegistry.register requires exactly 4 parameters: (name, service, metadata, requiredServices)");

      expect(() => {
        // Only 3 arguments
        registry.register("testService", mockService, {});
      }).toThrow("ServiceRegistry.register requires exactly 4 parameters: (name, service, metadata, requiredServices)");
    });
  });

  describe("getService method", () => {
    it("should return the service that was registered under the given name", () => {
      const mockService = { name: "testService" };
      const requiredServices = [];

      registry.register("testService", mockService, {}, requiredServices);

      expect(registry.getService("testService")).toBe(mockService);
    });

    it("should return undefined when service name does not exist", () => {
      expect(registry.getService("nonExistentService")).toBeUndefined();
    });
  });

  describe("listServices method", () => {
    it("should list the names of every registered service", () => {
      const mockService1 = { name: "service1" };
      const mockService2 = { name: "service2" };
      const requiredServices = [];

      registry.register("service1", mockService1, {}, requiredServices);
      registry.register("service2", mockService2, {}, requiredServices);

      const serviceList = registry.listServices();
      expect(serviceList).toContain("service1");
      expect(serviceList).toContain("service2");
      expect(serviceList).toHaveLength(2);
    });

    it("should return an empty array when no services are registered", () => {
      expect(registry.listServices()).toEqual([]);
    });
  });

  describe("getMetadata method", () => {
    it("should return metadata that was attached to the named service entry", () => {
      const mockService = { name: "testService" };
      const metadata = { folder: "test", domain: "test" };
      const requiredServices = [];

      registry.register("testService", mockService, metadata, requiredServices);

      expect(registry.getMetadata("testService")).toEqual(metadata);
    });

    it("should return empty object when no metadata was provided", () => {
      const mockService = { name: "testService" };
      const requiredServices = [];

      registry.register("testService", mockService, {}, requiredServices);

      expect(registry.getMetadata("testService")).toEqual({});
    });

    it("should return undefined when service name does not exist", () => {
      expect(registry.getMetadata("nonExistentService")).toBeUndefined();
    });
  });

  describe("isRegistered method", () => {
    it("should return true when a service with the given name exists", () => {
      const mockService = { name: "testService" };
      const requiredServices = [];

      registry.register("testService", mockService, {}, requiredServices);

      expect(registry.isRegistered("testService")).toBe(true);
    });

    it("should return false when a service with the given name does not exist", () => {
      expect(registry.isRegistered("nonExistentService")).toBe(false);
    });
  });

  describe("reset method", () => {
    it("should remove all registered services", () => {
      const mockService1 = { name: "service1" };
      const mockService2 = { name: "service2" };
      const requiredServices = [];

      registry.register("service1", mockService1, {}, requiredServices);
      registry.register("service2", mockService2, {}, requiredServices);

      expect(registry.listServices()).toHaveLength(2);

      registry.reset();

      expect(registry.listServices()).toEqual([]);
      expect(registry.isRegistered("service1")).toBe(false);
      expect(registry.isRegistered("service2")).toBe(false);
    });

    it("should allow registry to be reused after reset", () => {
      const mockService1 = { name: "service1" };
      const mockService2 = { name: "service2" };
      const requiredServices = [];

      registry.register("service1", mockService1, {}, requiredServices);
      registry.reset();
      registry.register("service2", mockService2, {}, requiredServices);

      expect(registry.isRegistered("service1")).toBe(false);
      expect(registry.isRegistered("service2")).toBe(true);
      expect(registry.getService("service2")).toBe(mockService2);
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle of registering, retrieving, and managing services", () => {
      // Register multiple services with different metadata
      const service1 = { process: () => "processed1" };
      const service2 = { process: () => "processed2" };
      const service3 = { process: () => "processed3" };
      const metadata1 = { folder: "services/core", domain: "core" };
      const metadata2 = { folder: "services/cdn", domain: "cdn" };
      const metadata3 = { folder: "services/local", domain: "local" };
      const requiredServices = [];

      // Register services
      registry.register("processor", service1, metadata1, requiredServices);
      registry.register("formatter", service2, metadata2, requiredServices);
      registry.register("validator", service3, metadata3, requiredServices);

      // Verify they are registered
      expect(registry.isRegistered("processor")).toBe(true);
      expect(registry.isRegistered("formatter")).toBe(true);
      expect(registry.isRegistered("validator")).toBe(true);

      // Verify services can be retrieved
      expect(registry.getService("processor")).toBe(service1);
      expect(registry.getService("formatter")).toBe(service2);
      expect(registry.getService("validator")).toBe(service3);

      // Verify metadata is stored correctly
      expect(registry.getMetadata("processor")).toEqual(metadata1);
      expect(registry.getMetadata("formatter")).toEqual(metadata2);
      expect(registry.getMetadata("validator")).toEqual(metadata3);

      // Verify service listing works
      const serviceList = registry.listServices();
      expect(serviceList).toContain("processor");
      expect(serviceList).toContain("formatter");
      expect(serviceList).toContain("validator");
      expect(serviceList).toHaveLength(3);

      // Verify individual service retrieval
      expect(registry.getService("processor").process()).toBe("processed1");
      expect(registry.getService("formatter").process()).toBe("processed2");
      expect(registry.getService("validator").process()).toBe("processed3");

      // Reset and verify it's empty
      registry.reset();
      expect(registry.listServices()).toEqual([]);
      expect(registry.isRegistered("processor")).toBe(false);
      expect(registry.isRegistered("formatter")).toBe(false);
      expect(registry.isRegistered("validator")).toBe(false);
    });

    it("should handle complex dependency validation scenarios", () => {
      const serviceA = { name: "serviceA" };
      const serviceB = { name: "serviceB" };
      const serviceC = { name: "serviceC" };
      const requiredServices = [];

      // Register services in different order
      registry.register("serviceC", serviceC, {}, requiredServices);
      registry.register("serviceA", serviceA, {}, requiredServices);
      registry.register("serviceB", serviceB, {}, ["serviceA", "serviceC"]); // B depends on A and C

      expect(registry.isRegistered("serviceB")).toBe(true);
      expect(registry.getService("serviceB")).toBe(serviceB);
    });
  });
});