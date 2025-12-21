// Register factory loaders for lazy loading
require("./bootstrap/registries/register-factory-loaders.js").registerFactoryLoaders();

const BootstrapApp = require("./bootstrap/bootstrap-app.js");

const app = new BootstrapApp();
app.initialize();

const bootstrapExports = app.getExports();
app.helpersNamespace.exports = bootstrapExports;
if (app.isCommonJs) {
  module.exports = bootstrapExports;
}

if (BootstrapApp.isBrowser()) {
  app.installLogging(window);
  app.runBootstrapper(window);
}
