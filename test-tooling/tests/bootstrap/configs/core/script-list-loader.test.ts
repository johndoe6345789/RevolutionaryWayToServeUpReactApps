const GlobalRootHandler = require("../../../../../bootstrap/constants/global-root-handler.js");
const { scriptManifestUrl: SCRIPT_MANIFEST_URL } = require("../../../../../bootstrap/constants/common.js");
const ScriptListLoaderConfig = require("../../../../../bootstrap/configs/core/script-list-loader.js");

describe("bootstrap/configs/core/script-list-loader.js", () => {
  it("honors explicit overrides for document, fetch, and logging", () => {
    const document = { querySelector: jest.fn() };
    const fetch = jest.fn();
    const log = jest.fn();
    const rootHandler = {
      getDocument: () => ({ root: true }),
      getFetch: () => () => {},
      getLogger: () => log,
    };

    const config = new ScriptListLoaderConfig({
      document,
      manifestUrl: "/custom/manifest.json",
      fetch,
      log,
      rootHandler,
    });

    expect(config.document).toBe(document);
    expect(config.manifestUrl).toBe("/custom/manifest.json");
    expect(config.fetch).toBe(fetch);
    expect(config.log).toBe(log);
    expect(config.rootHandler).toBe(rootHandler);
  });

  it("uses the provided root handler to fill in default helpers", () => {
    const stubDocument = { head: {} };
    const stubFetch = jest.fn();
    const stubLogger = jest.fn();
    const stubRootHandler = {
      getDocument: () => stubDocument,
      getFetch: () => stubFetch,
      getLogger: () => stubLogger,
    };

    const config = new ScriptListLoaderConfig({
      rootHandler: stubRootHandler,
    });

    expect(config.document).toBe(stubDocument);
    expect(config.fetch).toBe(stubFetch);
    expect(config.log).toBe(stubLogger);
    expect(config.rootHandler).toBe(stubRootHandler);
    expect(config.manifestUrl).toContain("script-list.html");
  });

  it("falls back to the default GlobalRootHandler when none is provided", () => {
    const config = new ScriptListLoaderConfig();
    expect(config.rootHandler).toBeInstanceOf(GlobalRootHandler);
    expect(config.manifestUrl).toBe(SCRIPT_MANIFEST_URL);
  });
});
