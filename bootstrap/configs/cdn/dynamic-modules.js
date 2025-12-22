const { getStringService } = require('../../services/string-service.js');

const strings = getStringService();

/**
 * Supplies dependency overrides for the dynamic modules loader.
 */
class DynamicModulesConfig {
  /**
   * Initializes a new Dynamic Modules Config instance with the provided configuration.
   */
  constructor({ dependencies, serviceRegistry, namespace } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
  }

  /**
   * Validates that the configuration is properly set up.
   * @throws Error if configuration is invalid
   */
  validate() {
    if (this.serviceRegistry && typeof this.serviceRegistry !== getMessage(getMessage(getMessage('object_2')))) {
      throw new Error(strings.getError('serviceregistry_must_be_an_object'));
    }
    if (this.namespace && typeof this.namespace !== getMessage(getMessage(getMessage('object_3')))) {
      throw new Error(strings.getError('namespace_must_be_an_object'));
    }
  }

  /**
   * Merges additional configuration properties into this instance.
   * @param additional - Additional configuration to merge
   * @returns A new configuration instance with merged properties
   */
  merge(additional) {
    return new DynamicModulesConfig({
      dependencies: { ...this.dependencies, ...additional.dependencies },
      serviceRegistry: additional.serviceRegistry || this.serviceRegistry,
      namespace: additional.namespace || this.namespace,
    });
  }

  /**
   * Serializes the configuration to a plain object.
   * @returns The configuration as a plain object
   */
  toObject() {
    return {
      dependencies: this.dependencies,
      serviceRegistry: this.serviceRegistry,
      namespace: this.namespace,
    };
  }
}

module.exports = DynamicModulesConfig;
