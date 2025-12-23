import type { ComponentType, ReactNode } from 'react';
import type { ComponentConfig } from './component-config';

// Builder interface (matches AGENTS.md LifecycleBuilder)
export interface IComponentBuilder {
  add(id: string, component: ComponentType<any>, props?: Record<string, unknown>): this;
  dependsOn(id: string, dependencyId: string): this;
  withChildren(id: string, children: ComponentConfig[]): this;
  build(): ReactNode;
}
