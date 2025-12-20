/**
 * Bootstrap entrypoint responsible for establishing proxy mode via EnvInitializer.
 */
const GlobalRootHandler = require("../constants/global-root-handler.js");
const EnvInitializer = require("./services/core/env-service.js");
const EnvInitializerConfig = require("./configs/env.js");
const serviceRegistry = require("./services/service-registry-instance.js");

const rootHandler = new GlobalRootHandler();
const envInitializer = new EnvInitializer(
  new EnvInitializerConfig({ serviceRegistry, global: rootHandler.root })
);
envInitializer.initialize();
