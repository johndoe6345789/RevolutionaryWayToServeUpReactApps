const BaseFactory = require('../../interfaces/base-factory.js');
const NetworkProviderService = require("../../../services/cdn/network/network-provider-service.js");

/**
 * Factory for creating NetworkProviderService instances.
 */
class NetworkProviderServiceFactory extends BaseFactory {
  /**
   * Creates a new NetworkProviderService instance with the provided configuration.
   */
  create(config = {}) {
    return new NetworkProviderService(config);
  }
}

module.exports = NetworkProviderServiceFactory;