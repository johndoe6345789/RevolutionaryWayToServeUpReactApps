const DynamicModulesService = require("../services/cdn/dynamic-modules-service.js");
const DynamicModulesConfig = require("../configs/dynamic-modules.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const globalRoot = require("../constants/global-root.js");

const namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
const dynamicModulesService = new DynamicModulesService(
  new DynamicModulesConfig({ serviceRegistry, namespace })
);
dynamicModulesService.initialize();
dynamicModulesService.install();

module.exports = dynamicModulesService.exports;
