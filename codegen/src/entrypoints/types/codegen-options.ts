/**
 * CodegenOptions - Optional settings for CLI/web entrypoints.
 */
export interface CodegenOptions {
  outputDir?: string;
  verbose?: boolean;
  strictMode?: boolean;
  [key: string]: unknown;
}
