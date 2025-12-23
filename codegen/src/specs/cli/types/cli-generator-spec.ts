import type { ISpec } from '../../../core/interfaces';

/**
 * CLIGeneratorSpec - Configuration for CLI generation.
 */
export interface CLIGeneratorSpec extends ISpec {
  specsPath?: string;
  outputPath?: string;
}
