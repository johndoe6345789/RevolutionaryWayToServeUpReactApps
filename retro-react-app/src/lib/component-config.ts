import type { ComponentType } from "react";

export type ComponentProps = Record<string, unknown>;

export type ConfiguredComponentType<
  TProps extends ComponentProps = ComponentProps,
> = ComponentType<TProps>;

// Component configuration interface
export interface ComponentConfig<
  TProps extends ComponentProps = ComponentProps,
> {
  id: string;
  component: ConfiguredComponentType<TProps>;
  props?: Partial<TProps>;
  dependencies?: string[];
  children?: ComponentConfig[];
}
