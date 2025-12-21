import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group8Files = [
  "cdn/network.js",
  "cdn/source-utils.js",
  "cdn/tools.js",
  "components.test.tsx",
  "configs/cdn/dynamic-modules.d.ts",
  "configs/cdn/dynamic-modules.js",
  "configs/cdn/import-map-init.d.ts",
  "configs/cdn/import-map-init.js",
  "configs/cdn/logging-service.d.ts",
  "configs/cdn/logging-service.js",
  "configs/cdn/network-module-resolver.d.ts",
  "configs/cdn/network-module-resolver.js",
  "configs/cdn/network-probe-service.d.ts",
  "configs/cdn/network-probe-service.js",
];

describe("group 8", () => {
  test("has 14 files", () => {
    expect(group8Files).toHaveLength(14);
  });

  test.each(group8Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
