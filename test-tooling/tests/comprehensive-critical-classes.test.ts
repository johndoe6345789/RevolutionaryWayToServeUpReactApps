import BaseBootstrapApp from "../../bootstrap/interfaces/base-bootstrap-app.js";
import GlobalRootHandler from "../../bootstrap/constants/global-root-handler.js";
import ServiceRegistry from "../../bootstrap/registries/service-registry.js";
import HelperRegistry from "../../bootstrap/registries/helper-registry.js";
import TsxCompilerService from "../../bootstrap/services/local/tsx-compiler-service.js";
import TsxCompilerConfig from "../../bootstrap/configs/local/tsx-compiler.js";

// Mock service registry for testing
class MockServiceRegistry {
  constructor() {
    this.registeredServices = new Map();
  }

  register(name, service, metadata, requiredServices) {
    this.registeredServices.set(name, { service, metadata, requiredServices });
  }

  getService(name) {
    const entry = this.registeredServices.get(name);
    return entry ? entry.service : null;
  }
}

// Mock namespace for testing
const mockNamespace = {
  helpers: {}
};

describe("Comprehensive Unit Tests for Critical Classes", () => {
  describe("BaseBootstrapApp comprehensive tests", () => {
    let originalModule;

    beforeEach(() => {
      originalModule = global.module;
    });

    afterEach(() => {
      global.module = originalModule;
    });

    it("should handle both CommonJS and non-CommonJS environments correctly", () => {
      // Test CommonJS environment
      global.module = { exports: {} };
      const appCommonJS = new BaseBootstrapApp();
      expect(appCommonJS.isCommonJs).toBe(true);

      // Test non-CommonJS environment
      delete global.module;
      const appNonCommonJS = new BaseBootstrapApp();
      expect(appNonCommonJS.isCommonJs).toBe(false);
    });

    it("should properly resolve helpers in different environments", () => {
      const mockRootHandler = new GlobalRootHandler({ document: {} });
      const app = new BaseBootstrapApp({ rootHandler: mockRootHandler });

      // Add a mock helper to the namespace
      const mockHelper = { name: "testHelper", method: () => "test" };
      app.helpersNamespace.testHelper = mockHelper;

      // In non-CommonJS, should resolve from namespace
      delete global.module;
      const resolvedFromNamespace = app._resolveHelper("testHelper", "./path");
      expect(resolvedFromNamespace).toBe(mockHelper);

      // In CommonJS, would resolve via require (not tested here to avoid module loading issues)
      global.module = { exports: {} };
      app.isCommonJs = true; // Manually set for test
      expect(() => {
        app._resolveHelper("nonExistentHelper", "./path");
      }).toThrow(); // Should throw when helper doesn't exist and in CommonJS mode
    });

    it("should handle browser detection correctly", () => {
      // Test with window with document
      const mockWindowWithDoc = { document: {} };
      expect(BaseBootstrapApp.isBrowser(mockWindowWithDoc)).toBe(true);

      // Test with window without document
      const mockWindowWithoutDoc = {};
      expect(BaseBootstrapApp.isBrowser(mockWindowWithoutDoc)).toBe(false);

      // Test with global window
      const originalWindow = global.window;
      global.window = { document: {} };
      expect(BaseBootstrapApp.isBrowser()).toBe(true);
      global.window = originalWindow;
    });
  });

  describe("GlobalRootHandler comprehensive tests", () => {
    let originalGlobalThis, originalWindow;

    beforeEach(() => {
      originalGlobalThis = global.globalThis;
      originalWindow = global.window;
    });

    afterEach(() => {
      global.globalThis = originalGlobalThis;
      global.window = originalWindow;
    });

    it("should detect the correct global object in different environments", () => {
      // Test with globalThis available
      global.globalThis = { test: "globalThis" };
      delete global.window;
      const handler1 = new GlobalRootHandler();
      expect(handler1.root).toBe(global.globalThis);

      // Test with only window available
      delete global.globalThis;
      global.window = { test: "window", document: {} };
      const handler2 = new GlobalRootHandler();
      expect(handler2.root).toBe(global.window);

      // Test with neither available - should fallback to handler instance
      delete global.globalThis;
      delete global.window;
      const handler3 = new GlobalRootHandler();
      expect(handler3.root).toBe(handler3);
    });

    it("should handle namespace operations correctly", () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      // Create namespace
      const namespace = handler.getNamespace();
      expect(namespace).toEqual({});

      // Check that helpers are properly created within the namespace
      const helpers = handler.helpers;
      expect(helpers).toEqual({});
      expect(namespace.helpers).toBe(helpers);

      // Verify that subsequent calls return the same objects
      expect(handler.getNamespace()).toBe(namespace);
      expect(handler.helpers).toBe(helpers);
    });

    it("should handle document and fetch correctly", () => {
      // Test with document available
      const mockRootWithDoc = { document: { title: "Test" } };
      const handlerWithDoc = new GlobalRootHandler(mockRootWithDoc);
      expect(handlerWithDoc.getDocument()).toBe(mockRootWithDoc.document);

      // Test with fetch available
      const mockFetch = () => "fetched";
      const mockRootWithFetch = { fetch: mockFetch };
      const handlerWithFetch = new GlobalRootHandler(mockRootWithFetch);
      const boundFetch = handlerWithFetch.getFetch();
      expect(typeof boundFetch).toBe("function");
    });

    it("should handle logging with different console scenarios", () => {
      const handler = new GlobalRootHandler({});

      // Test with normal console
      const logger = handler.getLogger("test");
      expect(typeof logger).toBe("function");

      // Test with missing console.error
      const originalConsole = global.console;
      global.console = {};
      const loggerNoError = handler.getLogger("test2");
      expect(() => loggerNoError("message")).not.toThrow();
      global.console = originalConsole;
    });
  });

  describe("ServiceRegistry comprehensive tests", () => {
    let serviceRegistry;

    beforeEach(() => {
      serviceRegistry = new ServiceRegistry();
    });

    it("should handle complex dependency scenarios", () => {
      const serviceA = { name: "A" };
      const serviceB = { name: "B" };
      const serviceC = { name: "C" };

      // Register service A first
      serviceRegistry.register("serviceA", serviceA, { type: "primary" }, []);

      // Register service B that depends on service A
      serviceRegistry.register("serviceB", serviceB, { type: "secondary" }, ["serviceA"]);

      // Register service C that depends on both A and B
      serviceRegistry.register("serviceC", serviceC, { type: "tertiary" }, ["serviceA", "serviceB"]);

      expect(serviceRegistry.getService("serviceA")).toBe(serviceA);
      expect(serviceRegistry.getService("serviceB")).toBe(serviceB);
      expect(serviceRegistry.getService("serviceC")).toBe(serviceC);
    });

    it("should validate dependencies correctly", () => {
      const serviceA = { name: "A" };

      // Should throw when required service doesn't exist
      expect(() => {
        serviceRegistry.register("serviceB", { name: "B" }, {}, ["missingService"]);
      }).toThrow("Required services are not registered: missingService");

      // Should not throw when required service exists
      serviceRegistry.register("serviceA", serviceA, {}, []);
      expect(() => {
        serviceRegistry.register("serviceC", { name: "C" }, {}, ["serviceA"]);
      }).not.toThrow();
    });

    it("should handle metadata operations correctly", () => {
      const service = { name: "test" };
      const metadata = { version: "1.0", author: "test" };

      serviceRegistry.register("testService", service, metadata, []);

      expect(serviceRegistry.getMetadata("testService")).toEqual(metadata);
      expect(serviceRegistry.getMetadata("nonExistent")).toBeUndefined();
      expect(serviceRegistry.listServices()).toEqual(["testService"]);
      expect(serviceRegistry.isRegistered("testService")).toBe(true);
      expect(serviceRegistry.isRegistered("nonExistent")).toBe(false);
    });

    it("should handle reset operations correctly", () => {
      serviceRegistry.register("service1", { name: "1" }, {}, []);
      serviceRegistry.register("service2", { name: "2" }, {}, []);

      expect(serviceRegistry.listServices()).toEqual(["service1", "service2"]);
      expect(serviceRegistry.isRegistered("service1")).toBe(true);

      serviceRegistry.reset();

      expect(serviceRegistry.listServices()).toEqual([]);
      expect(serviceRegistry.isRegistered("service1")).toBe(false);
      expect(serviceRegistry.getService("service1")).toBeUndefined();
    });
  });

  describe("HelperRegistry comprehensive tests", () => {
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

  describe("TsxCompilerService comprehensive tests", () => {
    let mockServiceRegistry;

    beforeEach(() => {
      mockServiceRegistry = new MockServiceRegistry();
    });

    it("should handle full compilation lifecycle", () => {
      // Mock Babel for testing
      const mockBabel = {
        transform: (source) => ({
          code: `// transformed: ${source}`
        })
      };

      // Mock fetch implementation
      const mockFetch = (url) => {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('console.log("test");')
        });
      };

      const mockNamespace = { helpers: {} };
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel,
        fetch: mockFetch
      });

      const service = new TsxCompilerService(config);
      
      // Initialize the service
      service.initialize();
      expect(service.initialized).toBe(true);
      
      // Check that all required properties are set up
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.Babel).toBe(mockBabel);
      expect(service.fetchImpl).toBe(mockFetch);

      // Test exports are available
      const exports = service.exports;
      expect(typeof exports.compileTSX).toBe("function");
      expect(typeof exports.transformSource).toBe("function");
      expect(typeof exports.executeModuleSource).toBe("function");

      // Test install process
      service.install();
      expect(mockServiceRegistry.registeredServices.has("tsxCompiler")).toBe(true);
    });

    it("should handle compilation errors gracefully", async () => {
      const mockBabel = {
        transform: (source) => {
          if (source.includes("error")) {
            throw new Error("Babel transformation error");
          }
          return { code: `// transformed: ${source}` };
        }
      };

      const mockFetch = (url) => {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('console.log("error");')
        });
      };

      const mockNamespace = { helpers: {} };
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel,
        fetch: mockFetch
      });

      const service = new TsxCompilerService(config);
      service.initialize();

      // This should handle the error gracefully (implementation-dependent)
      await expect(service.compileTSX("test-error.tsx", () => {})).rejects.toThrow();
    });

    it("should manage module context properly", () => {
      const mockBabel = {
        transform: (source) => ({
          code: source // Return source as-is for this test
        })
      };

      const mockNamespace = { helpers: {} };
      const config = new TsxCompilerConfig({
        serviceRegistry: mockServiceRegistry,
        namespace: mockNamespace,
        Babel: mockBabel
      });

      const service = new TsxCompilerService(config);
      service.initialize();

      // Initially the stack should be empty
      expect(service.moduleContextStack.length).toBe(0);

      // After executing a module, context should be added and then removed
      const mockRequire = () => {};
      service.executeModuleSource("console.log('test');", "test.tsx", "/path", mockRequire);

      // Stack should still be empty after execution (pushed then popped)
      expect(service.moduleContextStack.length).toBe(0);
    });
  });
});