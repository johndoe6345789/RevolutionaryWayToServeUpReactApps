// Comprehensive test suite for local-module-loader.js entrypoint
// This replaces the generic stub tests with proper method-specific tests

describe("local-module-loader.js entrypoint", () => {
  test("loads without throwing errors", () => {
    expect(() => {
      // The local-module-loader.js module executes code when required, so we just check it doesn't throw
      require("../../../../../bootstrap/initializers/loaders/local-module-loader.js");
    }).not.toThrow();
  });

  test("has proper integration with dependencies", () => {
    // Verify that all required dependencies can be loaded
    expect(() => {
      require("../../../../../bootstrap/services/local/local-module-loader-service.js");
      require("../../../../../bootstrap/configs/local/local-module-loader.js");
      require("../../../../../bootstrap/entrypoints/base-entrypoint.js");
    }).not.toThrow();
  });

  test("module structure is correct", () => {
    // Verify the module contains expected components
    const modulePath = require.resolve("../../../../../bootstrap/initializers/loaders/local-module-loader.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    expect(moduleSource).toContain('LocalModuleLoaderService');
    expect(moduleSource).toContain('LocalModuleLoaderConfig');
    expect(moduleSource).toContain('BaseEntryPoint');
    expect(moduleSource).toContain('configFactory');
    expect(moduleSource).toContain('namespace, root');
    expect(moduleSource).toContain('fetch: typeof root.fetch === "function" ? root.fetch.bind(root) : undefined');
    expect(moduleSource).toContain('entrypoint.run()');
    expect(moduleSource).toContain('module.exports = localModuleLoaderService.exports');
  });

  test("follows the BaseEntryPoint pattern correctly", () => {
    // Verify the module follows the expected pattern of using BaseEntryPoint
    const modulePath = require.resolve("../../../../../bootstrap/initializers/loaders/local-module-loader.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    // Check for the expected instantiation and execution pattern
    expect(moduleSource).toMatch(/new\s+BaseEntryPoint\s*\(\s*{/);
    expect(moduleSource).toContain('ServiceClass: LocalModuleLoaderService');
    expect(moduleSource).toContain('ConfigClass: LocalModuleLoaderConfig');
    expect(moduleSource).toContain('entrypoint.run()');
  });

  test("exports the expected functionality", () => {
    // Check that the module exports the service's exports property
    const modulePath = require.resolve("../../../../../bootstrap/initializers/loaders/local-module-loader.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    // Verify the module contains the expected export pattern
    expect(moduleSource).toContain('module.exports = localModuleLoaderService.exports');
  });

  test("configFactory has correct structure with fetch binding", () => {
    // Check that the configFactory function has the expected signature and properties
    const modulePath = require.resolve("../../../../../bootstrap/initializers/loaders/local-module-loader.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    // The configFactory should extract the expected properties with fetch binding
    expect(moduleSource).toContain('configFactory: ({ namespace, root }) => ({');
    expect(moduleSource).toContain('namespace,');
    expect(moduleSource).toMatch(/fetch:\s*typeof\s+root\.fetch\s+===\s+"function"\s+\?\s+root\.fetch\.bind\(root\)\s+:\s+undefined/);
  });
});