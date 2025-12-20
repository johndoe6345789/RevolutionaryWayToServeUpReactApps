/**
 * Configuration bag for overriding the built-in logging service defaults.
 */
class LoggingServiceConfig {
  constructor({ ciLogQueryParam, clientLogEndpoint } = {}) {
    this.ciLogQueryParam = ciLogQueryParam;
    this.clientLogEndpoint = clientLogEndpoint;
  }
}

module.exports = LoggingServiceConfig;
