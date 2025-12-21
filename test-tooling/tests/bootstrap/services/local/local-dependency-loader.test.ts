const LocalDependencyLoader = require("../../../../../bootstrap/services/local/local-dependency-loader.js");
const LocalDependencyLoaderConfig = require("../../../../../bootstrap/configs/local/local-dependency-loader.js");

describe("bootstrap/services/local/local-dependency-loader.js", () => {
  it("declares the expected helper dependency descriptors", () => {
    const loader = new LocalDependencyLoader(new LocalDependencyLoaderConfig());
    const descriptorNames = loader._dependencyDescriptors().map((descriptor: any) => descriptor.name);
    expect(descriptorNames).toEqual([
      "logging",
      "dynamicModules",
      "sassCompiler",
      "tsxCompiler",
      "localPaths",
      "localModuleLoader"
    ]);
  });

  it("resolves overrides, helpers, and registers itself with the helper registry", () => {
    const overrides = {
      logging: { override: "logging" },
      dynamicModules: { override: "dynamic" }
    };
    const helperRegistry = {
      getHelper: jest.fn((helperName: string) => ({ helperName })),
      isRegistered: jest.fn(() => false),
      register: jest.fn()
    };
    const serviceRegistry = {
      getService: jest.fn((name: string) => (name === "sassCompiler" ? { service: name } : undefined))
    };
    const config = new LocalDependencyLoaderConfig({ overrides, helperRegistry });
    const loader = new LocalDependencyLoader(config);

    const dependencies = loader.initialize(serviceRegistry as any);

    expect(dependencies.logging).toBe(overrides.logging);
    expect(dependencies.dynamicModules).toBe(overrides.dynamicModules);
    expect(dependencies.sassCompiler).toBe(serviceRegistry.getService("sassCompiler"));
    expect(dependencies.tsxCompiler).toEqual({ helperName: "tsxCompiler" });
    expect(helperRegistry.getHelper).toHaveBeenCalledWith("tsxCompiler");
    expect(helperRegistry.register).toHaveBeenCalledWith(
      "localDependencyLoader",
      loader,
      expect.objectContaining({ folder: "services/local", domain: "local" })
    );
    expect(config.helpers).toBe(dependencies);
  });
});
