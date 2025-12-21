import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group11Files = [
  "configs/local/local-require-builder.d.ts",
  "configs/local/local-require-builder.js",
  "configs/local/sass-compiler.d.ts",
  "configs/local/sass-compiler.js",
  "configs/local/tsx-compiler.d.ts",
  "configs/local/tsx-compiler.js",
  "constants/ci-log-query-param.js",
  "constants/client-log-endpoint.js",
  "constants/common.js",
  "constants/default-fallback-providers.js",
  "constants/default-provider-aliases.js",
  "constants/global-root-handler.d.ts",
  "constants/global-root-handler.js",
  "constants/local-module-extensions.js",
];

describe("group 11", () => {
  test("has 14 files", () => {
    expect(group11Files).toHaveLength(14);
  });

  test.each(group11Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
