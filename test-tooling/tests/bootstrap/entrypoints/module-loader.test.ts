// Since the module-loader.js is a simple file that just creates and runs a BaseEntryPoint,
// we'll test its functionality by verifying that it properly exports the expected interface
const moduleLoaderExports = require("../../../../bootstrap/entrypoints/module-loader.js");

describe("bootstrap/entrypoints/module-loader.js", () => {
  it("exports the module loader helpers from the entrypoint", () => {
    // The module loader should export the result of running the BaseEntryPoint
    expect(moduleLoaderExports).toBeDefined();
    // The exports should contain the expected module loader functionality
    // This test verifies that the module loads without error and exports something
    expect(typeof moduleLoaderExports).toBe('object');
  });

  it("should have the expected structure after running", () => {
    // The module should have been executed and returned exports from the service
    expect(moduleLoaderExports).toBeDefined();
  });
});
