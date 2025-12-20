/**
 * Initializes the CDN tools helper and exposes it through the shared bootstrap namespace.
 */
const ToolsLoaderService = require("../services/cdn/tools-service.js");
const ToolsLoaderConfig = require("../configs/tools.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const GlobalRootHandler = require("../constants/global-root-handler.js");

const rootHandler = new GlobalRootHandler();
const namespace = rootHandler.getNamespace();
const toolsLoaderService = new ToolsLoaderService(
  new ToolsLoaderConfig({ serviceRegistry, namespace })
);
toolsLoaderService.initialize();
toolsLoaderService.install();

module.exports = toolsLoaderService.exports;
