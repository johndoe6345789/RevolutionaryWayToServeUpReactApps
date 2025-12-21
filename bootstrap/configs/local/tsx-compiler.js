/**
 * Provides overrides for the TSX compiler dependencies.
 */
class TsxCompilerConfig {
  constructor({
    logging,
    sourceUtils,
    serviceRegistry,
    namespace,
    fetch,
    Babel,
  } = {}) {
    this.logging = logging;
    this.sourceUtils = sourceUtils;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
    this.fetch = fetch;
    this.Babel = Babel;
  }
}

module.exports = TsxCompilerConfig;
