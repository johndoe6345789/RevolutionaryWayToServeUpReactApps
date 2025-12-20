/**
 * Holds runtime overrides for how CDN tools are loaded and named.
 */
class ToolsLoaderConfig {
  constructor({ dependencies, serviceRegistry } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = ToolsLoaderConfig;
