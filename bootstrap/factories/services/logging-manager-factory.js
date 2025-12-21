const BaseFactory = require('../base-factory.js');
const LoggingManager = require('../../services/core/logging-manager.js');

/**
 * Factory for creating LoggingManager instances.
 */
class LoggingManagerFactory extends BaseFactory {
  /**
   * Creates a new LoggingManager instance with the given config.
   */
  create(config = {}) {
    return new LoggingManager(config);
  }
}

module.exports = LoggingManagerFactory;