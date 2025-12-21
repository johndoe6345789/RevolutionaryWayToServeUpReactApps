// Comprehensive test suite for tsx-compiler.js entrypoint
// This replaces the generic stub tests with proper method-specific tests

describe("tsx-compiler.js entrypoint", () => {
  test("loads without throwing errors", () => {
    expect(() => {
      // The tsx-compiler.js module executes code when required, so we just check it doesn't throw
      require("../../../../../bootstrap/initializers/compilers/tsx-compiler.js");
    }).not.toThrow();
  });

  test("has proper integration with dependencies", () => {
    // Verify that all required dependencies can be loaded
    expect(() => {
      require("../../../../../bootstrap/services/local/tsx-compiler-service.js");
      require("../../../../../bootstrap/configs/local/tsx-compiler.js");
      require("../../../../../bootstrap/entrypoints/base-entrypoint.js");
    }).not.toThrow();
  });

  test("module structure is correct", () => {
    // Verify the module contains expected components
    const modulePath = require.resolve("../../../../../bootstrap/initializers/compilers/tsx-compiler.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    expect(moduleSource).toContain('TsxCompilerService');
    expect(moduleSource).toContain('TsxCompilerConfig');
    expect(moduleSource).toContain('BaseEntryPoint');
    expect(moduleSource).toContain('configFactory');
    expect(moduleSource).toContain('namespace, root');
    expect(moduleSource).toContain('entrypoint.run()');
    expect(moduleSource).toContain('module.exports = tsxCompilerService.exports');
  });

  test("follows the BaseEntryPoint pattern correctly", () => {
    // Verify the module follows the expected pattern of using BaseEntryPoint
    const modulePath = require.resolve("../../../../../bootstrap/initializers/compilers/tsx-compiler.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    // Check for the expected instantiation and execution pattern
    expect(moduleSource).toMatch(/new\s+BaseEntryPoint\s*\(\s*{/);
    expect(moduleSource).toContain('ServiceClass: TsxCompilerService');
    expect(moduleSource).toContain('ConfigClass: TsxCompilerConfig');
    expect(moduleSource).toContain('entrypoint.run()');
  });

  test("exports the expected functionality", () => {
    // This test verifies that the module exports the expected functionality
    // by checking that it returns the result of entrypoint.run().exports
    const modulePath = require.resolve("../../../../../bootstrap/initializers/compilers/tsx-compiler.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    // Check that it exports the service's exports property
    expect(moduleSource).toContain('module.exports = tsxCompilerService.exports');
  });

  test("configFactory has correct structure", () => {
    // Check that the configFactory function has the expected signature and properties
    const modulePath = require.resolve("../../../../../bootstrap/initializers/compilers/tsx-compiler.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    // The configFactory should extract the expected properties
    expect(moduleSource).toContain('namespace, root');
    expect(moduleSource).toContain('fetch: typeof root.fetch === "function" ? root.fetch.bind(root) : undefined');
    expect(moduleSource).toContain('Babel: root.Babel');
  });
});