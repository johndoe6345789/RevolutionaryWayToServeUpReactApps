/**
 * Entrypoint for running the TSX compiler helper inside the bootstrap namespace.
 */
const TsxCompilerService = require("../services/local/tsx-compiler-service.js");
const TsxCompilerConfig = require("../configs/tsx-compiler.js");
const BaseEntryPoint = require("../../entrypoints/base-entrypoint.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: TsxCompilerService,
  ConfigClass: TsxCompilerConfig,
  configFactory: ({ namespace, root }) => ({
    namespace,
    fetch: typeof root.fetch === "function" ? root.fetch.bind(root) : undefined,
    Babel: root.Babel,
  }),
});
const tsxCompilerService = entrypoint.run();

module.exports = tsxCompilerService.exports;
