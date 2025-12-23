import type { IBaseCodegenOptions } from '../interfaces/index';

/**
 * Runtime status snapshot for the core codegen system
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
