// Comprehensive test suite for sass-compiler.js initializer
// This replaces the generic stub tests with proper Bun tests

describe("sass-compiler.js initializer", () => {
  test("loads without throwing errors", () => {
    expect(() => {
      // The sass-compiler.js module executes code when required, so we just check it doesn't throw
      require("../../../../../bootstrap/initializers/compilers/sass-compiler.js");
    }).not.toThrow();
  });

  test("has proper integration with dependencies", () => {
    // Verify that all required dependencies can be loaded
    expect(() => {
      require("../../../../../bootstrap/services/local/sass-compiler-service.js");
      require("../../../../../bootstrap/configs/local/sass-compiler.js");
      require("../../../../../bootstrap/entrypoints/base-entrypoint.js");
    }).not.toThrow();
  });

  test("module structure is correct", () => {
    // Verify the module contains expected components
    const modulePath = require.resolve("../../../../../bootstrap/initializers/compilers/sass-compiler.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    expect(moduleSource).toContain('SassCompilerService');
    expect(moduleSource).toContain('SassCompilerConfig');
    expect(moduleSource).toContain('BaseEntryPoint');
    expect(moduleSource).toContain('configFactory');
    expect(moduleSource).toContain('namespace, root');
    expect(moduleSource).toContain('entrypoint.run()');
    expect(moduleSource).toContain('module.exports = sassCompilerService.exports');
  });

  test("follows the BaseEntryPoint pattern correctly", () => {
    // Verify the module follows the expected pattern of using BaseEntryPoint
    const modulePath = require.resolve("../../../../../bootstrap/initializers/compilers/sass-compiler.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    // Check for the expected instantiation and execution pattern
    expect(moduleSource).toMatch(/new\s+BaseEntryPoint\s*\(\s*{/);
    expect(moduleSource).toContain('ServiceClass: SassCompilerService');
    expect(moduleSource).toContain('ConfigClass: SassCompilerConfig');
    expect(moduleSource).toContain('entrypoint.run()');
  });

  test("exports the expected functionality", () => {
    // This test verifies that the module exports the expected functionality
    // by checking that it returns the result of entrypoint.run().exports
    const modulePath = require.resolve("../../../../../bootstrap/initializers/compilers/sass-compiler.js");
    const moduleSource = require('fs').readFileSync(modulePath, 'utf8');
    
    // Check that it exports the service's exports property
    expect(moduleSource).toContain('module.exports = sassCompilerService.exports');
  });
});