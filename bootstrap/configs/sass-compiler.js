/**
 * Carries the fetch/document/Sass overrides for the compiler.
 */
class SassCompilerConfig {
  constructor({ fetch, document, SassImpl, serviceRegistry } = {}) {
    this.fetch = fetch;
    this.document = document;
    this.SassImpl = SassImpl;
    this.serviceRegistry = serviceRegistry;
  }
}

module.exports = SassCompilerConfig;
