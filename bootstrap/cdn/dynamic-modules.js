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
    probeUrl = () => false,
    normalizeProviderBase = () => "",
    getFallbackProviders = () => []
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

  async function loadDynamicModule(name, config, registry) {
    const dynRules = config.dynamicModules || [];
    const rule = dynRules.find((r) => name.startsWith(r.prefix));
    if (!rule) {
      throw new Error("No dynamic rule for module: " + name);
    }

    const icon = name.slice(rule.prefix.length);
    const bases = [];
    const addBase = (b) => {
      if (!b) return;
      const normalized = normalizeProviderBase(b);
      if (!bases.includes(normalized)) bases.push(normalized);
    };
    const host =
      typeof window !== "undefined" ? window.location.hostname : "";
    const isCiLike = host === "127.0.0.1" || host === "localhost";
    const addProvidersInOrder = (providers) => {
      for (const prov of providers) {
        addBase(prov);
      }
    };
    if (isCiLike) {
      addProvidersInOrder([
        rule.ci_provider,
        rule.provider,
        rule.production_provider
      ]);
    } else {
      addProvidersInOrder([
        rule.production_provider,
        rule.provider,
        rule.ci_provider
      ]);
    }
    if (!bases.length) {
      addBase(rule.provider || rule.production_provider || "https://unpkg.com");
    }
    if (rule.allowJsDelivr !== false) {
      for (const fallback of getFallbackProviders()) {
        addBase(fallback);
      }
    }

    const pkg = rule.package || rule.prefix.replace(/\/\*?$/, "");
    const version = rule.version ? "@" + rule.version : "";
    const rawFile = (rule.filePattern || "{icon}.js").replace("{icon}", icon);
    const prefix = (rule.pathPrefix || "").replace(/^\/+|\/+$/g, "");
    const combinedPath = [prefix, rawFile].filter(Boolean).join("/");

    const candidates = [];
    for (const base of bases) {
      const packageRoot = base + pkg + version;
      if (combinedPath) {
        candidates.push(packageRoot + "/" + combinedPath);
        candidates.push(packageRoot + "/umd/" + combinedPath);
        candidates.push(packageRoot + "/dist/" + combinedPath);
      } else {
        candidates.push(packageRoot);
      }
    }

    const seen = new Set();
    const urls = [];
    for (const c of candidates) {
      if (!seen.has(c)) {
        seen.add(c);
        urls.push(c);
      }
    }

    let foundUrl = null;
    for (const url of urls) {
      if (await probeUrl(url)) {
        foundUrl = url;
        break;
      }
    }

    if (!foundUrl) {
      throw new Error(
        "Unable to resolve icon module " +
          name +
          " (tried: " +
          urls.join(", ") +
          ")"
      );
    }

    const format = (rule.format || rule.type || "global").toLowerCase();
    let namespace;
    if (format === "esm" || format === "module") {
      const moduleExports = await import(foundUrl);
      namespace = createNamespace(moduleExports);
      logClient("dynamic-module:loaded", {
        name,
        url: foundUrl,
        format
      });
      registry[name] = namespace;
      return registry[name];
    }

    await loadScript(foundUrl);

    const globalName = (rule.globalPattern || "{icon}").replace("{icon}", icon);
    const globalObj = globalName.includes(".")
      ? globalName.split(".").reduce((obj, part) => (obj ? obj[part] : undefined), window)
      : window[globalName];

    if (!globalObj) {
      throw new Error(
        "Global for icon " + name + " not found: " + globalName
      );
    }

    namespace = createNamespace(globalObj);
    registry[name] = namespace;
    logClient("dynamic-module:loaded", {
      name,
      url: foundUrl,
      global: globalName,
      format
    });
    return registry[name];
  }

  function makeNamespace(globalObj) {
    return createNamespace(globalObj);
  }

  const exports = {
    loadDynamicModule
  };

  helpers.dynamicModules = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
