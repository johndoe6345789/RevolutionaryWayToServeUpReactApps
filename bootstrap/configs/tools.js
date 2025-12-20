/**
 * Holds runtime overrides for how CDN tools are loaded and named.
 */
class ToolsLoaderConfig {
  constructor({ dependencies } = {}) {
    this.dependencies = dependencies;
  }
}

module.exports = ToolsLoaderConfig;
