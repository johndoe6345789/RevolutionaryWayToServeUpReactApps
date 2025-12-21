/**
 * Holds runtime overrides for how CDN tools are loaded and named.
 */
class ToolsLoaderConfig {
  /**
   * Initializes a new Tools Loader Config instance with the provided configuration.
   */
  constructor({ dependencies, serviceRegistry, namespace } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
  }
}

module.exports = ToolsLoaderConfig;
