/**
 * Provides overrides for the TSX compiler dependencies.
 */
class TsxCompilerConfig {
  constructor({ logging, sourceUtils } = {}) {
    this.logging = logging;
    this.sourceUtils = sourceUtils;
  }
}

module.exports = TsxCompilerConfig;
