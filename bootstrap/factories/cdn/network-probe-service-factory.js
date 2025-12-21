const BaseFactory = require("../registries/base-factory.js");
const NetworkProbeService = require("../services/cdn/network/network-probe-service.js");

/**
 * Factory for creating NetworkProbeService instances.
 */
class NetworkProbeServiceFactory extends BaseFactory {
  /**
   * Creates a new NetworkProbeService instance with the provided configuration.
   */
  create(config = {}) {
    return new NetworkProbeService(config);
  }
}

module.exports = NetworkProbeServiceFactory;