/**
 * Unit tests for the CDN bootstrap helpers.
 */

export {};

declare global {
  var __RWTRA_BOOTSTRAP_TEST_MODE__: boolean | undefined;
  interface Window {
    __RWTRA_BOOTSTRAP_TEST_MODE__?: boolean;
  }
}
(globalThis as unknown as { __RWTRA_BOOTSTRAP_TEST_MODE__?: boolean }).__RWTRA_BOOTSTRAP_TEST_MODE__ = true;
if (typeof window !== "undefined") {
  (window as Window & { __RWTRA_BOOTSTRAP_TEST_MODE__?: boolean }).__RWTRA_BOOTSTRAP_TEST_MODE__ = true;
}

import {
  normalizeProviderBase,
  resolveModuleUrl,
  collectModuleSpecifiers,
  collectDynamicModuleImports,
  createRequire,
  preloadModulesFromSource
} from "../../bootstrap.js";
import { resolveLocalModuleBase } from "../../bootstrap/local/local-paths.js";

describe("bootstrap helpers", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("normalizes provider bases", () => {
    expect(normalizeProviderBase()).toBe("");
    expect(normalizeProviderBase("unpkg")).toBe("https://unpkg.com/");
    expect(normalizeProviderBase("unpkg.com")).toBe("https://unpkg.com/");
    expect(normalizeProviderBase("https://cdn.example.com/path")).toBe("https://cdn.example.com/path/");
    expect(normalizeProviderBase("http://cdn.example.com")).toBe("http://cdn.example.com/");
    expect(normalizeProviderBase("cdn.example.com")).toBe("https://cdn.example.com/");
    expect(normalizeProviderBase("cdn.example.com/")).toBe("https://cdn.example.com/");
  });

  it("collects module specifiers from ES and CommonJS imports", () => {
    const source = `
      import React from "react";
      import type { Styled } from "@mui/material/styles";
      import "./global.css";
      const icon = require("@mui/icons-material/Add");
    `;

    expect(collectModuleSpecifiers(source)).toEqual([
      "react",
      "@mui/material/styles",
      "./global.css",
      "@mui/icons-material/Add"
    ]);
  });

  it("only returns dynamic specifiers that match configured prefixes", () => {
    const config = {
      dynamicModules: [
        { prefix: "@mui/icons-material/" },
        { prefix: "@mui/material/" }
      ]
    };
    const source = `
      import AddIcon from "@mui/icons-material/Add";
      const button = require("@mui/material/Button");
      import { styled } from "@mui/material/styles";
      import _ from "lodash";
    `;

    const dynamicSpecifiers = collectDynamicModuleImports(source, config);
    expect(dynamicSpecifiers.sort()).toEqual([
      "@mui/icons-material/Add",
      "@mui/material/Button",
      "@mui/material/styles"
    ]);
  });

  it("resolves candidate URLs by probing with HEAD requests", async () => {
    const expectedUrl = "https://cdn.example.com/pkg@1.2.3/lib/index.js";
    const fetchCalls: Array<{ url: string; method?: string }> = [];
    if (typeof (globalThis as any).fetch !== "function") {
      (globalThis as any).fetch = jest.fn();
    }
    const fetchSpy = jest
      .spyOn(globalThis as any, "fetch")
      .mockImplementation((input, options) => {
        const requestInfo = input as RequestInfo;
        const url =
          typeof requestInfo === "string"
            ? requestInfo
            : requestInfo instanceof Request
            ? requestInfo.url
            : String(requestInfo);
        const requestInit = options as RequestInit | undefined;
        fetchCalls.push({ url, method: requestInit?.method });
        return Promise.resolve({ ok: url === expectedUrl });
      });

    await expect(
      resolveModuleUrl({ name: "pkg", provider: "cdn.example.com", version: "1.2.3", file: "/lib/index.js" })
    ).resolves.toBe(expectedUrl);

    expect(fetchCalls.length).toBeGreaterThanOrEqual(1);
    expect(fetchCalls[0]).toMatchObject({ url: expectedUrl, method: "HEAD" });
    fetchSpy.mockRestore();
  });

  it("createRequire returns preloaded modules and defers dynamic ones", async () => {
    const registry = { react: { default: {} } };
    const config = { dynamicModules: [{ prefix: "icons/" }] } as const;
    const requireFn = createRequire(registry as any, config as any);

    expect(requireFn("react")).toBe(registry.react);
    await expect(requireFn._async("missing")).rejects.toThrow("Module not registered: missing");

    const dynamicModule = { default: { name: "icons" } };
    const dynamicLoader = jest.fn(async (name: string, _cfg: unknown, reg: Record<string, unknown>) => {
      reg[name] = dynamicModule;
      return dynamicModule;
    });
    const dynamicRequire = createRequire(registry as any, config as any, dynamicLoader);

    await expect(dynamicRequire._async("icons/test")).resolves.toBe(dynamicModule);
    expect(dynamicLoader).toHaveBeenCalledWith("icons/test", config as any, registry as any);
  });

  it("fails fast when any preload promise rejects", async () => {
    const source = `
      import "./ok";
      const mod = require("./fail");
    `;

    const calls: Array<{ name: string; baseDir?: string }> = [];
    const requireFn: any = () => {
      throw new Error("sync require should not be called during preload");
    };
    requireFn._async = jest.fn((name: string, baseDir?: string) => {
      calls.push({ name, baseDir });
      if (name === "./fail") {
        return Promise.reject(new Error("boom"));
      }
      return Promise.resolve({ ok: true });
    });

    await expect(
      preloadModulesFromSource(source, requireFn as any, "src/components")
    ).rejects.toThrow(
      "Failed to preload module(s): ./fail: boom. Check file paths and dynamic module rules."
    );

    expect(requireFn._async).toHaveBeenCalledTimes(2);
    expect(calls.every((call) => call.baseDir === "src/components")).toBe(true);
  });
});

describe("local path helpers", () => {
  it("resolves module bases relative to the current page location", () => {
    expect(
      resolveLocalModuleBase(
        "./theme",
        "src",
        "https://example.com/nested/app/index.html"
      )
    ).toBe("nested/app/src/theme");
  });
});
