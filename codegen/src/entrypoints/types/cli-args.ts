/**
 * CLIArgs - Parsed command line arguments for the codegen entrypoint.
 */
export interface CLIArgs {
  spec?: string;
  output?: string;
  language?: string;
  profile?: string;
  template?: string;
  category?: string;
  component?: string;
  query?: string;
  tool?: string;
  platform?: string;
  packageManager?: string;
  [key: string]: unknown;
}
