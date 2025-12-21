/**
 * Configuration bag for overriding the built-in logging service defaults.
 */
class LoggingServiceConfig {
  /**
   * Initializes a new Logging Service Config instance with the provided configuration.
   */
  constructor({ ciLogQueryParam, clientLogEndpoint, serviceRegistry, namespace } = {}) {
    this.ciLogQueryParam = ciLogQueryParam;
    this.clientLogEndpoint = clientLogEndpoint;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
  }
}

module.exports = LoggingServiceConfig;
