import type { CommandSpec } from './command-spec';

/**
 * CLISpecData - Parsed CLI specification content.
 */
export interface CLISpecData {
  commands: Record<string, CommandSpec>;
  search: {
    title: string;
    summary: string;
  };
}
