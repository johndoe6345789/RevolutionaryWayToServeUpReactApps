const SourceUtilsService = require("../../../../bootstrap/services/cdn/source-utils-service.js");
const SourceUtilsConfig = require("../../../../bootstrap/configs/cdn/source-utils.js");
const ServiceRegistry = require("../../../../bootstrap/services/service-registry.js");

describe("SourceUtilsService", () => {
  describe("constructor", () => {
    test("should create an instance with default config when no config provided", () => {
      const service = new SourceUtilsService();
      expect(service).toBeInstanceOf(SourceUtilsService);
      expect(service.config).toBeInstanceOf(SourceUtilsConfig);
    });

    test("should create an instance with provided config", () => {
      const config = new SourceUtilsConfig();
      const service = new SourceUtilsService(config);
      expect(service.config).toBe(config);
    });

    test("should inherit from BaseService", () => {
      const service = new SourceUtilsService();
      expect(service).toHaveProperty('_ensureNotInitialized');
      expect(service).toHaveProperty('_markInitialized');
      expect(service).toHaveProperty('initialized');
    });
  });

  describe("initialize method", () => {
    let mockNamespace, mockServiceRegistry;

    beforeEach(() => {
      mockNamespace = { helpers: {} };
      mockServiceRegistry = new ServiceRegistry();
    });

    test("should set up internal properties and mark as initialized", () => {
      const config = new SourceUtilsConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new SourceUtilsService(config);

      const result = service.initialize();

      expect(result).toBe(service);
      expect(service.namespace).toBe(mockNamespace);
      expect(service.helpers).toBe(mockNamespace.helpers);
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.initialized).toBe(true);
    });

    test("should create helpers if not present in namespace", () => {
      const config = new SourceUtilsConfig({ namespace: { helpers: undefined }, serviceRegistry: mockServiceRegistry });
      const service = new SourceUtilsService(config);

      service.initialize();

      expect(service.helpers).toEqual({});
      expect(service.namespace.helpers).toBe(service.helpers);
    });

    test("should set isCommonJs based on module environment", () => {
      const config = new SourceUtilsConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new SourceUtilsService(config);

      service.initialize();

      expect(typeof service.isCommonJs).toBe('boolean');
    });

    test("should prevent double initialization", () => {
      const config = new SourceUtilsConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new SourceUtilsService(config);

      service.initialize();

      expect(() => service.initialize()).toThrow();
    });
  });

  describe("collectDynamicModuleImports method", () => {
    test("should return empty array when no dynamic modules config provided", () => {
      const service = new SourceUtilsService();
      const source = 'import { something } from "normal-module";';
      const result = service.collectDynamicModuleImports(source, {});

      expect(result).toEqual([]);
    });

    test("should return empty array when no dynamic module rules match", () => {
      const service = new SourceUtilsService();
      const source = 'import { something } from "normal-module";';
      const result = service.collectDynamicModuleImports(source, { 
        dynamicModules: [{ prefix: "@special/" }] 
      });

      expect(result).toEqual([]);
    });

    test("should extract dynamic module imports that match configured prefixes", () => {
      const service = new SourceUtilsService();
      const source = `
        import Button from "@app/Button";
        import { Icon } from "@ui/Icon";
        const component = require("@app/Component");
        const external = require("normal-module");
      `;
      const result = service.collectDynamicModuleImports(source, { 
        dynamicModules: [{ prefix: "@app/" }, { prefix: "@ui/" }] 
      });

      expect(result).toContain("@app/Button");
      expect(result).toContain("@ui/Icon");
      expect(result).toContain("@app/Component");
      expect(result).not.toContain("normal-module");
    });

    test("should handle multiple imports of the same module", () => {
      const service = new SourceUtilsService();
      const source = `
        import Button from "@app/Button";
        const btn = require("@app/Button");
      `;
      const result = service.collectDynamicModuleImports(source, { 
        dynamicModules: [{ prefix: "@app/" }] 
      });

      expect(result).toEqual(["@app/Button"]);
    });

    test("should handle empty source", () => {
      const service = new SourceUtilsService();
      const result = service.collectDynamicModuleImports("", { 
        dynamicModules: [{ prefix: "@app/" }] 
      });

      expect(result).toEqual([]);
    });

    test("should handle source with no imports", () => {
      const service = new SourceUtilsService();
      const source = "// Just a comment\nconst x = 5;";
      const result = service.collectDynamicModuleImports(source, { 
        dynamicModules: [{ prefix: "@app/" }] 
      });

      expect(result).toEqual([]);
    });
  });

  describe("preloadDynamicModulesFromSource method", () => {
    test("should not preload if requireFn has no _async method", async () => {
      const service = new SourceUtilsService();
      const source = 'import { something } from "@app/module";';
      const requireFn = {};
      
      await expect(
        service.preloadDynamicModulesFromSource(source, requireFn, { 
          dynamicModules: [{ prefix: "@app/" }] 
        })
      ).resolves.toBeUndefined();
    });

    test("should not preload if no matching dynamic modules found", async () => {
      const service = new SourceUtilsService();
      const source = 'import { something } from "normal-module";';
      const mockRequireFn = {
        _async: jest.fn()
      };
      
      await expect(
        service.preloadDynamicModulesFromSource(source, mockRequireFn, { 
          dynamicModules: [{ prefix: "@app/" }] 
        })
      ).resolves.toBeUndefined();
      
      expect(mockRequireFn._async).not.toHaveBeenCalled();
    });

    test("should preload matching dynamic modules", async () => {
      const service = new SourceUtilsService();
      const source = 'import { something } from "@app/module";';
      const mockRequireFn = {
        _async: jest.fn(() => Promise.resolve())
      };
      
      await service.preloadDynamicModulesFromSource(source, mockRequireFn, { 
        dynamicModules: [{ prefix: "@app/" }] 
      });
      
      expect(mockRequireFn._async).toHaveBeenCalledWith("@app/module");
    });

    test("should handle preload failures gracefully", async () => {
      const service = new SourceUtilsService();
      const source = 'import { something } from "@app/module";';
      const mockRequireFn = {
        _async: jest.fn((name) => Promise.reject(new Error(`Failed to load ${name}`)))
      };
      
      // Spy on console.warn to verify it gets called
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      await service.preloadDynamicModulesFromSource(source, mockRequireFn, { 
        dynamicModules: [{ prefix: "@app/" }] 
      });
      
      expect(warnSpy).toHaveBeenCalledWith("Preload failed for", "@app/module", expect.any(Error));
      warnSpy.mockRestore();
    });
  });

  describe("collectModuleSpecifiers method", () => {
    test("should extract all import specifiers from source", () => {
      const service = new SourceUtilsService();
      const source = `
        import { helper } from "helpers/simple";
        import React from "react";
        import { Component } from "react";
      `;
      const result = service.collectModuleSpecifiers(source);

      expect(result).toContain("helpers/simple");
      expect(result).toContain("react");
      expect(result.length).toBe(2); // Should be deduplicated
    });

    test("should extract all require specifiers from source", () => {
      const service = new SourceUtilsService();
      const source = `
        const loader = require("loader");
        const utils = require("utils/path");
      `;
      const result = service.collectModuleSpecifiers(source);

      expect(result).toContain("loader");
      expect(result).toContain("utils/path");
    });

    test("should extract both import and require specifiers", () => {
      const service = new SourceUtilsService();
      const source = `
        import { helper } from "helpers/simple";
        const loader = require("loader");
      `;
      const result = service.collectModuleSpecifiers(source);

      expect(result).toContain("helpers/simple");
      expect(result).toContain("loader");
    });

    test("should handle mixed import styles", () => {
      const service = new SourceUtilsService();
      const source = `
        import "side-effect";
        import Default from "default-module";
        import { Named } from "named-module";
        import * as Namespace from "namespace-module";
        import Default2, { Named2 } from "mixed-module";
        const mod = require("commonjs-module");
      `;
      const result = service.collectModuleSpecifiers(source);

      expect(result).toContain("side-effect");
      expect(result).toContain("default-module");
      expect(result).toContain("named-module");
      expect(result).toContain("namespace-module");
      expect(result).toContain("mixed-module");
      expect(result).toContain("commonjs-module");
    });

    test("should handle empty source", () => {
      const service = new SourceUtilsService();
      const result = service.collectModuleSpecifiers("");

      expect(result).toEqual([]);
    });

    test("should deduplicate specifiers", () => {
      const service = new SourceUtilsService();
      const source = `
        import { helper1 } from "helpers";
        import { helper2 } from "helpers";
        const h = require("helpers");
      `;
      const result = service.collectModuleSpecifiers(source);

      expect(result).toEqual(["helpers"]);
    });
  });

  describe("preloadModulesFromSource method", () => {
    test("should not preload if requireFn has no _async method", async () => {
      const service = new SourceUtilsService();
      const source = 'import { something } from "normal-module";';
      const requireFn = {};
      
      await expect(
        service.preloadModulesFromSource(source, requireFn)
      ).resolves.toBeUndefined();
    });

    test("should not preload if no specifiers found", async () => {
      const service = new SourceUtilsService();
      const source = '// Just a comment';
      const mockRequireFn = {
        _async: jest.fn()
      };
      
      await expect(
        service.preloadModulesFromSource(source, mockRequireFn)
      ).resolves.toBeUndefined();
      
      expect(mockRequireFn._async).not.toHaveBeenCalled();
    });

    test("should preload all found modules", async () => {
      const service = new SourceUtilsService();
      const source = 'import { helper } from "helpers/simple";';
      const mockRequireFn = {
        _async: jest.fn(() => Promise.resolve())
      };
      
      await service.preloadModulesFromSource(source, mockRequireFn);
      
      expect(mockRequireFn._async).toHaveBeenCalledWith("helpers/simple", "");
    });

    test("should preload with custom base directory", async () => {
      const service = new SourceUtilsService();
      const source = 'import { helper } from "helpers/simple";';
      const mockRequireFn = {
        _async: jest.fn(() => Promise.resolve())
      };
      
      await service.preloadModulesFromSource(source, mockRequireFn, "/base/path");
      
      expect(mockRequireFn._async).toHaveBeenCalledWith("helpers/simple", "/base/path");
    });

    test("should throw error when any preload fails", async () => {
      const service = new SourceUtilsService();
      const source = 'import { helper } from "helpers/simple";';
      const mockRequireFn = {
        _async: jest.fn(() => Promise.reject(new Error("Load failed")))
      };
      
      await expect(
        service.preloadModulesFromSource(source, mockRequireFn)
      ).rejects.toThrow("Failed to preload module(s): helpers/simple: Load failed");
    });

    test("should handle multiple failures", async () => {
      const service = new SourceUtilsService();
      const source = `
        import { helper1 } from "helpers1";
        import { helper2 } from "helpers2";
      `;
      const mockRequireFn = {
        _async: jest.fn((name) => {
          if (name === "helpers1") {
            return Promise.reject(new Error("Failed 1"));
          }
          if (name === "helpers2") {
            return Promise.reject(new Error("Failed 2"));
          }
          return Promise.resolve();
        })
      };
      
      await expect(
        service.preloadModulesFromSource(source, mockRequireFn)
      ).rejects.toThrow("Failed to preload module(s): helpers1: Failed 1, helpers2: Failed 2");
    });
  });

  describe("exports property", () => {
    test("should return object with all expected methods bound to service", () => {
      const service = new SourceUtilsService();
      
      const exports = service.exports;
      
      expect(exports).toHaveProperty('collectDynamicModuleImports');
      expect(exports).toHaveProperty('preloadDynamicModulesFromSource');
      expect(exports).toHaveProperty('collectModuleSpecifiers');
      expect(exports).toHaveProperty('preloadModulesFromSource');
      
      expect(typeof exports.collectDynamicModuleImports).toBe('function');
      expect(typeof exports.preloadDynamicModulesFromSource).toBe('function');
      expect(typeof exports.collectModuleSpecifiers).toBe('function');
      expect(typeof exports.preloadModulesFromSource).toBe('function');
    });

    test("should bind methods to the service instance", () => {
      const service = new SourceUtilsService();
      
      const exports = service.exports;
      
      // Verify that the methods are bound to the service
      expect(exports.collectDynamicModuleImports).not.toBe(service.collectDynamicModuleImports);
      expect(exports.preloadDynamicModulesFromSource).not.toBe(service.preloadDynamicModulesFromSource);
      expect(exports.collectModuleSpecifiers).not.toBe(service.collectModuleSpecifiers);
      expect(exports.preloadModulesFromSource).not.toBe(service.preloadModulesFromSource);
    });
  });

  describe("install method", () => {
    let mockNamespace, mockServiceRegistry;

    beforeEach(() => {
      mockNamespace = { helpers: {} };
      mockServiceRegistry = new ServiceRegistry();
    });

    test("should register the service in the registry and install helpers", () => {
      const config = new SourceUtilsConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new SourceUtilsService(config);
      service.initialize();

      const result = service.install();

      expect(result).toBe(service);
      expect(mockServiceRegistry.isRegistered("sourceUtils")).toBe(true);
      expect(mockNamespace.helpers.sourceUtils).toBeDefined();
    });

    test("should install exports in the helpers namespace", () => {
      const config = new SourceUtilsConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new SourceUtilsService(config);
      service.initialize();

      service.install();

      expect(mockNamespace.helpers.sourceUtils).toBe(service.exports);
    });

    test("should register with correct folder and domain", () => {
      const config = new SourceUtilsConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new SourceUtilsService(config);
      service.initialize();

      service.install();

      const metadata = mockServiceRegistry.getMetadata("sourceUtils");
      expect(metadata.folder).toBe("services/cdn");
      expect(metadata.domain).toBe("cdn");
    });

    test("should throw if called before initialization", () => {
      const service = new SourceUtilsService();

      expect(() => service.install()).toThrow();
    });
  });

  describe("integration", () => {
    let mockNamespace, mockServiceRegistry;

    beforeEach(() => {
      mockNamespace = { helpers: {} };
      mockServiceRegistry = new ServiceRegistry();
    });

    test("should work through full lifecycle", () => {
      const config = new SourceUtilsConfig({ namespace: mockNamespace, serviceRegistry: mockServiceRegistry });
      const service = new SourceUtilsService(config);

      // Initialize
      service.initialize();
      expect(service.initialized).toBe(true);

      // Use methods
      const imports = service.collectDynamicModuleImports(
        'import Button from "@app/Button";', 
        { dynamicModules: [{ prefix: "@app/" }] }
      );
      expect(imports).toContain("@app/Button");

      // Install
      service.install();
      expect(mockServiceRegistry.isRegistered("sourceUtils")).toBe(true);
      expect(mockNamespace.helpers.sourceUtils).toBeDefined();
    });
  });
});