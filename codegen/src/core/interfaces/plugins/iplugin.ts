/**
 * Plugin interface - extends component with plugin-specific capabilities
 * AGENTS.md compliant: plugin contract with config, spec loading, and registration
 */
import type { IComponent } from './icomponent';
import type { IPluginConfig } from './iplugin-config';
import type { IRegistryManager } from './iregistry-manager';
import type { ISpec } from './ispec';

/**
 *
 */
export interface IPlugin extends IComponent {
  readonly config: IPluginConfig;

  /**
   *
   */
  getSpec: () => Promise<ISpec>;
  /**
   *
   */
  getMessages: () => Promise<Record<string, Record<string, string>>>;
  /**
   *
   */
  register: (registryManager: IRegistryManager) => Promise<void>;
  /**
   *
   */
  shutdown: () => Promise<void>;
}
