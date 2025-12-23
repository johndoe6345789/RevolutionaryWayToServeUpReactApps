import type { ComponentType } from "react";

export type ComponentProps = Record<string, unknown>;

// Component configuration interface
export interface ComponentConfig<
  TProps extends ComponentProps = ComponentProps,
> {
  id: string;
  component: ComponentType<TProps>;
  props?: Partial<TProps>;
  dependencies?: string[];
  children?: ComponentConfig[];
}
