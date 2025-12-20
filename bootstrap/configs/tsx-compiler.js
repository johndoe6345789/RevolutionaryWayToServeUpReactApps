/**
 * Provides overrides for the TSX compiler dependencies.
 */
class TsxCompilerConfig {
  constructor({ logging, sourceUtils, serviceRegistry } = {}) {
    this.logging = logging;
    this.sourceUtils = sourceUtils;
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = TsxCompilerConfig;
