const ImportMapInitConfig = require("../../../../../bootstrap/configs/cdn/import-map-init.js");

describe("bootstrap/configs/cdn/import-map-init.js", () => {
  it("defaults to undefined runtime globals", () => {
    const config = new ImportMapInitConfig();
    expect(config.window).toBeUndefined();
    expect(config.fetch).toBeUndefined();
  });

  it("stores provided window and fetch references", () => {
    const windowRef = { document: {} };
    const fetchRef = jest.fn();
    const config = new ImportMapInitConfig({ window: windowRef, fetch: fetchRef });

    expect(config.window).toBe(windowRef);
    expect(config.fetch).toBe(fetchRef);
  });
});
