import type { GeneratedFile } from './generated-file';
import type { CLISpecData } from './cli-spec-data';

/**
 * Execution response for the CLI generator
 */
export interface ExecutionResult {
  success: boolean;
  generated: GeneratedFile[];
  specs: CLISpecData;
}
