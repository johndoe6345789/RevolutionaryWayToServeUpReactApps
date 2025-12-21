import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group9Files = [
  "configs/cdn/network-provider-service.d.ts",
  "configs/cdn/network-provider-service.js",
  "configs/cdn/network-service.d.ts",
  "configs/cdn/network-service.js",
  "configs/cdn/source-utils.d.ts",
  "configs/cdn/source-utils.js",
  "configs/cdn/tools.d.ts",
  "configs/cdn/tools.js",
  "configs/core/bootstrapper.d.ts",
  "configs/core/bootstrapper.js",
  "configs/core/env.d.ts",
  "configs/core/env.js",
  "configs/core/logging-manager.d.ts",
  "configs/core/logging-manager.js",
];

describe("group 9", () => {
  test("has 14 files", () => {
    expect(group9Files).toHaveLength(14);
  });

  test.each(group9Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
