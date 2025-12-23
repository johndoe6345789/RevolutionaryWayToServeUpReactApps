/**
 * System status interface
 * Status information about the codegen system
 */

import type { IBaseCodegenOptions } from './ibase-codegen-options';

/**
 *
 */
export interface ISystemStatus {
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
