/**
 * CommandSpec - Defines a CLI command and its nested subcommands.
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
