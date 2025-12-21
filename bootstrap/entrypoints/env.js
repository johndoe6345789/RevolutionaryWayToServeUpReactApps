/**
 * Bootstrap entrypoint responsible for establishing proxy mode via EnvInitializer.
 */
const BaseEntryPoint = require("../interfaces/base-entrypoint.js");
const EnvInitializer = require("../services/core/env-service.js");
const EnvInitializerConfig = require("../configs/core/env.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: EnvInitializer,
  ConfigClass: EnvInitializerConfig,
  configFactory: ({ root }) => ({ global: root }),
});
entrypoint.run();
