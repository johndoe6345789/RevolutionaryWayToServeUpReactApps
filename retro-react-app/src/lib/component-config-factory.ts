import type { ComponentType } from 'react';
import type { ComponentConfig } from './component-config';

// Utility function to create component config
export function componentConfig(
  id: string,
  component: ComponentType<any>,
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
