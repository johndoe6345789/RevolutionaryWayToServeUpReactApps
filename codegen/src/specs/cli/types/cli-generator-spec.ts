import type { ISpec } from '../../core/interfaces';

/**
 * Specification contract for the CLI generator
 */
export interface CLIGeneratorSpec extends ISpec {
  specsPath?: string;
  outputPath?: string;
}
