import type { ComponentType } from 'react';

// Component configuration interface
export interface ComponentConfig {
  id: string;
  component: ComponentType<any>;
  props?: Record<string, unknown>;
  dependencies?: string[];
  children?: ComponentConfig[];
}
