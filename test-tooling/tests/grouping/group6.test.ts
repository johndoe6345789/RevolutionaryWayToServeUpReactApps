import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group6Files = [
  "bootstrap/services/cdn/import-map-init-service.test.ts",
  "bootstrap/services/cdn/logging-service.test.ts",
  "bootstrap/services/cdn/network-service.test.ts",
  "bootstrap/services/cdn/network/network-module-resolver.test.ts",
  "bootstrap/services/cdn/network/network-probe-service.test.ts",
  "bootstrap/services/cdn/network/network-provider-service.test.ts",
  "bootstrap/services/cdn/network/provider-utils.test.ts",
  "bootstrap/services/cdn/source-utils-service.test.ts",
  "bootstrap/services/cdn/tools-service.test.ts",
  "bootstrap/services/core/env-service.test.ts",
  "bootstrap/services/core/logging-manager.test.ts",
  "bootstrap/services/core/module-loader-environment.test.ts",
  "bootstrap/services/core/module-loader-service.test.ts",
  "bootstrap/services/core/script-list-loader-service.test.ts",
];

describe("group 6", () => {
  test("has 14 files", () => {
    expect(group6Files).toHaveLength(14);
  });

  test.each(group6Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
