import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group2Files = [
  "bootstrap/cdn/source-utils.test.ts",
  "bootstrap/cdn/tools.test.ts",
  "bootstrap/configs/cdn/dynamic-modules.test.ts",
  "bootstrap/configs/cdn/import-map-init.test.ts",
  "bootstrap/configs/cdn/logging-service.test.ts",
  "bootstrap/configs/cdn/network-module-resolver.test.ts",
  "bootstrap/configs/cdn/network-probe-service.test.ts",
  "bootstrap/configs/cdn/network-provider-service.test.ts",
  "bootstrap/configs/cdn/network-service.test.ts",
  "bootstrap/configs/cdn/source-utils.test.ts",
  "bootstrap/configs/cdn/tools.test.ts",
  "bootstrap/configs/core/bootstrapper.test.ts",
  "bootstrap/configs/core/env.test.ts",
  "bootstrap/configs/core/logging-manager.test.ts",
];

describe("group 2", () => {
  test("has 14 files", () => {
    expect(group2Files).toHaveLength(14);
  });

  test.each(group2Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
