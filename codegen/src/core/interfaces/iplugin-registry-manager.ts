/**
 * Plugin registry manager interface - simplified registry interface for plugins
 * Used by plugins to register themselves with the system
 */

/**
 *
 */
export interface IPluginRegistryManager {
  /**
   *
   */
  register(id: string, spec: unknown): void;
}
