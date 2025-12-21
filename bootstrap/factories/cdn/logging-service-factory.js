const BaseFactory = require('../../interfaces/base-factory.js');
const LoggingService = require("../../services/cdn/logging-service.js");
const LoggingServiceConfig = require("../../configs/cdn/logging-service.js");

/**
 * Factory for creating LoggingService instances.
 */
class LoggingServiceFactory extends BaseFactory {
  /**
   * Creates a new LoggingService instance with the provided configuration.
   */
  create(config = new LoggingServiceConfig()) {
    return new LoggingService(config);
  }
}

module.exports = LoggingServiceFactory;
