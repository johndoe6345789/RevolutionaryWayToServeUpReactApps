import { BaseComponent } from '../core/codegen/base-component';
import { ExecutionManager } from '../core/codegen/execution-manager';
import { PluginManager } from '../core/plugins/plugin-manager';

/**
 *
 */
export interface ComponentLocator {
  /**
   *
   */
  getComponent: <TComponent extends BaseComponent = BaseComponent>(
    name: string,
  ) => TComponent | undefined;
}

const isBaseComponent = (component: unknown): component is BaseComponent =>
  component instanceof BaseComponent;

export const findExecutionManager = (locator: ComponentLocator): ExecutionManager | undefined =>
  findComponent(
    locator,
    'executionManager',
    (component): component is ExecutionManager =>
      component instanceof ExecutionManager ||
      typeof (component as ExecutionManager | undefined)?.executeWithContext === 'function',
  );

export const findPluginManager = (locator: ComponentLocator): PluginManager | undefined =>
  findComponent(
    locator,
    'pluginManager',
    (component): component is PluginManager =>
      component instanceof PluginManager ||
      typeof (component as PluginManager | undefined)?.getPlugins === 'function',
  );

const findComponent = <TComponent extends BaseComponent>(
  locator: ComponentLocator,
  name: string,
  predicate: (component: BaseComponent) => component is TComponent,
): TComponent | undefined => {
  const component = locator.getComponent(name);
  return component && isBaseComponent(component) && predicate(component) ? component : undefined;
};
