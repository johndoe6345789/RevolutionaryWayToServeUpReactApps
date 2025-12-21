const SourceUtilsService = require("../../../../bootstrap/services/cdn/source-utils-service.js");

// Mock dependencies
jest.mock("../../../../bootstrap/configs/cdn/source-utils.js", () => {
  return jest.fn().mockImplementation(() => ({}));
});

describe("SourceUtilsService", () => {
  let service;
  let mockNamespace;
  let mockServiceRegistry;

  beforeEach(() => {
    mockNamespace = { helpers: {} };
    mockServiceRegistry = { register: jest.fn() };
    
    service = new SourceUtilsService({
      namespace: mockNamespace,
      serviceRegistry: mockServiceRegistry
    });
  });

  describe("constructor and initialization", () => {
    it("should initialize with correct configuration", () => {
      expect(service).toBeInstanceOf(SourceUtilsService);
      expect(service.config).toBeDefined();
    });

    it("should properly initialize and set up namespace", () => {
      service.initialize();
      expect(service.namespace).toBe(mockNamespace);
      expect(service.helpers).toBe(mockNamespace.helpers);
      expect(service.serviceRegistry).toBe(mockServiceRegistry);
      expect(service.isCommonJs).toBeDefined();
    });

    it("should throw if initialized twice", () => {
      service.initialize();
      expect(() => service.initialize()).toThrow();
    });
  });

  describe("collectDynamicModuleImports method", () => {
    const dynamicRules = [{ prefix: "@app/" }, { prefix: "@ui/" }];

    it("should collect dynamic module imports that match configured prefixes", () => {
      const source = `
        import Button from "@app/Button";
        import { Icon } from "@ui/Icon";
        const component = require("@app/Component");
        const external = require("external");
      `;
      
      service.initialize();
      const imports = service.collectDynamicModuleImports(source, { dynamicModules: dynamicRules });
      
      expect(imports).toContain("@app/Button");
      expect(imports).toContain("@ui/Icon");
      expect(imports).toContain("@app/Component");
      expect(imports).not.toContain("external");
    });

    it("should return empty array when no dynamic modules config provided", () => {
      const source = 'import Button from "@app/Button";';
      
      service.initialize();
      const imports = service.collectDynamicModuleImports(source, {});
      
      expect(imports).toEqual([]);
    });

    it("should return empty array when no matching prefixes found", () => {
      const source = 'import Button from "regular/Button";';
      
      service.initialize();
      const imports = service.collectDynamicModuleImports(source, { dynamicModules: dynamicRules });
      
      expect(imports).toEqual([]);
    });

    it("should handle multiple imports of the same module", () => {
      const source = `
        import Button from "@app/Button";
        const btn = require("@app/Button");
      `;
      
      service.initialize();
      const imports = service.collectDynamicModuleImports(source, { dynamicModules: dynamicRules });
      
      expect(imports).toEqual(["@app/Button"]); // Should be deduplicated
    });

    it("should handle empty source", () => {
      service.initialize();
      const imports = service.collectDynamicModuleImports("", { dynamicModules: dynamicRules });
      
      expect(imports).toEqual([]);
    });
  });

  describe("preloadDynamicModulesFromSource method", () => {
    const dynamicRules = [{ prefix: "@app/" }];
    
    it("should preload dynamic modules when requireFn has _async method", async () => {
      const source = 'import Button from "@app/Button";';
      const mockRequireFn = {
        _async: jest.fn(() => Promise.resolve({ default: true }))
      };
      
      service.initialize();
      await service.preloadDynamicModulesFromSource(source, mockRequireFn, { dynamicModules: dynamicRules });
      
      expect(mockRequireFn._async).toHaveBeenCalledWith("@app/Button");
    });

    it("should not preload when requireFn doesn't have _async method", async () => {
      const source = 'import Button from "@app/Button";';
      const mockRequireFn = {};
      
      service.initialize();
      await service.preloadDynamicModulesFromSource(source, mockRequireFn, { dynamicModules: dynamicRules });
      
      // Should not throw and should not call _async
    });

    it("should not preload when no matching dynamic modules found", async () => {
      const source = 'import Button from "regular/Button";';
      const mockRequireFn = {
        _async: jest.fn(() => Promise.resolve({ default: true }))
      };
      
      service.initialize();
      await service.preloadDynamicModulesFromSource(source, mockRequireFn, { dynamicModules: dynamicRules });
      
      expect(mockRequireFn._async).not.toHaveBeenCalled();
    });

    it("should handle preload failures gracefully", async () => {
      const source = 'import Button from "@app/Button";';
      const mockRequireFn = {
        _async: jest.fn(() => Promise.reject(new Error("Failed to load")))
      };
      
      service.initialize();
      await service.preloadDynamicModulesFromSource(source, mockRequireFn, { dynamicModules: dynamicRules });
      
      expect(mockRequireFn._async).toHaveBeenCalledWith("@app/Button");
      // Should not throw, just warn
    });
  });

  describe("collectModuleSpecifiers method", () => {
    it("should collect all module specifiers from import statements", () => {
      const source = `
        import { helper } from "helpers/simple";
        import React from "react";
        import { Component } from "react";
      `;
      
      service.initialize();
      const specs = service.collectModuleSpecifiers(source);
      
      expect(specs).toContain("helpers/simple");
      expect(specs).toContain("react");
    });

    it("should collect all module specifiers from require calls", () => {
      const source = `
        const loader = require("loader");
        const utils = require("utils/path");
      `;
      
      service.initialize();
      const specs = service.collectModuleSpecifiers(source);
      
      expect(specs).toContain("loader");
      expect(specs).toContain("utils/path");
    });

    it("should collect both import and require specifiers", () => {
      const source = `
        import { helper } from "helpers/simple";
        const loader = require("loader");
      `;
      
      service.initialize();
      const specs = service.collectModuleSpecifiers(source);
      
      expect(specs).toContain("helpers/simple");
      expect(specs).toContain("loader");
    });

    it("should deduplicate specifiers", () => {
      const source = `
        import { helper1 } from "helpers";
        import { helper2 } from "helpers";
        const h = require("helpers");
      `;
      
      service.initialize();
      const specs = service.collectModuleSpecifiers(source);
      
      expect(specs).toEqual(["helpers"]); // Should be deduplicated
    });

    it("should handle empty source", () => {
      service.initialize();
      const specs = service.collectModuleSpecifiers("");
      
      expect(specs).toEqual([]);
    });
  });

  describe("preloadModulesFromSource method", () => {
    it("should preload all modules when requireFn has _async method", async () => {
      const source = 'import { helper } from "helpers/simple";';
      const mockRequireFn = {
        _async: jest.fn(() => Promise.resolve({ default: true }))
      };
      
      service.initialize();
      await service.preloadModulesFromSource(source, mockRequireFn);
      
      expect(mockRequireFn._async).toHaveBeenCalledWith("helpers/simple", "");
    });

    it("should preload with custom base directory", async () => {
      const source = 'import { helper } from "helpers/simple";';
      const mockRequireFn = {
        _async: jest.fn(() => Promise.resolve({ default: true }))
      };
      
      service.initialize();
      await service.preloadModulesFromSource(source, mockRequireFn, "/base/path");
      
      expect(mockRequireFn._async).toHaveBeenCalledWith("helpers/simple", "/base/path");
    });

    it("should not preload when requireFn doesn't have _async method", async () => {
      const source = 'import { helper } from "helpers/simple";';
      const mockRequireFn = {};
      
      service.initialize();
      await service.preloadModulesFromSource(source, mockRequireFn);
      
      // Should not throw and should not call _async
    });

    it("should throw error when any preload fails", async () => {
      const source = 'import { helper } from "helpers/simple";';
      const mockRequireFn = {
        _async: jest.fn(() => Promise.reject(new Error("Failed to load")))
      };
      
      service.initialize();
      await expect(service.preloadModulesFromSource(source, mockRequireFn))
        .rejects.toThrow("Failed to preload module(s): helpers/simple: Failed to load");
    });

    it("should not throw when all preloads succeed", async () => {
      const source = 'import { helper } from "helpers/simple";';
      const mockRequireFn = {
        _async: jest.fn(() => Promise.resolve({ default: true }))
      };
      
      service.initialize();
      await expect(service.preloadModulesFromSource(source, mockRequireFn))
        .resolves.toBeUndefined();
    });
  });

  describe("exports getter and install method", () => {
    it("should return object with all expected methods bound to service", () => {
      service.initialize();
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

    it("should register the service and install helpers", () => {
      service.initialize();
      const result = service.install();
      
      expect(result).toBe(service);
      expect(mockServiceRegistry.register).toHaveBeenCalledWith(
        "sourceUtils", 
        expect.any(Object), // service.exports object
        { folder: "services/cdn", domain: "cdn" }
      );
      // Check that the helpers were installed
      expect(mockNamespace.helpers).toHaveProperty('sourceUtils');
    });

    it("should throw if install called before initialization", () => {
      expect(() => service.install()).toThrow();
    });
  });
});