import ServiceRegistry from "../../bootstrap/registries/service-registry.js";

describe("ServiceRegistry", () => {
  let serviceRegistry;

  beforeEach(() => {
    serviceRegistry = new ServiceRegistry();
  });

  describe("constructor", () => {
    it("should initialize with an empty services map", () => {
      expect(serviceRegistry._services).toBeInstanceOf(Map);
      expect(serviceRegistry._services.size).toBe(0);
    });
  });

  describe("register method", () => {
    it("should register a service with metadata", () => {
      const mockService = { name: "testService" };
      const metadata = { folder: "test", domain: "test" };

      serviceRegistry.register("testService", mockService, metadata, []);

      expect(serviceRegistry._services.has("testService")).toBe(true);
      const registered = serviceRegistry._services.get("testService");
      expect(registered.service).toBe(mockService);
      expect(registered.metadata).toEqual(metadata);
    });

    it("should throw an error if no name is provided", () => {
      expect(() => {
        serviceRegistry.register();
      }).toThrow("Service name is required");
    });

    it("should throw an error if service is already registered", () => {
      serviceRegistry.register("testService", {}, {}, []);

      expect(() => {
        serviceRegistry.register("testService", {}, {}, []);
      }).toThrow("Service already registered: testService");
    });

    it("should use empty metadata object if not provided", () => {
      const mockService = { name: "testService" };

      serviceRegistry.register("testService", mockService, {}, []);

      const registered = serviceRegistry._services.get("testService");
      expect(registered.metadata).toEqual({});
    });
  });

  describe("getService method", () => {
    it("should return the registered service", () => {
      const mockService = { name: "testService" };
      serviceRegistry.register("testService", mockService, {}, []);

      const retrieved = serviceRegistry.getService("testService");
      expect(retrieved).toBe(mockService);
    });

    it("should return undefined for unregistered service", () => {
      const retrieved = serviceRegistry.getService("nonExistentService");
      expect(retrieved).toBeUndefined();
    });
  });

  describe("getMetadata method", () => {
    it("should return the metadata for a registered service", () => {
      const metadata = { folder: "test", domain: "test" };
      serviceRegistry.register("testService", {}, metadata, []);

      const retrievedMetadata = serviceRegistry.getMetadata("testService");
      expect(retrievedMetadata).toEqual(metadata);
    });

    it("should return undefined for unregistered service", () => {
      const retrievedMetadata = serviceRegistry.getMetadata("nonExistentService");
      expect(retrievedMetadata).toBeUndefined();
    });
  });

  describe("reset method", () => {
    it("should clear all registered services", () => {
      serviceRegistry.register("testService1", {}, {}, []);
      serviceRegistry.register("testService2", {}, {}, []);
      
      expect(serviceRegistry._services.size).toBe(2);
      
      serviceRegistry.reset();
      
      expect(serviceRegistry._services.size).toBe(0);
      expect(serviceRegistry.getService("testService1")).toBeUndefined();
      expect(serviceRegistry.getService("testService2")).toBeUndefined();
    });
  });

  describe("listServices method", () => {
    it("should return an empty array when no services are registered", () => {
      const services = serviceRegistry.listServices();
      expect(services).toEqual([]);
    });

    it("should return an array of registered service names", () => {
      serviceRegistry.register("service1", {}, {}, []);
      serviceRegistry.register("service2", {}, {}, []);

      const services = serviceRegistry.listServices();
      expect(services).toEqual(["service1", "service2"]);
    });

    it("should maintain registration order", () => {
      serviceRegistry.register("first", {}, {}, []);
      serviceRegistry.register("second", {}, {}, []);
      serviceRegistry.register("third", {}, {}, []);

      const services = serviceRegistry.listServices();
      expect(services).toEqual(["first", "second", "third"]);
    });
  });

  describe("isRegistered method", () => {
    it("should return true for registered service", () => {
      serviceRegistry.register("testService", {}, {}, []);

      expect(serviceRegistry.isRegistered("testService")).toBe(true);
    });

    it("should return false for unregistered service", () => {
      expect(serviceRegistry.isRegistered("nonExistentService")).toBe(false);
    });
  });

  describe("required services validation", () => {
    it("should throw error when required services are not registered", () => {
      expect(() => {
        serviceRegistry.register("serviceA", {}, {}, ["missingService"]);
      }).toThrow("Required services are not registered: missingService");
    });

    it("should not throw error when required services are registered", () => {
      serviceRegistry.register("requiredService", {}, {}, []);

      expect(() => {
        serviceRegistry.register("serviceA", {}, {}, ["requiredService"]);
      }).not.toThrow();
    });

    it("should throw error when multiple required services are missing", () => {
      expect(() => {
        serviceRegistry.register("serviceA", {}, {}, ["missingService1", "missingService2"]);
      }).toThrow("Required services are not registered: missingService1, missingService2");
    });

    it("should not throw error when all required services are registered", () => {
      serviceRegistry.register("requiredService1", {}, {}, []);
      serviceRegistry.register("requiredService2", {}, {}, []);

      expect(() => {
        serviceRegistry.register("serviceA", {}, {}, ["requiredService1", "requiredService2"]);
      }).not.toThrow();
    });
  });

  describe("integration", () => {
    it("should register and retrieve multiple services", () => {
      const service1 = { id: 1 };
      const service2 = { id: 2 };
      const service3 = { id: 3 };

      serviceRegistry.register("service1", service1, { folder: "folder1" }, []);
      serviceRegistry.register("service2", service2, { folder: "folder2" }, []);
      serviceRegistry.register("service3", service3, { folder: "folder3" }, []);

      expect(serviceRegistry.getService("service1")).toBe(service1);
      expect(serviceRegistry.getService("service2")).toBe(service2);
      expect(serviceRegistry.getService("service3")).toBe(service3);

      expect(serviceRegistry.getMetadata("service1")).toEqual({ folder: "folder1" });
      expect(serviceRegistry.getMetadata("service2")).toEqual({ folder: "folder2" });
      expect(serviceRegistry.getMetadata("service3")).toEqual({ folder: "folder3" });
    });

    it("should handle complex scenarios with dependencies", () => {
      const serviceA = { name: "A" };
      const serviceB = { name: "B" };
      const serviceC = { name: "C" };

      serviceRegistry.register("serviceA", serviceA, { type: "primary" }, []);
      serviceRegistry.register("serviceB", serviceB, { type: "secondary" }, ["serviceA"]);
      serviceRegistry.register("serviceC", serviceC, { type: "tertiary" }, ["serviceA", "serviceB"]);

      expect(serviceRegistry.getService("serviceA")).toBe(serviceA);
      expect(serviceRegistry.getService("serviceB")).toBe(serviceB);
      expect(serviceRegistry.getService("serviceC")).toBe(serviceC);

      expect(serviceRegistry.listServices()).toEqual(["serviceA", "serviceB", "serviceC"]);
      expect(serviceRegistry.isRegistered("serviceA")).toBe(true);
      expect(serviceRegistry.isRegistered("serviceD")).toBe(false);
    });
  });
});