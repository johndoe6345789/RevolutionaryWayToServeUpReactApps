/**
 * Specification for a single CLI command
 */
export interface CommandSpec {
  id: string;
  search: {
    title: string;
    summary: string;
  };
  syntax?: string;
  examples?: string[];
  subcommands?: Record<
    string,
    {
      syntax: string;
      examples: string[];
    }
  >;
}
