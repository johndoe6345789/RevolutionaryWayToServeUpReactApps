/**
 * Holds the logging hooks injected into the logging manager.
 */
class LoggingManagerConfig {
  constructor({ logClient, serializeForLog }) {
    this.logClient = logClient;
    this.serializeForLog = serializeForLog;
  }
}

module.exports = LoggingManagerConfig;
