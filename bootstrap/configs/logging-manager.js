/**
 * Holds the logging hooks injected into the logging manager.
 */
class LoggingManagerConfig {
  constructor({ logClient, serializeForLog, serviceRegistry } = {}) {
    this.logClient = logClient;
    this.serializeForLog = serializeForLog;
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = LoggingManagerConfig;
