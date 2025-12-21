/**
 * Configuration for ServiceRegistry instances.
 * Provides service registry initialization settings.
 */
class ServiceRegistryConfig {
  /**
   * Initializes a new Service Registry Config instance with the provided configuration.
   */
  constructor({
    enableAutoRegistration = true,
    validateDependencies = true,
    enableCircularDependencyCheck = true,
    maxDependencyDepth = 10,
  } = {}) {
    this.enableAutoRegistration = enableAutoRegistration;
    this.validateDependencies = validateDependencies;
    this.enableCircularDependencyCheck = enableCircularDependencyCheck;
    this.maxDependencyDepth = maxDependencyDepth;
  }
}

module.exports = ServiceRegistryConfig;
