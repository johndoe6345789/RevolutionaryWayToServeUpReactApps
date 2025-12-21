import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group4Files = [
  "bootstrap/constants/default-provider-aliases.test.ts",
  "bootstrap/constants/global-root-handler.test.ts",
  "bootstrap/constants/local-module-extensions.test.ts",
  "bootstrap/constants/proxy-mode-auto.test.ts",
  "bootstrap/constants/proxy-mode-direct.test.ts",
  "bootstrap/constants/proxy-mode-proxy.test.ts",
  "bootstrap/constants/script-manifest-url.test.ts",
  "bootstrap/controllers/base-controller.test.ts",
  "bootstrap/controllers/bootstrapper.test.ts",
  "bootstrap/entrypoints/base-entrypoint.test.ts",
  "bootstrap/entrypoints/env.test.ts",
  "bootstrap/entrypoints/module-loader.test.ts",
  "bootstrap/entrypoints/script-list-loader.test.ts",
  "bootstrap/helpers/base-helper.test.ts",
];

describe("group 4", () => {
  test("has 14 files", () => {
    expect(group4Files).toHaveLength(14);
  });

  test.each(group4Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
