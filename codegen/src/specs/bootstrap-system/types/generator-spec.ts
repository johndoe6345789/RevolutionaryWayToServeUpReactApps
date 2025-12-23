import type { ISpec } from '../../core/interfaces/ispec';

/**
 * Specification contract for the bootstrap generator
 */
export interface GeneratorSpec extends ISpec {
  specsPath?: string;
  outputPath?: string;
}
