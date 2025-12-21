/**
 * Bootstraps the Sass compiler helper with runtime globals and registers it for local builds.
 */
const SassCompilerService = require("../../services/local/sass-compiler-service.js");
const SassCompilerConfig = require("../../configs/local/sass-compiler.js");
const BaseEntryPoint = require("../../interfaces/base-entrypoint.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: SassCompilerService,
  ConfigClass: SassCompilerConfig,
  configFactory: ({ namespace, root }) => ({
    namespace,
    fetch: typeof root.fetch === "function" ? root.fetch.bind(root) : undefined,
    document: root.document,
    SassImpl: root.Sass,
  }),
});
const sassCompilerService = entrypoint.run();

module.exports = sassCompilerService.exports;
