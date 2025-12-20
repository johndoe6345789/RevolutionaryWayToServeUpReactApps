/**
 * Configures how the import-map initializer fetches config.json and touches the DOM.
 */
class ImportMapInitConfig {
  constructor({ window, fetch } = {}) {
    this.window = window;
    this.fetch = fetch;
  }
}

module.exports = ImportMapInitConfig;
