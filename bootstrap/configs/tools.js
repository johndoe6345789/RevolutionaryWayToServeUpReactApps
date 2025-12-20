/**
 * Holds runtime overrides for how CDN tools are loaded and named.
 */
class ToolsLoaderConfig {
  constructor({ dependencies, serviceRegistry, namespace } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
  }
}

module.exports = ToolsLoaderConfig;
