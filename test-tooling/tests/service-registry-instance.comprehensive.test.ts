import serviceRegistry from "../../bootstrap/registries/service-registry-instance.js";

describe("ServiceRegistryInstance", () => {
  // Since this is a singleton, we need to reset it between tests to avoid conflicts
  beforeEach(() => {
    serviceRegistry.reset();
  });

  it("should export a singleton ServiceRegistry instance", () => {
    expect(serviceRegistry).toBeDefined();
    expect(typeof serviceRegistry.register).toBe("function");
    expect(typeof serviceRegistry.getService).toBe("function");
    expect(typeof serviceRegistry.getMetadata).toBe("function");
    expect(typeof serviceRegistry.reset).toBe("function");
  });

  it("should maintain the same registry between imports", () => {
    // Register a service
    const service1 = { name: "service1" };
    serviceRegistry.register("testService", service1, {}, []);

    // Verify it's registered
    expect(serviceRegistry.getService("testService")).toBe(service1);

    // The same instance should be accessible
    expect(serviceRegistry.getService("testService")).toBe(service1);
  });

  it("should support reset functionality", () => {
    const service1 = { name: "service1" };
    serviceRegistry.register("testService", service1, {}, []);

    expect(serviceRegistry.getService("testService")).toBe(service1);

    serviceRegistry.reset();

    expect(serviceRegistry.getService("testService")).toBeUndefined();
  });

  it("should properly register and retrieve services", () => {
    const service1 = { name: "service1" };
    const service2 = { name: "service2" };
    
    serviceRegistry.register("service1", service1, { folder: "test", domain: "test" }, []);
    serviceRegistry.register("service2", service2, { folder: "other", domain: "other" }, []);
    
    expect(serviceRegistry.getService("service1")).toBe(service1);
    expect(serviceRegistry.getService("service2")).toBe(service2);
    expect(serviceRegistry.getMetadata("service1")).toEqual({ folder: "test", domain: "test" });
    expect(serviceRegistry.getMetadata("service2")).toEqual({ folder: "other", domain: "other" });
  });

  it("should throw error when registering duplicate services", () => {
    serviceRegistry.register("testService", { name: "service" }, {}, []);

    expect(() => {
      serviceRegistry.register("testService", { name: "anotherService" }, {}, []);
    }).toThrow("Service already registered: testService");
  });

  it("should return undefined for non-existent services", () => {
    expect(serviceRegistry.getService("nonExistentService")).toBeUndefined();
    expect(serviceRegistry.getMetadata("nonExistentService")).toBeUndefined();
  });

  it("should use empty metadata when not provided", () => {
    const service = { name: "test" };
    serviceRegistry.register("testService", service, {}, []); // Pass empty metadata and empty required services

    expect(serviceRegistry.getService("testService")).toBe(service);
    expect(serviceRegistry.getMetadata("testService")).toEqual({});
  });

  it("should throw error when registering without name", () => {
    expect(() => {
      serviceRegistry.register();
    }).toThrow("Service name is required");
  });
});