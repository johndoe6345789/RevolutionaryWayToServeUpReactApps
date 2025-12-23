/**
 * BaseCodegenOptions - Configuration options for BaseCodegen
 * Defines constructor parameters for codegen system initialization
 */

/**
 *
 */
export interface IBaseCodegenOptions {
  outputDir?: string;
  strictMode?: boolean;
  verbose?: boolean;
  enableCache?: boolean;
  [key: string]: unknown;
}
