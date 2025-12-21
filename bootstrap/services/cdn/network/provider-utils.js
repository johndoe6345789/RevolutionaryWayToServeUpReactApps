/**
 * Normalize Provider Base Raw Value for network helpers.
 */
function normalizeProviderBaseRawValue(provider) {
  if (!provider) return "";
  if (provider.startsWith("/")) {
    return provider.endsWith("/") ? provider : provider + "/";
  }
  if (provider.startsWith("http://") || provider.startsWith("https://")) {
    return provider.endsWith("/") ? provider : provider + "/";
  }
  return "https://" + provider.replace(/\/+$/, "") + "/";
}

/**
 * Create an alias map for providers.
 */
function createAliasMap(source) {
  const map = new Map();
  if (source && typeof source === "object") {
    for (const [alias, value] of Object.entries(source)) {
      if (!alias) continue;
      const normalized = normalizeProviderBaseRawValue(value);
      if (normalized) {
        map.set(alias, normalized);
      }
    }
  }
  return map;
}

module.exports = {
  normalizeProviderBaseRawValue,
  createAliasMap,
};
