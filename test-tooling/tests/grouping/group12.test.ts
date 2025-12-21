import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group12Files = [
  "constants/proxy-mode-auto.js",
  "constants/proxy-mode-direct.js",
  "constants/proxy-mode-proxy.js",
  "constants/script-manifest-url.js",
  "controllers/base-controller.d.ts",
  "controllers/base-controller.js",
  "controllers/bootstrapper.d.ts",
  "controllers/bootstrapper.js",
  "data.test.ts",
  "entrypoints/base-entrypoint.d.ts",
  "entrypoints/base-entrypoint.js",
  "entrypoints/env.js",
  "entrypoints/module-loader.js",
  "entrypoints/script-list-loader.js",
];

describe("group 12", () => {
  test("has 14 files", () => {
    expect(group12Files).toHaveLength(14);
  });

  test.each(group12Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
