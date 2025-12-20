const globalRoot = require("../constants/global-root.js");
const ServiceRegistry = require("./service-registry.js");

const namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
namespace.serviceRegistry = namespace.serviceRegistry || new ServiceRegistry();

module.exports = namespace.serviceRegistry;
