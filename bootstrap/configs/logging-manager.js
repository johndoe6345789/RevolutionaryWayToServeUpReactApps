class LoggingManagerConfig {
  constructor({ logClient, serializeForLog }) {
    this.logClient = logClient;
    this.serializeForLog = serializeForLog;
  }
}

module.exports = LoggingManagerConfig;
