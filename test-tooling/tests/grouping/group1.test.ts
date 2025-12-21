import fs from "fs";
import path from "path";

const testsDir = path.resolve(__dirname, "..");

const group1Files = [
  "App.test.tsx",
  "base-bootstrap-app.d.ts",
  "base-bootstrap-app.js",
  "bootstrap-app.d.ts",
  "bootstrap-app.js",
  "bootstrap.cdn.test.ts",
  "bootstrap.require-default.test.ts",
  "bootstrap.test.ts",
  "bootstrap/base-bootstrap-app.test.ts",
  "bootstrap/bootstrap-app.test.ts",
  "bootstrap/cdn/dynamic-modules.test.ts",
  "bootstrap/cdn/import-map-init.test.ts",
  "bootstrap/cdn/logging.test.ts",
  "bootstrap/cdn/network-entrypoint.test.ts",
  "bootstrap/cdn/network.test.ts",
];

describe("group 1", () => {
  test("has 15 files", () => {
    expect(group1Files).toHaveLength(15);
  });

  test.each(group1Files)("contains %s", (relativePath) => {
    const resolved = path.join(testsDir, relativePath);
    expect(fs.existsSync(resolved)).toBe(true);
    expect(fs.statSync(resolved).size).toBeGreaterThan(0);
  });
});
