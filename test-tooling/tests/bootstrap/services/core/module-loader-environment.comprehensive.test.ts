import ModuleLoaderEnvironment from "../../../../../bootstrap/services/core/module-loader-environment.js";

describe("ModuleLoaderEnvironment", () => {
  describe("constructor", () => {
    it("should throw error if no root object provided", () => {
      expect(() => new ModuleLoaderEnvironment()).toThrow("Root object required for ModuleLoaderEnvironment");
      expect(() => new ModuleLoaderEnvironment(null)).toThrow("Root object required for ModuleLoaderEnvironment");
      expect(() => new ModuleLoaderEnvironment(undefined)).toThrow("Root object required for ModuleLoaderEnvironment");
    });

    it("should set global property to the provided root", () => {
      const root = {};
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.global).toBe(root);
    });

    it("should create bootstrap namespace on the root if not present", () => {
      const root = {};
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.namespace).toEqual({});
      expect(root.__rwtraBootstrap).toBe(env.namespace);
    });

    it("should reuse existing bootstrap namespace if present on root", () => {
      const existingNamespace = { existing: true };
      const root = { __rwtraBootstrap: existingNamespace };
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.namespace).toBe(existingNamespace);
      expect(root.__rwtraBootstrap).toBe(existingNamespace);
    });

    it("should create helpers object in namespace if not present", () => {
      const root = {};
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.helpers).toEqual({});
      expect(env.namespace.helpers).toBe(env.helpers);
    });

    it("should reuse existing helpers if present in namespace", () => {
      const existingHelpers = { existing: true };
      const existingNamespace = { helpers: existingHelpers };
      const root = { __rwtraBootstrap: existingNamespace };
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.helpers).toBe(existingHelpers);
      expect(env.namespace.helpers).toBe(existingHelpers);
    });

    it("should set isCommonJs flag based on module environment", () => {
      const root = {};
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.isCommonJs).toBe(typeof module !== "undefined" && module.exports);
    });

    it("should work with complex root object", () => {
      const root = {
        window: { document: {} },
        __rwtraBootstrap: {
          helpers: { custom: "helper" }
        }
      };
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.global).toBe(root);
      expect(env.namespace).toBe(root.__rwtraBootstrap);
      expect(env.helpers).toBe(root.__rwtraBootstrap.helpers);
      expect(env.helpers.custom).toBe("helper");
    });
  });

  describe("property access", () => {
    let root, env;

    beforeEach(() => {
      root = {};
      env = new ModuleLoaderEnvironment(root);
    });

    it("should allow accessing global property", () => {
      expect(env.global).toBe(root);
    });

    it("should allow accessing namespace property", () => {
      expect(env.namespace).toBe(root.__rwtraBootstrap);
    });

    it("should allow accessing helpers property", () => {
      expect(env.helpers).toBe(root.__rwtraBootstrap.helpers);
    });

    it("should allow accessing isCommonJs property", () => {
      expect(typeof env.isCommonJs).toBe('boolean');
    });
  });

  describe("namespace creation", () => {
    it("should create namespace with correct structure", () => {
      const root = {};
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.namespace).toEqual({});
      expect(env.namespace).toBe(root.__rwtraBootstrap);
      expect(env.namespace).toHaveProperty('helpers');
      expect(env.namespace.helpers).toBe(env.helpers);
    });

    it("should not overwrite existing namespace properties", () => {
      const originalNamespace = { existingProp: "value" };
      const root = { __rwtraBootstrap: originalNamespace };
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.namespace).toBe(originalNamespace);
      expect(env.namespace.existingProp).toBe("value");
      expect(env.namespace.helpers).toBeDefined();
    });
  });

  describe("helpers creation", () => {
    it("should create helpers with correct structure", () => {
      const root = {};
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.helpers).toEqual({});
      expect(env.helpers).toBe(root.__rwtraBootstrap.helpers);
    });

    it("should not overwrite existing helpers", () => {
      const originalHelpers = { existingHelper: "value" };
      const originalNamespace = { helpers: originalHelpers };
      const root = { __rwtraBootstrap: originalNamespace };
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.helpers).toBe(originalHelpers);
      expect(env.helpers.existingHelper).toBe("value");
    });
  });

  describe("edge cases", () => {
    it("should handle root with null prototype", () => {
      const root = Object.create(null);
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.global).toBe(root);
      expect(env.namespace).toEqual({});
      expect(root.__rwtraBootstrap).toBe(env.namespace);
    });

    it("should handle root with non-writable properties", () => {
      const root = {};
      Object.defineProperty(root, '__rwtraBootstrap', {
        value: { helpers: {} },
        writable: false,
        configurable: true
      });
      
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.namespace).toBeDefined();
      expect(env.helpers).toBeDefined();
    });

    it("should handle root with getter/setter for bootstrap namespace", () => {
      const root = {};
      let bootstrapNamespace = null;
      
      Object.defineProperty(root, '__rwtraBootstrap', {
        get() { return bootstrapNamespace; },
        set(value) { bootstrapNamespace = value; },
        configurable: true
      });
      
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.namespace).toBe(bootstrapNamespace);
    });
  });

  describe("integration", () => {
    it("should work correctly in different environments", () => {
      const root = { 
        window: { document: { title: "Test" } },
        location: { href: "http://example.com" }
      };
      const env = new ModuleLoaderEnvironment(root);
      
      expect(env.global).toBe(root);
      expect(env.namespace).toEqual({});
      expect(env.helpers).toEqual({});
      expect(env.namespace.helpers).toBe(env.helpers);
      expect(typeof env.isCommonJs).toBe('boolean');
    });
  });
});