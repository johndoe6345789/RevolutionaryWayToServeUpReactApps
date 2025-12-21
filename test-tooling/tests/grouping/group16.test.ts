import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group16Files = [
  "services/local/framework-renderer.js",
  "services/local/local-dependency-loader.js",
  "services/local/local-loader-service.js",
  "services/local/local-module-loader-service.js",
  "services/local/local-paths-service.js",
  "services/local/local-require-builder.js",
  "services/local/sass-compiler-service.js",
  "services/local/tsx-compiler-service.js",
  "services/service-registry-instance.js",
  "services/service-registry.d.ts",
  "services/service-registry.js",
  "setupBun.ts",
  "setupTests.ts",
  "testGlobals.ts",
];

describe("group 16", () => {
  test("has 14 files", () => {
    expect(group16Files).toHaveLength(14);
  });

  test.each(group16Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
