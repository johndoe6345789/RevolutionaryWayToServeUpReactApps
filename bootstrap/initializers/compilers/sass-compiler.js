const SassCompilerService = require("../services/local/sass-compiler-service.js");
const SassCompilerConfig = require("../configs/sass-compiler.js");
const serviceRegistry = require("../services/service-registry-instance.js");

const sassCompilerService = new SassCompilerService(
  new SassCompilerConfig({ serviceRegistry })
);
sassCompilerService.initialize();
sassCompilerService.install();

module.exports = sassCompilerService.exports;
