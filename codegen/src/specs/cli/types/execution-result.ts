import type { CLISpecData } from './cli-spec-data';
import type { GeneratedFile } from './generated-file';

/**
 * ExecutionResult - Output payload from the CLI generator.
 */
export interface ExecutionResult {
  success: boolean;
  generated: GeneratedFile[];
  specs: CLISpecData;
}
