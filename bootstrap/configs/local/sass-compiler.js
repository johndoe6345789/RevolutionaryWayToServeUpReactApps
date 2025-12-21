/**
 * Carries the fetch/document/Sass overrides for the compiler.
 */
class SassCompilerConfig {
  constructor({
    fetch,
    document,
    SassImpl,
    serviceRegistry,
    namespace,
  } = {}) {
    this.fetch = fetch;
    this.document = document;
    this.SassImpl = SassImpl;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
  }
}

module.exports = SassCompilerConfig;
