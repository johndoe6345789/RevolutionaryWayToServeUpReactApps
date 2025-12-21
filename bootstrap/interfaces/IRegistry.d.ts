/**
 * Base interface for all registry classes.
 * Provides a common contract for registry objects that manage collections of services, factories, controllers, etc.
 */
export interface IRegistry {
  /**
   * Registers an item with the registry.
   * @param name - The unique name/identifier for the item
   * @param item - The item to register (service, factory, controller, etc.)
   * @param metadata - Additional metadata about the item
   * @param requiredDependencies - List of required dependencies for this item
   */
  register(name: string, item: unknown, metadata: Record<string, unknown>, requiredDependencies: string[]): void;
  
  /**
   * Retrieves an item from the registry by name.
   * @param name - The name of the item to retrieve
   * @returns The registered item or undefined if not found
   */
  get(name: string): unknown;
  
  /**
   * Checks if an item is registered with the given name.
   * @param name - The name to check
   * @returns True if the item is registered, false otherwise
   */
  has(name: string): boolean;
  
  /**
   * Removes an item from the registry.
   * @param name - The name of the item to remove
   * @returns True if the item was removed, false if it wasn't found
   */
  unregister(name: string): boolean;
  
  /**
   * Gets all registered item names.
   * @returns Array of all registered names
   */
  getAllNames(): string[];
  
  /**
   * Clears all items from the registry.
   */
  clear(): void;
  
  /**
   * Gets metadata for a registered item.
   * @param name - The name of the item
   * @returns The metadata object or undefined if not found
   */
  getMetadata(name: string): Record<string, unknown> | undefined;
  
  /**
   * Gets the required dependencies for a registered item.
   * @param name - The name of the item
   * @returns Array of required dependencies or undefined if not found
   */
  getRequiredDependencies(name: string): string[] | undefined;
}

/**
 * Type alias for registry constructor functions.
 */
export type IRegistryConstructor = new () => IRegistry;
