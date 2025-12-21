/**
 * Holds the logging hooks injected into the logging manager.
 */
class LoggingManagerConfig {
  /**
   * Initializes a new Logging Manager Config instance with the provided configuration.
   */
  constructor({ logClient, serializeForLog, serviceRegistry } = {}) {
    this.logClient = logClient;
    this.serializeForLog = serializeForLog;
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = LoggingManagerConfig;
