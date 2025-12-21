const {
  normalizeProviderBaseRawValue,
  createAliasMap,
} = require("../../../../../bootstrap/services/cdn/network/provider-utils.js");

describe("bootstrap/services/cdn/network/provider-utils.js", () => {
  describe("normalizeProviderBaseRawValue", () => {
    test("returns empty string for falsy values", () => {
      expect(normalizeProviderBaseRawValue("")).toBe("");
      expect(normalizeProviderBaseRawValue(null)).toBe("");
    });

    test("normalizes absolute paths with trailing slash", () => {
      expect(normalizeProviderBaseRawValue("/assets")).toBe("/assets/");
      expect(normalizeProviderBaseRawValue("/assets/")).toBe("/assets/");
    });

    test("preserves full URLs and enforces trailing slash", () => {
      expect(normalizeProviderBaseRawValue("https://cdn.example")).toBe(
        "https://cdn.example/"
      );
      expect(normalizeProviderBaseRawValue("http://cdn.example/")).toBe(
        "http://cdn.example/"
      );
    });

    test("expands hostnames into https URLs", () => {
      expect(normalizeProviderBaseRawValue("cdn.example.com")).toBe(
        "https://cdn.example.com/"
      );
      expect(normalizeProviderBaseRawValue("cdn.example.com/")).toBe(
        "https://cdn.example.com/"
      );
    });
  });

  describe("createAliasMap", () => {
    test("returns an empty map for invalid sources", () => {
      expect(createAliasMap()).toEqual(new Map());
      expect(createAliasMap(null)).toEqual(new Map());
      expect(createAliasMap("invalid")).toEqual(new Map());
    });

    test("builds a map of normalized alias values", () => {
      const map = createAliasMap({
        cdn: "cdn.example.com",
        assets: "/assets",
      });

      expect(map.get("cdn")).toBe("https://cdn.example.com/");
      expect(map.get("assets")).toBe("/assets/");
    });

    test("skips empty alias keys or values", () => {
      const map = createAliasMap({ "": "cdn.example.com", keep: "" });
      expect(map.size).toBe(0);
    });
  });
});
