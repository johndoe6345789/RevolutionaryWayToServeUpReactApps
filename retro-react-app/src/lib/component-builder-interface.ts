import { ReactNode } from 'react';

// Builder interface (matches AGENTS.md LifecycleBuilder)
export interface IComponentBuilder {
  add(id: string, component: React.ComponentType<any>, props?: Record<string, unknown>): this;
  dependsOn(id: string, dependencyId: string): this;
  withChildren(id: string, children: import('./component-config').ComponentConfig[]): this;
  build(): ReactNode;
}
