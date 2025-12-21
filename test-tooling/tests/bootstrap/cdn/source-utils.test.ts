const SourceUtilsService = require("../../../../bootstrap/services/cdn/source-utils-service.js");

// Mock the dependencies
jest.mock("../../../../bootstrap/configs/cdn/source-utils.js", () => {
  return jest.fn().mockImplementation(() => ({}));
});

describe("bootstrap/services/cdn/source-utils-service.js", () => {
  let service;
  let mockNamespace;
  let mockServiceRegistry;
  const dynamicRules = [{ prefix: "@app/" }];

  beforeEach(() => {
    mockNamespace = { helpers: {} };
    mockServiceRegistry = { register: jest.fn() };

    service = new SourceUtilsService({
      namespace: mockNamespace,
      serviceRegistry: mockServiceRegistry
    });
    service.initialize();
  });

  it("collects dynamic module specifiers that match configured rules", () => {
    const source = `
      import Button from "@app/Button";
      const icon = require("@app/Icon");
      const other = require("external");
    `;
    const imports = service.collectDynamicModuleImports(source, { dynamicModules: dynamicRules });
    expect(imports).toContain("@app/Button");
    expect(imports).toContain("@app/Icon");
    expect(imports).not.toContain("external");
  });

  it("preloads dynamic modules using the async require helper", async () => {
    const requireFn = {
      _async: jest.fn(() => Promise.resolve({ default: true })),
    };
    await expect(
      service.preloadDynamicModulesFromSource(
        'import "@app/Icon";',
        requireFn,
        { dynamicModules: dynamicRules }
      )
    ).resolves.toBeUndefined();
    expect(requireFn._async).toHaveBeenCalledWith("@app/Icon");
  });

  it("collects every module specifier from imports and requires", () => {
    const source = `
      import { helper } from "helpers/simple";
      const loader = require("loader");
    `;
    const specs = service.collectModuleSpecifiers(source);
    expect(specs).toContain("helpers/simple");
    expect(specs).toContain("loader");
  });

  it("preloads modules and surfaces failures with descriptive errors", async () => {
    const requireFn = {
      _async: jest.fn((name) => (name === "bad" ? Promise.reject(new Error("boom")) : Promise.resolve(name))),
    };
    await expect(
      service.preloadModulesFromSource("import bad from \"bad\";", requireFn)
    ).rejects.toThrow(/bad/);
  });
});
