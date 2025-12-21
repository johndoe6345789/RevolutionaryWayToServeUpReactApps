const HelperBase = require("./base-helper.js");
const helperRegistry = require("./helper-registry-instance.js");
const LocalHelpersConfig = require("../configs/local-helpers.js");
const FrameworkRenderer = require("../services/local/framework-renderer.js");
const LocalRequireBuilder = require("../services/local/local-require-builder.js");

/**
 * Registers local helper constructors in the shared helper registry.
 */
class LocalHelpers extends HelperBase {
  constructor(config = new LocalHelpersConfig()) {
    if (typeof config.helperRegistry === "undefined") {
      config.helperRegistry = helperRegistry;
    }
    super(config);
  }

  /**
   * Sets up the local helper entries before they are requested.
   */
  initialize() {
    if (this.initialized) {
      return this;
    }
    this._registerHelper("frameworkRenderer", FrameworkRenderer, {
      folder: "services/local/helpers",
      domain: "helpers",
    });
    this._registerHelper("localRequireBuilder", LocalRequireBuilder, {
      folder: "services/local/helpers",
      domain: "helpers",
    });
    this.initialized = true;
    return this;
  }
}

LocalHelpers.Config = LocalHelpersConfig;

module.exports = LocalHelpers;
