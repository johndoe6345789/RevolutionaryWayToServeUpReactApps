/**
 * Plugin interface - extends component with plugin-specific capabilities
 * AGENTS.md compliant: plugin contract with config, spec loading, and registration
 */
import { IComponent } from './icomponent';
import { IPluginConfig } from './iplugin-config';
import { IRegistryManager } from './iregistry-manager';
import { ISpec } from './ispec';

export interface IPlugin extends IComponent {
  readonly config: IPluginConfig;

  getSpec(): Promise<ISpec>;
  getMessages(): Promise<Record<string, Record<string, string>>>;
  register(registryManager: IRegistryManager): Promise<void>;
  shutdown(): Promise<void>;
}
