const globalRoot = typeof globalThis !== "undefined" ? globalThis : {};
const bootstrapNamespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
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
  isCiLoggingEnabled
} = logging;
const {
  loadScript,
  normalizeProviderBase,
  resolveModuleUrl,
  probeUrl,
  setFallbackProviders
} = network;
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
  createLocalModuleLoader
} = moduleLoader;

async function loadConfig() {
  if (typeof window !== "undefined") {
    if (window.__rwtraConfig) {
      return window.__rwtraConfig;
    }
    if (window.__rwtraConfigPromise) {
      return window.__rwtraConfigPromise;
    }
  }

  const res = await fetch("config.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load config.json");
  const config = await res.json();
  if (typeof window !== "undefined") {
    window.__rwtraConfig = config;
  }
  return config;
}

async function bootstrap() {
  try {
    const config = await loadConfig();
    setFallbackProviders(config.fallbackProviders);
    setCiLoggingEnabled(detectCiLogging(config));
    if (isCiLoggingEnabled()) {
      logClient("ci:enabled", {
        config: !!config,
        href: window.location && window.location.href
      });
    }
    const entryFile = config.entry || "main.tsx";
    const scssFile = config.styles || "styles.scss";

    await loadTools(config.tools || []);

    const css = await compileSCSS(scssFile);
    injectCSS(css);

    const registry = await loadModules(config.modules || []);
    const entryDir = entryFile.includes("/")
      ? entryFile.slice(0, entryFile.lastIndexOf("/"))
      : "";
    const localLoader = createLocalModuleLoader(entryDir);
    const requireFn = createRequire(
      registry,
      config,
      entryDir,
      localLoader
    );

    const App = await compileTSX(entryFile, requireFn, entryDir);

    frameworkRender(config, registry, App);
    logClient("bootstrap:success", { entryFile, scssFile });
  } catch (err) {
    console.error(err);
    logClient("bootstrap:error", {
      message: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined
    });
    const root = document.getElementById("root");
    if (root) {
      root.textContent =
        "Bootstrap error: " + (err && err.message ? err.message : err);
    }
  }
}

const bootstrapExports = {
  loadConfig,
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
  bootstrap
};

helpersNamespace.exports = bootstrapExports;

if (isCommonJs) {
  module.exports = bootstrapExports;
}

const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";
if (isBrowser) {
  window.__rwtraLog = logClient;
  window.addEventListener("error", (event) => {
    logClient("window:error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event && event.reason ? event.reason : "unknown";
    logClient("window:unhandledrejection", {
      reason: serializeForLog(reason)
    });
  });
}
if (isBrowser && !window.__RWTRA_BOOTSTRAP_TEST_MODE__) {
  bootstrap();
}
