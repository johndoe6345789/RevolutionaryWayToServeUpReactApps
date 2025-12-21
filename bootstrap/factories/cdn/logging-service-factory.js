const BaseFactory = require("./base-factory.js");
const LoggingService = require("../../services/cdn/logging-service.js");

/**
 * Factory for creating LoggingService instances.
 */
class LoggingServiceFactory extends BaseFactory {
  /**
   * Creates a new LoggingService instance with the provided configuration.
   */
  create(config = {}) {
    return new LoggingService(config);
  }
}

module.exports = LoggingServiceFactory;