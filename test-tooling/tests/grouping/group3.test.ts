import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group3Files = [
  "bootstrap/configs/core/module-loader.test.ts",
  "bootstrap/configs/core/script-list-loader.test.ts",
  "bootstrap/configs/helpers/local-helpers.test.ts",
  "bootstrap/configs/local/local-dependency-loader.test.ts",
  "bootstrap/configs/local/local-loader.test.ts",
  "bootstrap/configs/local/local-module-loader.test.ts",
  "bootstrap/configs/local/local-paths.test.ts",
  "bootstrap/configs/local/local-require-builder.test.ts",
  "bootstrap/configs/local/sass-compiler.test.ts",
  "bootstrap/configs/local/tsx-compiler.test.ts",
  "bootstrap/constants/ci-log-query-param.test.ts",
  "bootstrap/constants/client-log-endpoint.test.ts",
  "bootstrap/constants/common.test.ts",
  "bootstrap/constants/default-fallback-providers.test.ts",
];

describe("group 3", () => {
  test("has 14 files", () => {
    expect(group3Files).toHaveLength(14);
  });

  test.each(group3Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
