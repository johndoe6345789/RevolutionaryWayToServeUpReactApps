import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group7Files = [
  "bootstrap/services/local/framework-renderer.test.ts",
  "bootstrap/services/local/local-dependency-loader.test.ts",
  "bootstrap/services/local/local-loader-service.test.ts",
  "bootstrap/services/local/local-module-loader-service.test.ts",
  "bootstrap/services/local/local-paths-service.test.ts",
  "bootstrap/services/local/local-require-builder.test.ts",
  "bootstrap/services/local/sass-compiler-service.test.ts",
  "bootstrap/services/local/tsx-compiler-service.test.ts",
  "bootstrap/services/service-registry-instance.test.ts",
  "bootstrap/services/service-registry.test.ts",
  "cdn/dynamic-modules.js",
  "cdn/import-map-init.js",
  "cdn/logging.js",
  "cdn/network-entrypoint.js",
];

describe("group 7", () => {
  test("has 14 files", () => {
    expect(group7Files).toHaveLength(14);
  });

  test.each(group7Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
