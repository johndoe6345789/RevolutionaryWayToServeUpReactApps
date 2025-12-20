const TsxCompilerService = require("../services/local/tsx-compiler-service.js");
const TsxCompilerConfig = require("../configs/tsx-compiler.js");
const serviceRegistry = require("../services/service-registry-instance.js");

const tsxCompilerService = new TsxCompilerService(
  new TsxCompilerConfig({ serviceRegistry })
);
tsxCompilerService.initialize();
tsxCompilerService.install();

module.exports = tsxCompilerService.exports;
