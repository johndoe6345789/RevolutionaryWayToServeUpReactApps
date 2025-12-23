import type { ISpec } from '../../../core/interfaces';

/**
 * WebUIGeneratorSpec - Configuration for generating the web UI.
 */
export interface WebUIGeneratorSpec extends ISpec {
  specsPath?: string;
  outputPath?: string;
}
