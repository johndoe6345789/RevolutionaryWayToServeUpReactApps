describe("bootstrap/services/core/module-loader-service.js", () => {
  const modulePath = '../../../../../bootstrap/services/core/module-loader-service.js';

  it("requires an environment root before initialization", () => {
    const ModuleLoaderAggregator = require(modulePath);
    const serviceRegistry = { register: jest.fn() };
    const loader = new ModuleLoaderAggregator({ serviceRegistry });

    expect(() => loader.initialize()).toThrow(
      "Environment root required for ModuleLoaderAggregator"
    );
  });

  it("registers merged module loader helpers with the service registry", () => {
    const ModuleLoaderAggregator = require(modulePath);
    const networkExports = require("../../../../../bootstrap/cdn/network.js");
    const environmentRoot = {};
    const serviceRegistry = { register: jest.fn() };
    const loader = new ModuleLoaderAggregator({
      environmentRoot,
      serviceRegistry,
    });

    loader.initialize();

    expect(loader.global).toBe(environmentRoot);
    expect(environmentRoot.__rwtraBootstrap.helpers).toBe(loader.helpers);
    expect(loader.exports.resolveProvider).toBe(networkExports.resolveProvider);
    expect(serviceRegistry.register).toHaveBeenCalledWith(
      "moduleLoader",
      loader.exports,
      { folder: "services/core", domain: "core" }
    );
  });
});
