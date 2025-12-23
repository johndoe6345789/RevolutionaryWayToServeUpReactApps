import type { ComponentType } from "react";
import type { ComponentConfig, ComponentProps } from "./component-config";

// Utility function to create component config
export function componentConfig<TProps extends ComponentProps>(
  id: string,
  component: ComponentType<TProps>,
  props?: Partial<TProps>,
  children?: ComponentConfig[],
): ComponentConfig<TProps> {
  return {
    id,
    component,
    props: props ?? {},
    children,
  };
}
