import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group15Files = [
  "services/cdn/import-map-init-service.js",
  "services/cdn/logging-service.js",
  "services/cdn/network-service.js",
  "services/cdn/network/network-module-resolver.js",
  "services/cdn/network/network-probe-service.js",
  "services/cdn/network/network-provider-service.js",
  "services/cdn/network/provider-utils.js",
  "services/cdn/source-utils-service.js",
  "services/cdn/tools-service.js",
  "services/core/env-service.js",
  "services/core/logging-manager.js",
  "services/core/module-loader-environment.js",
  "services/core/module-loader-service.js",
  "services/core/script-list-loader-service.js",
];

describe("group 15", () => {
  test("has 14 files", () => {
    expect(group15Files).toHaveLength(14);
  });

  test.each(group15Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
