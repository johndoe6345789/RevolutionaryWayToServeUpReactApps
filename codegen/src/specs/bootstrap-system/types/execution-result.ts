import type { GeneratedFile } from './generated-file';
import type { SpecsData } from './specs-data';

/**
 * ExecutionResult - Output payload from the bootstrap generator.
 */
export interface ExecutionResult {
  success: boolean;
  generated: GeneratedFile[];
  specs: SpecsData;
}
