const BaseFactory = require('../../interfaces/base-factory.js');
const LoggingManager = require('../../services/core/logging-manager.js');
const LoggingManagerConfig = require('../../configs/core/logging-manager.js');

/**
 * Factory for creating LoggingManager instances.
 */
class LoggingManagerFactory extends BaseFactory {
  /**
   * Creates a new LoggingManager instance with the given config.
   */
  create(config = new LoggingManagerConfig()) {
    return new LoggingManager(config);
  }
}

module.exports = LoggingManagerFactory;
