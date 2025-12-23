import type { ISpec } from '../../core/interfaces';

/**
 * Specification contract for the Web UI generator
 */
export interface WebUIGeneratorSpec extends ISpec {
  specsPath?: string;
  outputPath?: string;
}
