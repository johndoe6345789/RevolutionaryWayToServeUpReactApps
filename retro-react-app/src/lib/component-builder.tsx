/**
 * React Component Builder Pattern - applies AGENTS.md builder patterns to React
 * Fluent API for composing complex component hierarchies with dependency management
 */

import React, { ReactNode } from 'react';

// Component configuration interface
export interface ComponentConfig {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, unknown>;
  dependencies?: string[];
  children?: ComponentConfig[];
}

// Builder interface (matches AGENTS.md LifecycleBuilder)
export interface IComponentBuilder {
  add(id: string, component: React.ComponentType<any>, props?: Record<string, unknown>): this;
  dependsOn(id: string, dependencyId: string): this;
  withChildren(id: string, children: ComponentConfig[]): this;
  build(): ReactNode;
}

// Component builder implementation
export class ComponentBuilder implements IComponentBuilder {
  private components = new Map<string, ComponentConfig>();
  private dependencies = new Map<string, Set<string>>();
  private childrenMap = new Map<string, ComponentConfig[]>();

  /**
   * Add component to the builder
   * @param id - Unique component identifier
   * @param component - React component
   * @param props - Component props
   */
  public add(id: string, component: React.ComponentType<any>, props?: Record<string, unknown>): this {
    this.components.set(id, {
      id,
      component,
      props: props || {},
      dependencies: [],
    });
    return this;
  }

  /**
   * Define dependency between components
   * @param id - Component ID
   * @param dependencyId - Dependency component ID
   */
  public dependsOn(id: string, dependencyId: string): this {
    if (!this.dependencies.has(id)) {
      this.dependencies.set(id, new Set());
    }
    this.dependencies.get(id)!.add(dependencyId);
    return this;
  }

  /**
   * Add children to a component
   * @param id - Parent component ID
   * @param children - Child component configurations
   */
  public withChildren(id: string, children: ComponentConfig[]): this {
    this.childrenMap.set(id, children);
    return this;
  }

  /**
   * Build the component hierarchy
   * Performs topological sort based on dependencies
   */
  public build(): ReactNode {
    const sortedIds = this.getDependencyOrder();
    const renderedComponents = new Map<string, ReactNode>();

    // Render components in dependency order
    for (const id of sortedIds) {
      const config = this.components.get(id);
      if (!config) continue;

      const children = this.childrenMap.get(id) || [];
      const renderedChildren = children.map(child => this.renderComponentConfig(child, renderedComponents));

      const Component = config.component;
      const componentProps = {
        ...config.props,
        children: renderedChildren.length > 0 ? renderedChildren : undefined,
      };

      renderedComponents.set(id, <Component key={id} {...componentProps} />);
    }

    // Return root components (those with no dependents)
    const rootComponents: ReactNode[] = [];
    for (const [id, component] of renderedComponents) {
      const hasDependents = Array.from(this.dependencies.values()).some(deps => deps.has(id));
      if (!hasDependents) {
        rootComponents.push(component);
      }
    }

    return rootComponents.length === 1 ? rootComponents[0] : <>{rootComponents}</>;
  }

  /**
   * Render a component configuration
   * @param config - Component configuration
   * @param renderedComponents - Map of already rendered components
   */
  private renderComponentConfig(
    config: ComponentConfig,
    renderedComponents: Map<string, ReactNode>
  ): ReactNode {
    const Component = config.component;
    const children = config.children?.map(child => this.renderComponentConfig(child, renderedComponents)) || [];

    const componentProps = {
      ...config.props,
      children: children.length > 0 ? children : undefined,
    };

    return <Component key={config.id} {...componentProps} />;
  }

  /**
   * Get dependency order using topological sort
   */
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

// Factory function for creating component builders
export function createComponentBuilder(): IComponentBuilder {
  return new ComponentBuilder();
}

// Utility function to create component config
export function componentConfig(
  id: string,
  component: React.ComponentType<any>,
  props?: Record<string, unknown>,
  children?: ComponentConfig[]
): ComponentConfig {
  return {
    id,
    component,
    props: props || {},
    children,
  };
}
