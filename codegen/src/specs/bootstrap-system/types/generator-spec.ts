import type { ISpec } from '../../../core/interfaces/ispec';

/**
 * GeneratorSpec - Configuration for the bootstrap generator.
 */
export interface GeneratorSpec extends ISpec {
  specsPath?: string;
  outputPath?: string;
}
