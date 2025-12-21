import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group5Files = [
  "bootstrap/helpers/helper-registry-instance.test.ts",
  "bootstrap/helpers/helper-registry.test.ts",
  "bootstrap/helpers/local-helpers.test.ts",
  "bootstrap/initializers/compilers/sass-compiler.test.ts",
  "bootstrap/initializers/compilers/tsx-compiler.test.ts",
  "bootstrap/initializers/loaders/local-loader.test.ts",
  "bootstrap/initializers/loaders/local-module-loader.test.ts",
  "bootstrap/initializers/path-utils/local-paths.test.ts",
  "bootstrap/services/base-service.test.ts",
  "bootstrap/services/cdn/dynamic-modules-service.test.ts",
  "bootstrap/services/cdn/dynamic-modules/module-fetcher-config.test.ts",
  "bootstrap/services/cdn/dynamic-modules/module-fetcher.test.ts",
  "bootstrap/services/cdn/dynamic-modules/provider-resolver-config.test.ts",
  "bootstrap/services/cdn/dynamic-modules/provider-resolver.test.ts",
];

describe("group 5", () => {
  test("has 14 files", () => {
    expect(group5Files).toHaveLength(14);
  });

  test.each(group5Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
