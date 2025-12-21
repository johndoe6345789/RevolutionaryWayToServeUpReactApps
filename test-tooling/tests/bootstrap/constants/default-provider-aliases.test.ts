const getDefaultProviderAliases = require("../../../../bootstrap/constants/default-provider-aliases.js");
const config = require("../../../../config.json");

describe("bootstrap/constants/default-provider-aliases.js", () => {
  it("reads aliases from config when running in CommonJS mode", () => {
    const aliases = getDefaultProviderAliases(null, true);
    expect(aliases).toEqual(config.providers.aliases);
  });

  it("falls back to the global root config when provided", () => {
    const globalRoot = {
      __rwtraConfig: {
        providers: {
          aliases: { custom: "https://example.com/" },
        },
      },
    };
    const aliases = getDefaultProviderAliases(globalRoot, false);
    expect(aliases.custom).toBe("https://example.com/");
  });

  it("returns an empty object when no aliases are configured", () => {
    expect(getDefaultProviderAliases({}, false)).toEqual({});
  });
});
