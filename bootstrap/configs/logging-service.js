/**
 * Configuration bag for overriding the built-in logging service defaults.
 */
class LoggingServiceConfig {
  constructor({ ciLogQueryParam, clientLogEndpoint, serviceRegistry } = {}) {
    this.ciLogQueryParam = ciLogQueryParam;
    this.clientLogEndpoint = clientLogEndpoint;
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = LoggingServiceConfig;
