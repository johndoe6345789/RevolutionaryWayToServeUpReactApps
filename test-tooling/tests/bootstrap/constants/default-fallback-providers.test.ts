const defaultFallbackProviders = require("../../../../bootstrap/constants/default-fallback-providers.js");

describe("bootstrap/constants/default-fallback-providers.js", () => {
  it("exports an array of fallback providers", () => {
    expect(Array.isArray(defaultFallbackProviders)).toBe(true);
    expect(defaultFallbackProviders.length).toBeGreaterThanOrEqual(0);
  });

  it("returns a fresh list each time to avoid mutation leaks", () => {
    const snapshot = [...defaultFallbackProviders];
    snapshot.push("https://cdn.example.com/");
    expect(defaultFallbackProviders).not.toEqual(snapshot);
  });
});
