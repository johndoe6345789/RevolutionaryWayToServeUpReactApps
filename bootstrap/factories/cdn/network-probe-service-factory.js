const BaseFactory = require('../../interfaces/base-factory.js');
const NetworkProbeService = require("../../services/cdn/network-probe-service.js");
const NetworkProbeServiceConfig = require("../../configs/cdn/network-probe-service.js");

/**
 * Factory for creating NetworkProbeService instances.
 */
class NetworkProbeServiceFactory extends BaseFactory {
  /**
   * Creates a new NetworkProbeService instance with the given config.
   */
  create(config = new NetworkProbeServiceConfig()) {
    return new NetworkProbeService(config);
  }
}

module.exports = NetworkProbeServiceFactory;
