import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group10Files = [
  "configs/core/module-loader.d.ts",
  "configs/core/module-loader.js",
  "configs/core/script-list-loader.d.ts",
  "configs/core/script-list-loader.js",
  "configs/helpers/local-helpers.d.ts",
  "configs/helpers/local-helpers.js",
  "configs/local/local-dependency-loader.d.ts",
  "configs/local/local-dependency-loader.js",
  "configs/local/local-loader.d.ts",
  "configs/local/local-loader.js",
  "configs/local/local-module-loader.d.ts",
  "configs/local/local-module-loader.js",
  "configs/local/local-paths.d.ts",
  "configs/local/local-paths.js",
];

describe("group 10", () => {
  test("has 14 files", () => {
    expect(group10Files).toHaveLength(14);
  });

  test.each(group10Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
