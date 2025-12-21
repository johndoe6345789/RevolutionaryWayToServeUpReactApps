/**
 * Base interface for all configuration classes.
 * Provides a common contract for configuration objects that manage application settings.
 */
export interface IConfig {
  /**
   * Validates that the configuration is properly set up.
   * @throws Error if configuration is invalid
   */
  validate?(): void;
  
  /**
   * Merges additional configuration properties into this instance.
   * @param additional - Additional configuration to merge
   * @returns A new configuration instance with merged properties
   */
  merge?(additional: Record<string, unknown>): IConfig;
  
  /**
   * Serializes the configuration to a plain object.
   * @returns The configuration as a plain object
   */
  toObject?(): Record<string, unknown>;
}

/**
 * Type alias for configuration constructor functions.
 */
export type IConfigConstructor = new (options?: Record<string, unknown>) => IConfig;
