/**
 * Optional flags controlling the codegen entrypoint
 */
export interface CodegenOptions {
  outputDir?: string;
  verbose?: boolean;
  strictMode?: boolean;
  [key: string]: unknown;
}
