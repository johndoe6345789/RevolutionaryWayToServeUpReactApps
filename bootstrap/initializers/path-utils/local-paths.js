const LocalPathsService = require("../services/local/local-paths-service.js");

const localPathsService = new LocalPathsService();
localPathsService.initialize();
localPathsService.install();

module.exports = localPathsService.exports;
