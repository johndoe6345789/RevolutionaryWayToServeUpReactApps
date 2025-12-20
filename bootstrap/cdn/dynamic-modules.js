const DynamicModulesService = require("../services/cdn/dynamic-modules-service.js");
const DynamicModulesConfig = require("../configs/dynamic-modules.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const GlobalRootHandler = require("../constants/global-root-handler.js");

const rootHandler = new GlobalRootHandler();
const dynamicModulesService = new DynamicModulesService(
  new DynamicModulesConfig({
    serviceRegistry,
    namespace: rootHandler.getNamespace(),
  })
);
dynamicModulesService.initialize();
dynamicModulesService.install();

module.exports = dynamicModulesService.exports;
