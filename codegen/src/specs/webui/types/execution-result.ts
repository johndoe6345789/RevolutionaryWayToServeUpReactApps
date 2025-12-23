import type { GeneratedFile } from './generated-file';
import type { WebUISpecData } from './webui-spec-data';

/**
 * ExecutionResult - Output payload from the web UI generator.
 */
export interface ExecutionResult {
  success: boolean;
  generated: GeneratedFile[];
  specs: WebUISpecData;
}
