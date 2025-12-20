const globalRoot =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : {};
const bootstrapNamespace =
  globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
const helpersNamespace = bootstrapNamespace.helpers || (bootstrapNamespace.helpers = {});
const isCommonJs = typeof module !== "undefined" && module.exports;

const logging = isCommonJs
  ? require("./bootstrap/cdn/logging.js")
  : helpersNamespace.logging;
const network = isCommonJs
  ? require("./bootstrap/cdn/network.js")
  : helpersNamespace.network;
const moduleLoader = isCommonJs
  ? require("./bootstrap/module-loader.js")
  : helpersNamespace.moduleLoader;

const {
  setCiLoggingEnabled,
  detectCiLogging,
  logClient,
  serializeForLog,
  isCiLoggingEnabled,
} = logging;

const BootstrapConfigLoader = require("./bootstrap/config-loader.js");
const BootstrapConfigLoaderConfig = require("./bootstrap/configs/bootstrap-config-loader.js");
const LoggingManager = require("./bootstrap/logging-manager.js");
const LoggingManagerConfig = require("./bootstrap/configs/logging-manager.js");
const Bootstrapper = require("./bootstrap/bootstrapper.js");
const BootstrapperConfig = require("./bootstrap/configs/bootstrapper.js");

const configLoader = new BootstrapConfigLoader(new BootstrapConfigLoaderConfig());
const loggingManager = new LoggingManager(
  new LoggingManagerConfig({ logClient, serializeForLog })
);
const bootstrapper = new Bootstrapper(
  new BootstrapperConfig({
    configLoader,
    logging: {
      setCiLoggingEnabled,
      detectCiLogging,
      logClient,
      serializeForLog,
      isCiLoggingEnabled,
    },
    network,
    moduleLoader,
  })
);

configLoader.initialize();
loggingManager.initialize();
bootstrapper.initialize();

const {
  loadTools,
  makeNamespace,
  loadModules,
  loadDynamicModule,
  createRequire,
  compileSCSS,
  injectCSS,
  collectDynamicModuleImports,
  preloadDynamicModulesFromSource,
  collectModuleSpecifiers,
  preloadModulesFromSource,
  compileTSX,
  frameworkRender,
  loadScript,
} = moduleLoader;
const { normalizeProviderBase, probeUrl, resolveModuleUrl } = network;

const bootstrapExports = {
  loadConfig: configLoader.loadConfig.bind(configLoader),
  loadScript,
  normalizeProviderBase,
  probeUrl,
  resolveModuleUrl,
  loadTools,
  makeNamespace,
  loadModules,
  loadDynamicModule,
  createRequire,
  compileSCSS,
  injectCSS,
  collectDynamicModuleImports,
  preloadDynamicModulesFromSource,
  collectModuleSpecifiers,
  preloadModulesFromSource,
  compileTSX,
  frameworkRender,
  bootstrap: () => bootstrapper.bootstrap(),
};

helpersNamespace.exports = bootstrapExports;
if (isCommonJs) {
  module.exports = bootstrapExports;
}

const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";
if (isBrowser) {
  loggingManager.install(window);
}

if (isBrowser && !window.__RWTRA_BOOTSTRAP_TEST_MODE__) {
  bootstrapper.bootstrap();
}
