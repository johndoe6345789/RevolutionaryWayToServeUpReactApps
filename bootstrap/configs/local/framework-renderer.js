/**
 * Configuration for FrameworkRenderer.
 */
class FrameworkRendererConfig {
  /**
   * Initializes a new Framework Renderer Config instance with the provided configuration.
   */
  constructor({ document } = {}) {
    this.document = document;
  }
}

module.exports = FrameworkRendererConfig;