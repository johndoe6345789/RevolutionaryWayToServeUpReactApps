const TsxCompilerService = require("../services/local/tsx-compiler-service.js");

const tsxCompilerService = new TsxCompilerService();
tsxCompilerService.initialize();
tsxCompilerService.install();

module.exports = tsxCompilerService.exports;
