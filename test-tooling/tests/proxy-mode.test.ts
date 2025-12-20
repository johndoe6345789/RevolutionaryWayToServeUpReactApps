// @ts-expect-error - CDN helpers are plain JS without type declarations
import { resolveProvider } from "../../bootstrap/cdn/network.js";

describe("proxy mode overrides", () => {
  const originalEnv = process.env.RWTRA_PROXY_MODE;
  const originalGlobal = (global as any).__RWTRA_PROXY_MODE__;

  afterEach(() => {
    process.env.RWTRA_PROXY_MODE = originalEnv;
    (global as any).__RWTRA_PROXY_MODE__ = originalGlobal;
  });

  it("forces ci providers when proxy mode is set to proxy", () => {
    process.env.RWTRA_PROXY_MODE = "proxy";
    expect(
      resolveProvider({
        ci_provider: "/proxy/unpkg/",
        production_provider: "https://unpkg.com/"
      })
    ).toBe("/proxy/unpkg/");
  });

  it("forces production providers when proxy mode is direct", () => {
    process.env.RWTRA_PROXY_MODE = "direct";
    (global as any).__RWTRA_PROXY_MODE__ = undefined;

    expect(
      resolveProvider({
        ci_provider: "/proxy/unpkg/",
        production_provider: "https://unpkg.com/"
      })
    ).toBe("https://unpkg.com/");
  });

  it("prefers global override over environment variables", () => {
    process.env.RWTRA_PROXY_MODE = "proxy";
    (global as any).__RWTRA_PROXY_MODE__ = "direct";

    expect(
      resolveProvider({
        ci_provider: "/proxy/unpkg/",
        production_provider: "https://unpkg.com/"
      })
    ).toBe("https://unpkg.com/");
  });
});
