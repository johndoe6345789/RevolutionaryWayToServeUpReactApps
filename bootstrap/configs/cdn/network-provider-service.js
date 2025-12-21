/**
 * Configuration for NetworkProviderService instances.
 * Provides CDN provider and fallback configuration.
 */
class NetworkProviderServiceConfig {
  /**
   * Initializes a new Network Provider Service Config instance with the provided configuration.
   */
  constructor({
    defaultProvider = 'https://unpkg.com',
    fallbackProviders = ['https://cdn.skypack.dev/', 'https://jspm.dev/'],
    providerAliases = {
      'unpkg': 'https://unpkg.com',
      'unpkg.com': 'https://unpkg.com',
      'esm': 'https://esm.sh'
    },
    enableCaching = true,
    cacheTimeout = 3600000, // 1 hour
  } = {}) {
    this.defaultProvider = defaultProvider;
    this.fallbackProviders = fallbackProviders;
    this.providerAliases = providerAliases;
    this.enableCaching = enableCaching;
    this.cacheTimeout = cacheTimeout;
  }
}

module.exports = NetworkProviderServiceConfig;
