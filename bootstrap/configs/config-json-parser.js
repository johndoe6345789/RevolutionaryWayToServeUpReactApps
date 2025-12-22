const { getStringService } = require('../services/string-service.js');

const strings = getStringService();

/**
 * Configuration parser for integrating config.json with factory system.
 * Parses config.json sections into typed configuration objects.
 */

/**
 * Parses config.json and creates typed configuration objects for factories.
 */
class ConfigJsonParser {
  /**
   * Initializes a new ConfigJsonParser instance with the provided configuration.
   */
  constructor(configJson = {}) {
    this.configJson = configJson;
  }

  /**
   * Validates that the configuration is properly set up.
   * @throws Error if configuration is invalid
   */
  validate() {
    if (typeof this.configJson !== 'object' || this.configJson === null) {
      throw new Error(strings.getError('configjson_must_be_a_valid_object'));
    }
  }

  /**
   * Merges additional configuration properties into this instance.
   * @param additional - Additional configuration to merge
   * @returns A new configuration instance with merged properties
   */
  merge(additional) {
    return new ConfigJsonParser({
      ...this.configJson,
      ...additional,
    });
  }

  /**
   * Serializes the configuration to a plain object.
   * @returns The configuration as a plain object
   */
  toObject() {
    return this.configJson;
  }

  /**
   * Creates NetworkProviderServiceConfig from config.json providers section.
   */
  createNetworkProviderConfig() {
    const { providers, fallbackProviders } = this.configJson;
    
    return {
      defaultProvider: providers?.default || 'https://unpkg.com',
      fallbackProviders: fallbackProviders || ['https://cdn.skypack.dev/', 'https://jspm.dev/'],
      providerAliases: providers?.aliases || {},
      enableCaching: true,
      cacheTimeout: 3600000, // 1 hour
    };
  }

  /**
   * Creates tool configurations for compilation services.
   */
  createToolConfigs() {
    const { tools = [] } = this.configJson;
    
    return tools.reduce((configs, tool) => {
      configs[tool.name] = {
        name: tool.name,
        ciProvider: tool.ci_provider,
        productionProvider: tool.production_provider,
        version: tool.version,
        pathPrefix: tool.pathPrefix,
        file: tool.file,
        global: tool.global,
      };
      return configs;
    }, {});
  }

  /**
   * Creates module configurations for module loading.
   */
  createModuleConfigs() {
    const { modules = [], dynamicModules = [] } = this.configJson;
    
    return {
      staticModules: modules.map(module => ({
        name: module.name,
        package: module.package,
        version: module.version,
        pathPrefix: module.pathPrefix,
        file: module.file,
        global: module.global,
        format: module.format,
        importSpecifiers: module.importSpecifiers,
        ciProvider: module.ci_provider,
        productionProvider: module.production_provider,
      })),
      dynamicModules: dynamicModules.map(module => ({
        prefix: module.prefix,
        package: module.package,
        version: module.version,
        pathPrefix: module.pathPrefix,
        filePattern: module.filePattern,
        format: module.format,
        provider: module.provider,
        ciProvider: module.ci_provider,
        productionProvider: module.production_provider,
      })),
    };
  }

  /**
   * Creates server configuration from config.json server section.
   */
  createServerConfig() {
    const { server = {} } = this.configJson;
    
    return {
      host: server.host || '0.0.0.0',
      port: server.port || 4173,
      logFile: server.logFile || 'server.log',
      jsonLimit: server.jsonLimit || '1mb',
      cacheControl: server.cacheControl || 'no-store, no-cache, must-revalidate',
      paths: server.paths || {},
      logTruncateLength: server.logTruncateLength || 4000,
    };
  }

  /**
   * Creates render configuration from config.json render section.
   */
  createRenderConfig() {
    const { render = {} } = this.configJson;
    
    return {
      rootId: render.rootId || 'root',
      domModule: render.domModule || 'react-dom/client',
      reactModule: render.reactModule || 'react',
      createRoot: render.createRoot || 'createRoot',
      renderMethod: render.renderMethod || 'render',
    };
  }

  /**
   * Creates complete factory configuration from config.json.
   */
  createCompleteFactoryConfig() {
    return {
      networkProvider: this.createNetworkProviderConfig(),
      tools: this.createToolConfigs(),
      modules: this.createModuleConfigs(),
      server: this.createServerConfig(),
      render: this.createRenderConfig(),
    };
  }
}

module.exports = ConfigJsonParser;
