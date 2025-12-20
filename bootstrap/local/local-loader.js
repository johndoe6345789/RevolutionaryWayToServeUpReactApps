const LocalLoaderService = require("./local-loader-service.js");

const localLoaderService = new LocalLoaderService();
localLoaderService.initialize();
localLoaderService.install();

module.exports = localLoaderService.exports;
