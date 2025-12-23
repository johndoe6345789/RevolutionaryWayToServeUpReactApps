import type { IBaseCodegenOptions } from '../interfaces/index';

/**
 * SystemStatus - Runtime status snapshot for diagnostics.
 */
export interface SystemStatus {
  initialized: boolean;
  plugins: {
    discovered: number;
    loaded: number;
  };
  registries: {
    plugins: number;
    aggregates: number;
    specs: number;
  };
  options: IBaseCodegenOptions;
}
