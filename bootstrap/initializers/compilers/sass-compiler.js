const SassCompilerService = require("../services/local/sass-compiler-service.js");
const SassCompilerConfig = require("../configs/sass-compiler.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const GlobalRootHandler = require("../constants/global-root-handler.js");

const rootHandler = new GlobalRootHandler();
const namespace = rootHandler.namespace;
const globalScope = rootHandler.root;
const fetchImpl =
  typeof globalScope.fetch === "function" ? globalScope.fetch.bind(globalScope) : undefined;
const sassCompilerService = new SassCompilerService(
  new SassCompilerConfig({
    serviceRegistry,
    namespace,
    fetch: fetchImpl,
    document: globalScope.document,
    SassImpl: globalScope.Sass,
  })
);
sassCompilerService.initialize();
sassCompilerService.install();

module.exports = sassCompilerService.exports;
