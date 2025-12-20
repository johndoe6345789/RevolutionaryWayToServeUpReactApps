const EnvInitializer = require("./services/core/env-service.js");
const EnvInitializerConfig = require("./configs/env.js");
const serviceRegistry = require("./services/service-registry-instance.js");

const envInitializer = new EnvInitializer(
  new EnvInitializerConfig({ serviceRegistry })
);
envInitializer.initialize();
