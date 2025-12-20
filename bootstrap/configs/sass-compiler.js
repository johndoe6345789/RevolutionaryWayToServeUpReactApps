/**
 * Carries the fetch/document/Sass overrides for the compiler.
 */
class SassCompilerConfig {
  constructor({ fetch, document, SassImpl } = {}) {
    this.fetch = fetch;
    this.document = document;
    this.SassImpl = SassImpl;
  }
}

module.exports = SassCompilerConfig;
