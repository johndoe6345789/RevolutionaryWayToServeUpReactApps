import type { GeneratedFile } from './generated-file';
import type { SpecsData } from './specs-data';

/**
 * Execution response returned by the bootstrap generator
 */
export interface ExecutionResult {
  success: boolean;
  generated: GeneratedFile[];
  specs: SpecsData;
}
