/**
 * Base skeleton class for environment classes.
 * Provides common implementation of IEnvironment interface methods.
 */
class BaseEnvironment {
  /**
   * Creates a new BaseEnvironment instance with optional initial configuration.
   * @param config - Optional initial configuration
   */
  constructor(config = {}) {
    this._config = { ...config };
    this._detectedType = this._detectEnvironmentType();
    this._features = new Set();
    this._runtimeInfo = null;
  }

  /**
   * Gets the current runtime environment type.
   * @returns The environment type string
   */
  getEnvironmentType() {
    return this._detectedType;
  }

  /**
   * Checks if the current environment supports a specific feature.
   * @param feature - The feature to check
   * @returns True if the feature is supported
   */
  supportsFeature(feature) {
    return this._features.has(feature);
  }

  /**
   * Gets environment-specific configuration value by key.
   * @param key - The configuration key
   * @returns The configuration value or undefined
   */
  getConfig(key) {
    return this._config[key];
  }

  /**
   * Sets an environment-specific configuration value.
   * @param key - The configuration key
   * @param value - The configuration value
   */
  setConfig(key, value) {
    this._config[key] = value;
  }

  /**
   * Gets all environment configuration as a plain object.
   * @returns The complete configuration object
   */
  getAllConfig() {
    return { ...this._config };
  }

  /**
   * Validates that the environment meets minimum requirements.
   * @returns True if environment is valid
   */
  validateEnvironment() {
    // Base implementation - can be overridden by subclasses
    return this._detectedType !== 'unknown';
  }

  /**
   * Gets information about the current runtime.
   * @returns Runtime information object
   */
  getRuntimeInfo() {
    if (!this._runtimeInfo) {
      this._runtimeInfo = this._buildRuntimeInfo();
    }
    return this._runtimeInfo;
  }

  /**
   * Detects the current environment type.
   * @returns The detected environment type
   * @private
   */
  _detectEnvironmentType() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      return 'browser';
    } else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      return 'node';
    } else if (typeof worker !== 'undefined') {
      return 'webworker';
    } else if (typeof importScripts !== 'undefined') {
      return 'service-worker';
    }
    return 'unknown';
  }

  /**
   * Builds runtime information object.
   * @returns Runtime information object
   * @private
   */
  _buildRuntimeInfo() {
    return {
      type: this.getEnvironmentType(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      platform: typeof platform !== 'undefined' ? platform : undefined,
      arch: typeof process !== 'undefined' && process.arch ? process.arch : undefined,
      nodeVersion: typeof process !== 'undefined' && process.versions ? process.versions.node : undefined,
      features: Array.from(this._features),
      config: this.getAllConfig(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Registers a supported feature.
   * @param feature - The feature name
   * @protected
   */
  _registerFeature(feature) {
    this._features.add(feature);
  }

  /**
   * Unregisters a feature.
   * @param feature - The feature name
   * @protected
   */
  _unregisterFeature(feature) {
    this._features.delete(feature);
  }

  /**
   * Checks if running in a browser environment.
   * @returns True if in browser
   */
  isBrowser() {
    return this.getEnvironmentType() === 'browser';
  }

  /**
   * Checks if running in Node.js environment.
   * @returns True if in Node.js
   */
  isNode() {
    return this.getEnvironmentType() === 'node';
  }

  /**
   * Checks if running in a web worker.
   * @returns True if in web worker
   */
  isWebWorker() {
    return this.getEnvironmentType() === 'webworker';
  }

  /**
   * Checks if running in a service worker.
   * @returns True if in service worker
   */
  isServiceWorker() {
    return this.getEnvironmentType() === 'service-worker';
  }

  /**
   * Gets the current platform information.
   * @returns Platform information
   */
  getPlatform() {
    const info = this.getRuntimeInfo();
    return info.platform;
  }

  /**
   * Gets the current architecture information.
   * @returns Architecture information
   */
  getArchitecture() {
    const info = this.getRuntimeInfo();
    return info.arch;
  }

  /**
   * Gets the Node.js version if available.
   * @returns Node.js version string
   */
  getNodeVersion() {
    const info = this.getRuntimeInfo();
    return info.nodeVersion;
  }

  /**
   * Clears all configuration.
   */
  clearConfig() {
    this._config = {};
  }

  /**
   * Resets environment detection.
   */
  reset() {
    this._config = {};
    this._features.clear();
    this._runtimeInfo = null;
    this._detectedType = this._detectEnvironmentType();
  }

  /**
   * Merges additional configuration.
   * @param additional - Configuration to merge
   */
  mergeConfig(additional) {
    if (typeof additional === 'object' && additional !== null) {
      this._config = { ...this._config, ...additional };
    }
  }

  /**
   * Checks if a specific API is available.
   * @param apiName - The API name to check
   * @returns True if API is available
   */
  hasAPI(apiName) {
    const globalObj = this._getGlobalObject();
    return globalObj && typeof globalObj[apiName] !== 'undefined';
  }

  /**
   * Gets the global object for the current environment.
   * @returns The global object
   * @private
   */
  _getGlobalObject() {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof global !== 'undefined') return global;
    if (typeof window !== 'undefined') return window;
    if (typeof self !== 'undefined') return self;
    return {};
  }

  /**
   * Logs environment information.
   * @param message - The message to log
   * @param data - Optional additional data
   * @protected
   */
  _log(message, data) {
    if (typeof console !== 'undefined' && console.log) {
      console.log(`[BaseEnvironment] ${message}`, data || '');
    }
  }

  /**
   * Gets environment-specific capabilities.
   * @returns Object with capability information
   */
  getCapabilities() {
    return {
      supportsFeatures: Array.from(this._features),
      environmentType: this.getEnvironmentType(),
      hasDOM: this.isBrowser() && typeof document !== 'undefined',
      hasConsole: typeof console !== 'undefined',
      hasFetch: this.hasAPI('fetch'),
      hasLocalStorage: this.isBrowser() && typeof localStorage !== 'undefined',
      hasSessionStorage: this.isBrowser() && typeof sessionStorage !== 'undefined'
    };
  }
}

module.exports = BaseEnvironment;
