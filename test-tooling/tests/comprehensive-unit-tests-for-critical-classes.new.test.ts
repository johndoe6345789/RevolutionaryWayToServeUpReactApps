import ServiceRegistry from "../bootstrap/registries/service-registry.js";
import HelperRegistry from "../bootstrap/registries/helper-registry.js";
import GlobalRootHandler from "../bootstrap/constants/global-root-handler.js";
import BaseBootstrapApp from "../bootstrap/interfaces/base-bootstrap-app.js";
import BaseHelper from "../bootstrap/helpers/base-helper.js";

describe("Comprehensive Unit Tests for Critical Classes", () => {
  describe("ServiceRegistry", () => {
    let serviceRegistry;

    beforeEach(() => {
      serviceRegistry = new ServiceRegistry();
    });

    it("should handle complex dependency scenarios", () => {
      // Register a base service
      const baseService = { name: "baseService", init: () => "baseInit" };
      serviceRegistry.register("baseService", baseService, { type: "base" }, []);

      // Register a service that depends on the base service
      const dependentService = { name: "dependentService", dependsOnBase: true };
      serviceRegistry.register("dependentService", dependentService, { type: "dependent" }, ["baseService"]);

      // Both services should be registered and retrievable
      expect(serviceRegistry.getService("baseService")).toBe(baseService);
      expect(serviceRegistry.getService("dependentService")).toBe(dependentService);
      expect(serviceRegistry.getMetadata("baseService")).toEqual({ type: "base" });
      expect(serviceRegistry.getMetadata("dependentService")).toEqual({ type: "dependent" });
      expect(serviceRegistry.listServices()).toEqual(["baseService", "dependentService"]);
    });

    it("should validate dependencies correctly", () => {
      const serviceA = { name: "serviceA" };
      
      // Should throw when required service doesn't exist
      expect(() => {
        serviceRegistry.register("serviceB", { name: "serviceB" }, {}, ["missingService"]);
      }).toThrow("Required services are not registered: missingService");

      // Should not throw when required service exists
      serviceRegistry.register("serviceA", serviceA, {}, []);
      expect(() => {
        serviceRegistry.register("serviceB", { name: "serviceB" }, {}, ["serviceA"]);
      }).not.toThrow();
    });

    it("should handle metadata operations correctly", () => {
      const service = { name: "testService" };
      const metadata = { version: "1.0.0", author: "test", dependencies: ["helper1"] };

      serviceRegistry.register("testService", service, metadata, []);

      expect(serviceRegistry.getMetadata("testService")).toEqual(metadata);
      expect(serviceRegistry.getMetadata("nonExistent")).toBeUndefined();
      expect(serviceRegistry.isRegistered("testService")).toBe(true);
      expect(serviceRegistry.isRegistered("nonExistent")).toBe(false);
    });

    it("should handle reset operations correctly", () => {
      serviceRegistry.register("service1", { name: "service1" }, {}, []);
      serviceRegistry.register("service2", { name: "service2" }, {}, []);

      expect(serviceRegistry.listServices()).toEqual(["service1", "service2"]);
      expect(serviceRegistry.isRegistered("service1")).toBe(true);
      
      serviceRegistry.reset();

      expect(serviceRegistry.listServices()).toEqual([]);
      expect(serviceRegistry.isRegistered("service1")).toBe(false);
      expect(serviceRegistry.getService("service1")).toBeUndefined());
    });
  });

  describe("HelperRegistry", () => {
    let helperRegistry;

    beforeEach(() => {
      helperRegistry = new HelperRegistry();
    });

    it("should handle complex helper registration scenarios", () => {
      const helper1 = { name: "helper1", process: () => "processed1" };
      const helper2 = { name: "helper2", process: () => "processed2" };
      const metadata1 = { type: "processor", version: "1.0" };
      const metadata2 = { type: "formatter", version: "2.0", dependencies: ["helper1"] };

      helperRegistry.register("processor", helper1, metadata1, []);
      helperRegistry.register("formatter", helper2, metadata2, ["processor"]);

      expect(helperRegistry.getHelper("processor")).toBe(helper1);
      expect(helperRegistry.getHelper("formatter")).toBe(helper2);
      expect(helperRegistry.getMetadata("processor")).toEqual(metadata1);
      expect(helperRegistry.getMetadata("formatter")).toEqual(metadata2);
      expect(helperRegistry.listHelpers()).toEqual(["processor", "formatter"]);
      expect(helperRegistry.isRegistered("processor")).toBe(true);
      expect(helperRegistry.isRegistered("formatter")).toBe(true);
    });

    it("should handle different helper types correctly", () => {
      // Register different types of helpers
      const funcHelper = () => "function result";
      const objHelper = { method: () => "object result" };
      const classHelper = class TestClass {};
      const primitiveHelper = "string helper";

      helperRegistry.register("function", funcHelper, {}, []);
      helperRegistry.register("object", objHelper, {}, []);
      helperRegistry.register("class", classHelper, {}, []);
      helperRegistry.register("primitive", primitiveHelper, {}, []);

      expect(helperRegistry.getHelper("function")).toBe(funcHelper);
      expect(helperRegistry.getHelper("object")).toBe(objHelper);
      expect(helperRegistry.getHelper("class")).toBe(classHelper);
      expect(helperRegistry.getHelper("primitive")).toBe(primitiveHelper);
    });

    it("should handle metadata correctly", () => {
      const helper = { name: "test" };
      const complexMetadata = {
        version: "1.0.0",
        author: "test",
        config: { option1: true, option2: "value" },
        dependencies: ["otherHelper"],
        features: ["feature1", "feature2"]
      };

      helperRegistry.register("complexHelper", helper, complexMetadata, []);

      expect(helperRegistry.getHelper("complexHelper")).toBe(helper);
      expect(helperRegistry.getMetadata("complexHelper")).toEqual(complexMetadata);
      expect(helperRegistry.isRegistered("complexHelper")).toBe(true);
    });
  });

  describe("GlobalRootHandler", () => {
    it("should detect the correct global object in different environments", () => {
      // Test with globalThis available (most common case)
      const handler1 = new GlobalRootHandler();
      expect(handler1.root).toBe(global);

      // Test with a custom root
      const customRoot = { document: {}, custom: "value" };
      const handler2 = new GlobalRootHandler(customRoot);
      expect(handler2.root).toBe(customRoot);
    });

    it("should handle namespace operations correctly", () => {
      const customRoot = {};
      const handler = new GlobalRootHandler(customRoot);

      // Get namespace should create and cache it
      const namespace1 = handler.getNamespace();
      const namespace2 = handler.getNamespace();
      
      expect(namespace1).toBe(namespace2); // Same instance cached
      expect(namespace1).toEqual(expect.objectContaining({ helpers: expect.any(Object) }));
    });

    it("should handle document and fetch correctly", () => {
      // Test with document available
      const rootWithDoc = { document: { title: "Test" }, fetch: () => {} };
      const handlerWithDoc = new GlobalRootHandler(rootWithDoc);
      
      expect(handlerWithDoc.getDocument()).toBe(rootWithDoc.document);
      expect(typeof handlerWithDoc.getFetch()).toBe("function");
    });

    it("should handle logging with different console scenarios", () => {
      const handler = new GlobalRootHandler({});

      // Test logger creation
      const logger = handler.getLogger("test");
      expect(typeof logger).toBe("function");

      // Logger should not throw when console is missing
      const originalConsole = global.console;
      global.console = undefined;
      
      const safeLogger = handler.getLogger("safe-test");
      expect(() => {
        safeLogger("test message");
      }).not.toThrow();
      
      global.console = originalConsole;
    });
  });

  describe("BaseBootstrapApp", () => {
    it("should handle both CommonJS and non-CommonJS environments correctly", () => {
      // Test in simulated CommonJS environment
      global.module = { exports: {} };
      const appCommonJS = new BaseBootstrapApp();
      expect(appCommonJS.isCommonJs).toBe(true);

      // Test in non-CommonJS environment  
      delete global.module;
      const appNonCommonJS = new BaseBootstrapApp();
      expect(appNonCommonJS.isCommonJs).toBe(false);
    });

    it("should properly resolve helpers in different environments", () => {
      // In CommonJS mode, it would use require (tested separately to avoid module loading)
      // In non-CommonJS mode, it should use namespace
      delete global.module; // Ensure non-CommonJS mode
      const mockRootHandler = new GlobalRootHandler();
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });
      
      // Add a helper to the namespace
      const testHelper = { name: "testHelper", method: () => "result" };
      app.helpersNamespace.testHelper = testHelper;

      const resolved = app._resolveHelper("testHelper", "./path/to/helper");
      expect(resolved).toBe(testHelper);
    });

    it("should handle browser detection correctly", () => {
      // Test with window object that has document
      const mockWindowWithDoc = { document: { title: "Test" } };
      expect(BaseBootstrapApp.isBrowser(mockWindowWithDoc)).toBe(true);

      // Test with window object without document
      const mockWindowWithoutDoc = { noDocument: true };
      expect(BaseBootstrapApp.isBrowser(mockWindowWithoutDoc)).toBe(false);

      // Test with no window object (should use global)
      const originalWindow = global.window;
      global.window = { document: { title: "Global" } };
      expect(BaseBootstrapApp.isBrowser()).toBe(true);
      global.window = originalWindow;
    });
  });

  describe("BaseHelper", () => {
    let mockRegistry;

    beforeEach(() => {
      mockRegistry = {
        register: () => {},
        isRegistered: () => false,
        getHelper: () => {},
        getMetadata: () => {}
      };
    });

    // Note: Since this is a base class, we'll test using a mock implementation
    class TestHelper extends BaseHelper {
      initialize() {
        // Implementation for testing
        return this;
      }
    }

    it("should handle helper registry operations correctly", () => {
      // Track calls to the mock registry
      const registerCalls = [];
      const isRegisteredCalls = [];

      mockRegistry.isRegistered = (name) => {
        isRegisteredCalls.push(name);
        return false; // Not registered
      };

      mockRegistry.register = (name, helper, metadata, requiredServices) => {
        registerCalls.push({ name, helper, metadata, requiredServices });
      };

      const config = { helperRegistry: mockRegistry };
      const helper = new TestHelper(config);

      const testHelper = { name: "test" };
      const testMetadata = { type: "test" };

      helper._registerHelper("testHelper", testHelper, testMetadata);

      // Verify the registry was called correctly
      expect(registerCalls.length).toBe(1);
      expect(registerCalls[0].name).toBe("testHelper");
      expect(registerCalls[0].helper).toBe(testHelper);
      expect(registerCalls[0].metadata).toEqual(testMetadata);
      expect(registerCalls[0].requiredServices).toEqual([]);
    });

    it("should skip registration if helper already exists", () => {
      // Track calls to the mock registry
      const registerCalls = [];

      mockRegistry.isRegistered = (name) => {
        return name === "existingHelper"; // Pretend existingHelper is registered
      };

      mockRegistry.register = (name, helper, metadata, requiredServices) => {
        registerCalls.push({ name, helper, metadata, requiredServices });
      };

      const config = { helperRegistry: mockRegistry };
      const helper = new TestHelper(config);

      // This should not call register since it's already registered
      helper._registerHelper("existingHelper", { name: "existing" });

      expect(registerCalls.length).toBe(0); // No registration calls should have happened
    });

    it("should throw error if helper registry is missing", () => {
      const helper = new TestHelper({});

      expect(() => {
        helper._registerHelper("testHelper", { name: "test" });
      }).toThrow("HelperRegistry required for TestHelper");
    });
  });

  describe("Integration tests", () => {
    it("should work through full lifecycle with all critical components", () => {
      // Create a service registry
      const serviceRegistry = new ServiceRegistry();
      
      // Register a service
      const testService = { name: "integrationService", method: () => "working" };
      serviceRegistry.register("integrationService", testService, { type: "integration", version: "1.0.0" }, []);

      // Create a helper registry
      const helperRegistry = new HelperRegistry();
      
      // Register a helper
      const testHelper = { name: "integrationHelper", utility: () => "utility-working" };
      helperRegistry.register("integrationHelper", testHelper, { category: "test", version: "1.0" }, []);

      // Create a global root handler
      const rootHandler = new GlobalRootHandler({ document: {}, custom: "root" });
      
      // Create a bootstrap app
      const bootstrapApp = new BaseBootstrapApp({ rootHandler });

      // Verify all components work together
      expect(serviceRegistry.isRegistered("integrationService")).toBe(true);
      expect(serviceRegistry.getService("integrationService")).toBe(testService);
      expect(serviceRegistry.getMetadata("integrationService")).toEqual({ type: "integration", version: "1.0.0" });

      expect(helperRegistry.isRegistered("integrationHelper")).toBe(true);
      expect(helperRegistry.getHelper("integrationHelper")).toBe(testHelper);
      expect(helperRegistry.getMetadata("integrationHelper")).toEqual({ category: "test", version: "1.0" });

      expect(bootstrapApp.rootHandler).toBe(rootHandler);
      expect(bootstrapApp.globalRoot).toBeDefined();
    });

    it("should handle complex dependency chains", () => {
      const serviceRegistry = new ServiceRegistry();

      // Create a chain of dependencies: ServiceC -> ServiceB -> ServiceA
      const serviceA = { name: "serviceA", level: "base" };
      const serviceB = { name: "serviceB", level: "mid", dependsOn: "A" };
      const serviceC = { name: "serviceC", level: "top", dependsOn: "B" };

      // Register in dependency order
      serviceRegistry.register("serviceA", serviceA, { layer: "infrastructure" }, []);
      serviceRegistry.register("serviceB", serviceB, { layer: "middleware" }, ["serviceA"]);
      serviceRegistry.register("serviceC", serviceC, { layer: "application" }, ["serviceB"]);

      // Verify all are registered and accessible
      expect(serviceRegistry.getService("serviceA")).toBe(serviceA);
      expect(serviceRegistry.getService("serviceB")).toBe(serviceB);
      expect(serviceRegistry.getService("serviceC")).toBe(serviceC);

      // Verify metadata is preserved
      expect(serviceRegistry.getMetadata("serviceA")).toEqual({ layer: "infrastructure" });
      expect(serviceRegistry.getMetadata("serviceB")).toEqual({ layer: "middleware" });
      expect(serviceRegistry.getMetadata("serviceC")).toEqual({ layer: "application" });

      // Verify listing maintains dependency order
      const services = serviceRegistry.listServices();
      expect(services.indexOf("serviceA")).toBeLessThan(services.indexOf("serviceB"));
      expect(services.indexOf("serviceB")).toBeLessThan(services.indexOf("serviceC"));
    });
  });
});