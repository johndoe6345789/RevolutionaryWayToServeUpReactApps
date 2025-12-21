import ServiceRegistry from "../../bootstrap/services/service-registry.js";

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

      serviceRegistry.register("testService", mockService, metadata);

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
      serviceRegistry.register("testService", {}, {});
      
      expect(() => {
        serviceRegistry.register("testService", {}, {});
      }).toThrow("Service already registered: testService");
    });

    it("should use empty metadata object if not provided", () => {
      const mockService = { name: "testService" };

      serviceRegistry.register("testService", mockService);

      const registered = serviceRegistry._services.get("testService");
      expect(registered.metadata).toEqual({});
    });
  });

  describe("getService method", () => {
    it("should return the registered service", () => {
      const mockService = { name: "testService" };
      serviceRegistry.register("testService", mockService);

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
      serviceRegistry.register("testService", {}, metadata);

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
      serviceRegistry.register("testService1", {});
      serviceRegistry.register("testService2", {});
      
      expect(serviceRegistry._services.size).toBe(2);
      
      serviceRegistry.reset();
      
      expect(serviceRegistry._services.size).toBe(0);
      expect(serviceRegistry.getService("testService1")).toBeUndefined();
      expect(serviceRegistry.getService("testService2")).toBeUndefined();
    });
  });

  describe("integration", () => {
    it("should register and retrieve multiple services", () => {
      const service1 = { id: 1 };
      const service2 = { id: 2 };
      const service3 = { id: 3 };

      serviceRegistry.register("service1", service1, { folder: "folder1" });
      serviceRegistry.register("service2", service2, { folder: "folder2" });
      serviceRegistry.register("service3", service3, { folder: "folder3" });

      expect(serviceRegistry.getService("service1")).toBe(service1);
      expect(serviceRegistry.getService("service2")).toBe(service2);
      expect(serviceRegistry.getService("service3")).toBe(service3);

      expect(serviceRegistry.getMetadata("service1")).toEqual({ folder: "folder1" });
      expect(serviceRegistry.getMetadata("service2")).toEqual({ folder: "folder2" });
      expect(serviceRegistry.getMetadata("service3")).toEqual({ folder: "folder3" });
    });
  });
});