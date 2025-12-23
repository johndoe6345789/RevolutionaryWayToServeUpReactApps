import type {
  ComponentConfig,
  ComponentProps,
  ConfiguredComponentType,
} from "./component-config";

// Utility function to create component config
export function componentConfig<TProps extends ComponentProps>(
  id: string,
  component: ConfiguredComponentType<TProps>,
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
