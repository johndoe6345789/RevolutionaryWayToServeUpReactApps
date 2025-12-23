/**
 * Registry manager interface - coordinates registry operations
 * AGENTS.md compliant: manages multiple registries with registration and lookup
 */
import { IComponent } from './icomponent';
import { IRegistry } from './iregistry';
import { IAggregate } from './iaggregate';

export interface IRegistryManager {
  register(type: string, id: string, component: IComponent): void;
  getRegistry(type: string): IRegistry;
  getAggregate(name: string): IAggregate;
}
