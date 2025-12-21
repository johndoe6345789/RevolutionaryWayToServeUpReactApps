const BaseFactory = require('../../interfaces/base-factory.js');
const NetworkProviderService = require("../../services/cdn/network-provider-service.js");
const NetworkProviderServiceConfig = require("../../configs/cdn/network-provider-service.js");

/**
 * Factory for creating NetworkProviderService instances.
 */
class NetworkProviderServiceFactory extends BaseFactory {
  /**
   * Creates a new NetworkProviderService instance with the given config.
   */
  create(config = new NetworkProviderServiceConfig()) {
    return new NetworkProviderService(config);
  }
}

module.exports = NetworkProviderServiceFactory;
