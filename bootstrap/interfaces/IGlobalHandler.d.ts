/**
 * Interface for global handler classes.
 * Provides a common contract for classes that encapsulate access to global objects and namespaces.
 */
export interface IGlobalHandler {
  /**
   * Gets the global root object (globalThis, global, window, etc.).
   * @returns The global root object
   */
  readonly root: unknown;
  
  /**
   * Gets the bootstrap namespace object located on the global root.
   * @returns The bootstrap namespace object
   */
  getNamespace(): Record<string, unknown>;
  
  /**
   * Returns the helper registry namespace that services/helpers share.
   * @returns The helpers namespace object
   */
  get helpers(): Record<string, unknown>;
  
  /**
   * Returns the global document reference if available.
   * @returns The document object or undefined
   */
  getDocument(): Document | undefined;
  
  /**
   * Returns a bound fetch implementation if the runtime exposes one.
   * @returns The fetch function or undefined
   */
  getFetch(): ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) | undefined;
  
  /**
   * Produces a logger that writes to console.error under the provided tag.
   * @param tag - The tag to use for logging
   * @returns A logger function
   */
  getLogger(tag?: string): (msg: string, data?: unknown) => void;
  
  /**
   * Returns whether the current runtime exposes a global window object.
   * @returns True if window object exists
   */
  hasWindow(): boolean;
  
  /**
   * Returns whether the current runtime exposes a global document object.
   * @returns True if document object exists
   */
  hasDocument(): boolean;
}

/**
 * Type alias for global handler constructor functions.
 */
export type IGlobalHandlerConstructor = new (root?: unknown) => IGlobalHandler;
