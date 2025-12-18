(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});

  const isCommonJs = typeof module !== "undefined" && module.exports;
  const logging = isCommonJs
    ? require("./logging.js")
    : helpers.logging;
  const network = isCommonJs
    ? require("./network.js")
    : helpers.network;

  const { logClient = () => {} } = logging || {};
  const {
    loadScript = () => Promise.resolve(),
    resolveModuleUrl = () => ""
  } = network || {};

  function createNamespace(value) {
    if (value && typeof value === "object" && value.__esModule) {
      return value;
    }
    const ns = { __esModule: true };
    if (value && typeof value === "object") {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          ns[key] = value[key];
        }
      }
    }
    if (!Object.prototype.hasOwnProperty.call(ns, "default")) {
      ns.default = value;
    }
    const base = ns.default;
    if (base && (typeof base === "object" || typeof base === "function")) {
      for (const key of Object.getOwnPropertyNames(base)) {
        if (
          key === "default" ||
          key === "__esModule" ||
          Object.prototype.hasOwnProperty.call(ns, key)
        ) {
          continue;
        }
        ns[key] = base[key];
      }
    }
    return ns;
  }

  async function ensureGlobalFromNamespace(name, globalName, namespace) {
    if (!namespace) return;
    if (globalName && typeof window !== "undefined") {
      const existing = window[globalName];
      if (!existing || existing === namespace.default) {
        window[globalName] = namespace.default;
      }
    }
  }

  function loadTools(tools) {
    return Promise.all(
      (tools || []).map(async (tool) => {
        const url = await resolveModuleUrl(tool);
        await loadScript(url);
        if (!window[tool.global]) {
          throw new Error(
            "Tool global not found after loading " + url + ": " + tool.global
          );
        }
        logClient("tool:loaded", { name: tool.name, url, global: tool.global });
      })
    );
  }

  function makeNamespace(globalObj) {
    return createNamespace(globalObj);
  }

  async function loadModules(modules) {
    const registry = {};
    for (const mod of modules) {
      const url = await resolveModuleUrl(mod);
      const format = (mod.format || mod.type || "global").toLowerCase();
      let namespace;
      if (format === "esm" || format === "module") {
        const moduleExports = await import(url);
        namespace = createNamespace(moduleExports);
        await ensureGlobalFromNamespace(mod.name, mod.global, namespace);
      } else {
        await loadScript(url);
        const globalObj = window[mod.global];
        if (!globalObj) {
          throw new Error(
            "Module global not found after loading " + url + ": " + mod.global
          );
        }
        namespace = createNamespace(globalObj);
      }
      registry[mod.name] = namespace;
      logClient("module:loaded", {
        name: mod.name,
        url,
        global: mod.global,
        format
      });
    }
    return registry;
  }

  const exports = {
    loadTools,
    makeNamespace,
    loadModules
  };

  helpers.tools = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
