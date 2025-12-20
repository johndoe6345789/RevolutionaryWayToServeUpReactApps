/**
 * Configures where the script manifest is loaded from and how scripts are injected.
 */
class ScriptListLoaderConfig {
  constructor({ document, manifestUrl, fetch, log } = {}) {
    this.document = document;
    this.manifestUrl = manifestUrl ?? "bootstrap/script-list.html";
    this.fetch = fetch;
    this.log = log;
  }
}

module.exports = ScriptListLoaderConfig;
