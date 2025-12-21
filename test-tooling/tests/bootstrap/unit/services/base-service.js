const BaseService = require("../../../../bootstrap/services/base-service.js");

class TestService extends BaseService {
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
    return this;
  }
}

describe("bootstrap/services/base-service.js", () => {
  describe("constructor", () => {
    test("stores config and starts uninitialized", () => {
      const config = { name: "config" };
      const service = new TestService(config);
      expect(service.config).toBe(config);
      expect(service.initialized).toBe(false);
    });

    test("defaults config to an empty object", () => {
      const service = new TestService();
      expect(service.config).toEqual({});
    });
  });

  describe("initialize", () => {
    test("throws when BaseService initialize is called directly", () => {
      const base = new BaseService();
      expect(() => base.initialize()).toThrow("BaseService must implement initialize()");
    });

    test("marks the subclass as initialized", () => {
      const service = new TestService();
      const result = service.initialize();
      expect(result).toBe(service);
      expect(service.initialized).toBe(true);
    });
  });

  describe("_ensureNotInitialized", () => {
    test("allows first initialization", () => {
      const service = new TestService();
      expect(() => service._ensureNotInitialized()).not.toThrow();
    });

    test("throws when already initialized", () => {
      const service = new TestService();
      service._markInitialized();
      expect(() => service._ensureNotInitialized()).toThrow("TestService already initialized");
    });
  });

  describe("_markInitialized", () => {
    test("sets initialized to true", () => {
      const service = new TestService();
      service._markInitialized();
      expect(service.initialized).toBe(true);
    });
  });

  describe("_ensureInitialized", () => {
    test("throws before initialization", () => {
      const service = new TestService();
      expect(() => service._ensureInitialized()).toThrow("TestService not initialized");
    });

    test("does not throw after initialization", () => {
      const service = new TestService();
      service._markInitialized();
      expect(() => service._ensureInitialized()).not.toThrow();
    });
  });

  describe("_requireServiceRegistry", () => {
    test("returns the configured registry", () => {
      const registry = { name: "registry" };
      const service = new TestService({ serviceRegistry: registry });
      expect(service._requireServiceRegistry()).toBe(registry);
    });

    test("throws when registry is missing", () => {
      const service = new TestService();
      expect(() => service._requireServiceRegistry()).toThrow(
        "ServiceRegistry required for TestService"
      );
    });
  });

  describe("_resolveNamespace", () => {
    test("returns the configured namespace", () => {
      const namespace = { helpers: {} };
      const service = new TestService({ namespace });
      expect(service._resolveNamespace()).toBe(namespace);
    });

    test("throws when namespace is missing", () => {
      const service = new TestService();
      expect(() => service._resolveNamespace()).toThrow("Namespace required for TestService");
    });
  });
});
