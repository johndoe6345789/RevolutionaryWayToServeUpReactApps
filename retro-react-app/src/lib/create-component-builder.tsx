import type { IComponentBuilder } from './component-builder-interface';
import { ComponentBuilder } from './component-builder';

// Factory function for creating component builders
export function createComponentBuilder(): IComponentBuilder {
  return new ComponentBuilder();
}
