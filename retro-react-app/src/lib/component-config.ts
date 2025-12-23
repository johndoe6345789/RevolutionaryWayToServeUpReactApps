// Component configuration interface
export interface ComponentConfig {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, unknown>;
  dependencies?: string[];
  children?: ComponentConfig[];
}
