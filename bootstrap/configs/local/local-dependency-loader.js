/**
 * Configures how LocalDependencyLoader resolves helper modules.
 */
class LocalDependencyLoaderConfig {
  constructor({
    overrides = {},
    helpers = {},
    helperRegistry = null,
    isCommonJs = false,
  } = {}) {
    this.overrides = overrides;
    this.helpers = helpers;
    this.helperRegistry = helperRegistry;
    this.isCommonJs = isCommonJs;
  }
}

module.exports = LocalDependencyLoaderConfig;
