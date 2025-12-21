/**
 * Interface for initializer classes.
 * Provides a common contract for classes that handle initialization logic for services and components.
 */
export interface IInitializer {
  /**
   * The service being initialized.
   */
  readonly service: unknown;
  
  /**
   * The configuration for the service.
   */
  readonly config: Record<string, unknown>;
  
  /**
   * Executes the initialization lifecycle for the service.
   * This method should orchestrate all initialization steps.
   */
  run(): void;
  
  /**
   * Validates that required dependencies are available before initialization.
   * @throws Error if validation fails
   */
  validateDependencies?(): void;
  
  /**
   * Performs any cleanup or finalization steps after initialization.
   */
  finalize?(): void;
  
  /**
   * Gets the initialization status.
   * @returns True if initialization is complete, false otherwise
   */
  isInitialized(): boolean;
  
  /**
   * Gets any errors that occurred during initialization.
   * @returns Array of error messages or empty array if no errors
   */
  getErrors(): string[];
}

/**
 * Type alias for initializer constructor functions.
 */
export type IInitializerConstructor = new (service: unknown) => IInitializer;
