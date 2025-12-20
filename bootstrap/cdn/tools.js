const ToolsLoaderService = require("../services/cdn/tools-service.js");
const ToolsLoaderConfig = require("../configs/tools.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const globalRoot = require("../constants/global-root.js");

const namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
const toolsLoaderService = new ToolsLoaderService(
  new ToolsLoaderConfig({ serviceRegistry, namespace })
);
toolsLoaderService.initialize();
toolsLoaderService.install();

module.exports = toolsLoaderService.exports;
