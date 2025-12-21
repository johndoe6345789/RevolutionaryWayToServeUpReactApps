/**
 * Configures where the script manifest is loaded from and how scripts are injected.
 */
class ScriptListLoaderConfig {
  /**
   * Initializes a new Script List Loader Config instance with the provided configuration.
   */
  constructor({ document, manifestUrl, fetch, log } = {}) {
    this.document = document;
    this.manifestUrl = manifestUrl ?? "bootstrap/entrypoints/script-list.html";
    this.fetch = fetch;
    this.log = log;
  }
}

module.exports = ScriptListLoaderConfig;
