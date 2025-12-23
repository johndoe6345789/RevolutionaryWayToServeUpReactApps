/**
 * React Component Builder Pattern - applies AGENTS.md builder patterns to React
 * Fluent API for composing complex component hierarchies with dependency management
 */

import type { ComponentType, ReactNode } from "react";
import type { ComponentConfig, ComponentProps } from "./component-config";
import type { IComponentBuilder } from "./component-builder-interface";

// Component builder implementation
export class ComponentBuilder implements IComponentBuilder {
  private readonly components = new Map<string, ComponentConfig>();
  private readonly dependencies = new Map<string, Set<string>>();
  private readonly childrenMap = new Map<string, ComponentConfig[]>();

  public add<TProps extends ComponentProps = ComponentProps>(
    id: string,
    component: ComponentType<TProps>,
    props?: Partial<TProps>,
  ): this {
    this.components.set(id, {
      id,
      component,
      props: props ?? {},
      dependencies: [],
    });
    return this;
  }

  public dependsOn(id: string, dependencyId: string): this {
    if (!this.dependencies.has(id)) {
      this.dependencies.set(id, new Set());
    }
    this.dependencies.get(id)!.add(dependencyId);
    return this;
  }

  public withChildren(id: string, children: ComponentConfig[]): this {
    this.childrenMap.set(id, children);
    return this;
  }

  public build(): ReactNode {
    const sortedIds = this.getDependencyOrder();
    const renderedComponents = new Map<string, ReactNode>();

    // Render components in dependency order
    for (const id of sortedIds) {
      const config = this.components.get(id);
      if (!config) continue;

      const children = this.childrenMap.get(id) ?? [];
      const renderedChildren = children.map((child) =>
        this.renderComponentConfig(child, renderedComponents),
      );

      const Component = config.component;
      const componentProps = {
        ...(config.props ?? {}),
        children: renderedChildren.length > 0 ? renderedChildren : undefined,
      };

      renderedComponents.set(id, <Component key={id} {...componentProps} />);
    }

    // Return root components (those with no dependents)
    const rootComponents: ReactNode[] = [];
    for (const [id, component] of renderedComponents) {
      const hasDependents = Array.from(this.dependencies.values()).some(
        (deps) => deps.has(id),
      );
      if (!hasDependents) {
        rootComponents.push(component);
      }
    }

    return rootComponents.length === 1 ? (
      rootComponents[0]
    ) : (
      <>{rootComponents}</>
    );
  }

  private renderComponentConfig(
    config: ComponentConfig,
    renderedComponents: Map<string, ReactNode>,
  ): ReactNode {
    const Component = config.component;
    const children =
      config.children?.map((child) =>
        this.renderComponentConfig(child, renderedComponents),
      ) ?? [];

    const componentProps = {
      ...(config.props ?? {}),
      children: children.length > 0 ? children : undefined,
    };

    return <Component key={config.id} {...componentProps} />;
  }

  private getDependencyOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (id: string): void => {
      if (visited.has(id)) return;
      if (visiting.has(id)) {
        throw new Error(`Circular dependency detected: ${id}`);
      }

      visiting.add(id);

      // Visit dependencies first
      const deps = this.dependencies.get(id);
      if (deps) {
        for (const depId of deps) {
          visit(depId);
        }
      }

      visiting.delete(id);
      visited.add(id);
      order.push(id);
    };

    // Visit all components
    for (const id of this.components.keys()) {
      visit(id);
    }

    return order;
  }
}
