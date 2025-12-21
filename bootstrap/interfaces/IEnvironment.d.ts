/**
 * Interface for environment classes.
 * Provides a common contract for classes that manage runtime environment information and capabilities.
 */
export interface IEnvironment {
  /**
   * Gets the current runtime environment type (browser, node, etc.).
   * @returns The environment type string
   */
  getEnvironmentType(): string;
  
  /**
   * Checks if the current environment supports a specific feature.
   * @param feature - The feature to check
   * @returns True if the feature is supported
   */
  supportsFeature(feature: string): boolean;
  
  /**
   * Gets environment-specific configuration values.
   * @param key - The configuration key
   * @returns The configuration value or undefined
   */
  getConfig(key: string): unknown;
  
  /**
   * Sets an environment-specific configuration value.
   * @param key - The configuration key
   * @param value - The configuration value
   */
  setConfig(key: string, value: unknown): void;
  
  /**
   * Gets all environment configuration as a plain object.
   * @returns The complete configuration object
   */
  getAllConfig(): Record<string, unknown>;
  
  /**
   * Validates that the environment meets minimum requirements.
   * @returns True if environment is valid
   */
  validateEnvironment(): boolean;
  
  /**
   * Gets information about the current runtime.
   * @returns Runtime information object
   */
  getRuntimeInfo(): Record<string, unknown>;
}

/**
 * Type alias for environment constructor functions.
 */
export type IEnvironmentConstructor = new () => IEnvironment;
