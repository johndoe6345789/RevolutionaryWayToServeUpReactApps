const TsxCompilerService = require("../services/local/tsx-compiler-service.js");
const TsxCompilerConfig = require("../configs/tsx-compiler.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const GlobalRootHandler = require("../constants/global-root-handler.js");

const rootHandler = new GlobalRootHandler();
const namespace = rootHandler.getNamespace();
const globalScope = rootHandler.root;
const fetchImpl =
  typeof globalScope.fetch === "function" ? globalScope.fetch.bind(globalScope) : undefined;
const Babel = globalScope.Babel;
const tsxCompilerService = new TsxCompilerService(
  new TsxCompilerConfig({
    serviceRegistry,
    namespace,
    fetch: fetchImpl,
    Babel,
  })
);
tsxCompilerService.initialize();
tsxCompilerService.install();

module.exports = tsxCompilerService.exports;
