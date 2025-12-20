const SassCompilerService = require("../services/local/sass-compiler-service.js");

const sassCompilerService = new SassCompilerService();
sassCompilerService.initialize();
sassCompilerService.install();

module.exports = sassCompilerService.exports;
