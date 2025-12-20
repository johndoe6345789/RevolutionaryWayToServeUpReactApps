const DynamicModulesService = require("../services/cdn/dynamic-modules-service.js");
const DynamicModulesConfig = require("../configs/dynamic-modules.js");
const serviceRegistry = require("../services/service-registry-instance.js");

const dynamicModulesService = new DynamicModulesService(
  new DynamicModulesConfig({ serviceRegistry })
);
dynamicModulesService.initialize();
dynamicModulesService.install();

module.exports = dynamicModulesService.exports;
