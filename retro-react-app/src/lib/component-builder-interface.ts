import type { ReactNode } from "react";
import type {
  ComponentConfig,
  ComponentProps,
  ConfiguredComponentType,
} from "./component-config";

// Builder interface (matches AGENTS.md LifecycleBuilder)
export interface IComponentBuilder {
  add<TProps extends ComponentProps = ComponentProps>(
    id: string,
    component: ConfiguredComponentType<TProps>,
    props?: Partial<TProps>,
  ): this;
  dependsOn(id: string, dependencyId: string): this;
  withChildren(id: string, children: ComponentConfig[]): this;
  build(): ReactNode;
}
