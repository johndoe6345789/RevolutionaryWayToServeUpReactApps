import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group14Files = [
  "linkSrcNodeModules.js",
  "local-paths.test.ts",
  "proxy-mode.test.ts",
  "services/base-service.d.ts",
  "services/base-service.js",
  "services/cdn/dynamic-modules-service.js",
  "services/cdn/dynamic-modules/module-fetcher-config.d.ts",
  "services/cdn/dynamic-modules/module-fetcher-config.js",
  "services/cdn/dynamic-modules/module-fetcher.d.ts",
  "services/cdn/dynamic-modules/module-fetcher.js",
  "services/cdn/dynamic-modules/provider-resolver-config.d.ts",
  "services/cdn/dynamic-modules/provider-resolver-config.js",
  "services/cdn/dynamic-modules/provider-resolver.d.ts",
  "services/cdn/dynamic-modules/provider-resolver.js",
];

describe("group 14", () => {
  test("has 14 files", () => {
    expect(group14Files).toHaveLength(14);
  });

  test.each(group14Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
