/**
 * Configuration for LoggingService instances.
 * Provides logging client settings and endpoint configuration.
 */
class LoggingServiceConfig {
  /**
   * Initializes a new Logging Service Config instance with the provided configuration.
   */
  constructor({
    logEndpoint,
    logClient,
    serializeForLog,
    batchSize = 10,
    flushInterval = 5000,
    enableConsole = true,
  } = {}) {
    this.logEndpoint = logEndpoint;
    this.logClient = logClient;
    this.serializeForLog = serializeForLog;
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.enableConsole = enableConsole;
  }
}

module.exports = LoggingServiceConfig;
