const TsxCompilerService = require("./tsx-compiler-service.js");

const tsxCompilerService = new TsxCompilerService();
tsxCompilerService.initialize();
tsxCompilerService.install();

module.exports = tsxCompilerService.exports;
