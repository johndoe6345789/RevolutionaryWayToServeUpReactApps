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
    addBase(rule.provider || "unpkg.com");
    if (rule.production_provider) addBase(rule.production_provider);
    if (rule.allowJsDelivr !== false) {
      for (const fallback of getFallbackProviders()) {
        addBase(fallback);
      }
    }

    const pkg = rule.package || rule.prefix.replace(/\/\*?$/, "");
    const version = rule.version ? "@" + rule.version : "";
    const fileName = (rule.filePattern || "{icon}.js").replace("{icon}", icon);

    const candidates = [];
    for (const base of bases) {
      const packageRoot = base + pkg + version;
      candidates.push(packageRoot + "/" + fileName);
      candidates.push(packageRoot + "/umd/" + fileName);
      candidates.push(packageRoot + "/dist/" + fileName);
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

    registry[name] = makeNamespace(globalObj);
    logClient("dynamic-module:loaded", {
      name,
      url: foundUrl,
      global: globalName
    });
    return registry[name];
  }

  function makeNamespace(globalObj) {
    const ns = { default: globalObj, __esModule: true };
    for (const k in globalObj) {
      if (Object.prototype.hasOwnProperty.call(globalObj, k)) {
        ns[k] = globalObj[k];
      }
    }
    return ns;
  }

  const exports = {
    loadDynamicModule
  };

  helpers.dynamicModules = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
