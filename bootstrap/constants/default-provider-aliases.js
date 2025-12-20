module.exports = function getDefaultProviderAliases(globalRoot, isCommonJs) {
  try {
    if (isCommonJs) {
      const cfg = require("../../config.json");
      return (cfg && cfg.providers && cfg.providers.aliases) || {};
    }
    if (
      globalRoot &&
      globalRoot.__rwtraConfig &&
      globalRoot.__rwtraConfig.providers &&
      globalRoot.__rwtraConfig.providers.aliases
    ) {
      return globalRoot.__rwtraConfig.providers.aliases;
    }
  } catch (err) {
    // Swallow errors when loading default aliases; an empty alias map is acceptable.
  }
  return {};
};
