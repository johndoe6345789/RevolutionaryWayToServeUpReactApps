import type { GeneratedFile } from './generated-file';
import type { WebUISpecData } from './webui-spec-data';

/**
 * Execution response for Web UI generator
 */
export interface ExecutionResult {
  success: boolean;
  generated: GeneratedFile[];
  specs: WebUISpecData;
}
