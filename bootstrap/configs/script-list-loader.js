const GlobalRootHandler = require("../constants/global-root-handler.js");
const { scriptManifestUrl: SCRIPT_MANIFEST_URL } =
  require("../constants/common.js");

/**
 * Configures where the script manifest is loaded from and how scripts are injected.
 */
class ScriptListLoaderConfig {
  /**
   * Initializes a new Script List Loader Config instance with the provided configuration.
   */
  constructor({ document, manifestUrl, fetch, log, rootHandler } = {}) {
    const handler = rootHandler ?? new GlobalRootHandler();
    this.document = document ?? handler.getDocument();
    this.manifestUrl = manifestUrl ?? SCRIPT_MANIFEST_URL;
    this.fetch = fetch ?? handler.getFetch();
    this.log = log ?? handler.getLogger("rwtra:scripts");
    this.rootHandler = handler;
  }
}

module.exports = ScriptListLoaderConfig;
