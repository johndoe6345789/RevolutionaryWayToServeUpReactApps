import ServiceRegistry = require("../services/service-registry.js");

export = EnvInitializerConfig;

declare class EnvInitializerConfig {
  constructor(options?: { global?: any; serviceRegistry?: ServiceRegistry });
  global?: any;
  serviceRegistry?: ServiceRegistry;
}
