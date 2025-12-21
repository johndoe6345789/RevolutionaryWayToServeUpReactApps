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
