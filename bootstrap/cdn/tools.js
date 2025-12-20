const ToolsLoaderService = require("../services/cdn/tools-service.js");
const ToolsLoaderConfig = require("../configs/tools.js");
const serviceRegistry = require("../services/service-registry-instance.js");

const toolsLoaderService = new ToolsLoaderService(
  new ToolsLoaderConfig({ serviceRegistry })
);
toolsLoaderService.initialize();
toolsLoaderService.install();

module.exports = toolsLoaderService.exports;
