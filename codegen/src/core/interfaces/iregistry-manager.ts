/**
 * Registry manager interface - coordinates registry operations
 * AGENTS.md compliant: manages multiple registries with registration and lookup
 */
import type { IComponent } from './icomponent';
import type { IRegistry } from './iregistry';
import type { IAggregate } from './iaggregate';

/**
 *
 */
export interface IRegistryManager {
  /**
   *
   */
  register(type: string, id: string, component: IComponent): void;
  /**
   *
   */
  getRegistry(type: string): IRegistry;
  /**
   *
   */
  getAggregate(name: string): IAggregate;
}
