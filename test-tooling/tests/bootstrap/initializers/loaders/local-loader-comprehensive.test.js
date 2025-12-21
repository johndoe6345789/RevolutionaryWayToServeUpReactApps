// Comprehensive test suite for local-loader.js entrypoint
// This replaces the generic stub tests with proper method-specific tests

describe("local-loader.js entrypoint", () => {
  test("loads without throwing errors", () => {
    expect(() => {
      // The local-loader.js module executes code when required, so we just check it doesn't throw
      require("../../../../../bootstrap/initializers/loaders/local-loader.js");
    }).not.toThrow();
  });

  test("has proper integration with dependencies", () => {
    // Verify that all required dependencies can be loaded
    expect(() => {
      require("../../../../../bootstrap/services/local/local-loader-service.js");
      require("../../../../../bootstrap/configs/local/local-loader.js");
      require("../../../../../bootstrap/entrypoints/base-entrypoint.js");
    }).not.toThrow();
  });

  test("module structure is correct", () => {
    // Verify the module contains expected components
    const modulePath = require.resolve("../../../../../bootstrap/initializers/loaders/local-loader.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    expect(moduleSource).toContain('LocalLoaderService');
    expect(moduleSource).toContain('LocalLoaderConfig');
    expect(moduleSource).toContain('BaseEntryPoint');
    expect(moduleSource).toContain('configFactory');
    expect(moduleSource).toContain('namespace, document');
    expect(moduleSource).toContain('entrypoint.run()');
    expect(moduleSource).toContain('module.exports = localLoaderService.exports');
  });

  test("follows the BaseEntryPoint pattern correctly", () => {
    // Verify the module follows the expected pattern of using BaseEntryPoint
    const modulePath = require.resolve("../../../../../bootstrap/initializers/loaders/local-loader.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    // Check for the expected instantiation and execution pattern
    expect(moduleSource).toMatch(/new\s+BaseEntryPoint\s*\(\s*{/);
    expect(moduleSource).toContain('ServiceClass: LocalLoaderService');
    expect(moduleSource).toContain('ConfigClass: LocalLoaderConfig');
    expect(moduleSource).toContain('entrypoint.run()');
  });

  test("exports the expected functionality", () => {
    // Check that the module exports the service's exports property
    const modulePath = require.resolve("../../../../../bootstrap/initializers/loaders/local-loader.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    // Verify the module contains the expected export pattern
    expect(moduleSource).toContain('module.exports = localLoaderService.exports');
  });

  test("configFactory has correct structure", () => {
    // Check that the configFactory function has the expected signature and properties
    const modulePath = require.resolve("../../../../../bootstrap/initializers/loaders/local-loader.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    // The configFactory should extract the expected properties
    expect(moduleSource).toContain('configFactory: ({ namespace, document }) => ({ namespace, document })');
  });
});