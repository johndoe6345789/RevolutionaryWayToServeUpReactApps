/**
 * Interface for registered base classes.
 * Provides a common contract for classes that are registered with a registry and have initialization lifecycle.
 */
export interface IRegisteredBase {
  /**
   * Initializes the instance before it can be used.
   * @returns This instance for method chaining
   */
  initialize(): this;
  
  /**
   * Gets the initialization status.
   * @returns True if initialized, false otherwise
   */
  get isInitialized(): boolean;
  
  /**
   * Gets the configuration object.
   * @returns The configuration object
   */
  get configuration(): Record<string, unknown>;
}

/**
 * Type alias for registered base constructor functions.
 */
export type IRegisteredBaseConstructor = new (config?: Record<string, unknown>) => IRegisteredBase;
