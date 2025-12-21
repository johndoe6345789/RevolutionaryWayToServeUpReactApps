/**
 * Configures how the import-map initializer fetches config.json and touches the DOM.
 */
class ImportMapInitConfig {
  /**
   * Captures the runtime globals this initializer needs and keeps them on the config.
   */
  constructor({ window, fetch } = {}) {
    this.window = window;
    this.fetch = fetch;
  }
}

module.exports = ImportMapInitConfig;
