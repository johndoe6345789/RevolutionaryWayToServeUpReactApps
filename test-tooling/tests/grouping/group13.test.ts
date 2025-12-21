import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group13Files = [
  "entrypoints/script-list.html",
  "global.d.ts",
  "helpers/base-helper.d.ts",
  "helpers/base-helper.js",
  "helpers/helper-registry-instance.js",
  "helpers/helper-registry.d.ts",
  "helpers/helper-registry.js",
  "helpers/local-helpers.js",
  "initializers/compilers/sass-compiler.js",
  "initializers/compilers/tsx-compiler.js",
  "initializers/loaders/local-loader.js",
  "initializers/loaders/local-module-loader.js",
  "initializers/path-utils/local-paths.d.ts",
  "initializers/path-utils/local-paths.js",
];

describe("group 13", () => {
  test("has 14 files", () => {
    expect(group13Files).toHaveLength(14);
  });

  test.each(group13Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
