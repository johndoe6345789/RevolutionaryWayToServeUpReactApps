import type { CommandSpec } from './command-spec';

/**
 * Parsed CLI specification content
 */
export interface CLISpecData {
  commands: Record<string, CommandSpec>;
  search: {
    title: string;
    summary: string;
  };
}
