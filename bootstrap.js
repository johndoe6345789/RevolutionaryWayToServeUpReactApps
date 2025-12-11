let ciLoggingEnabled = false;
const CI_LOG_QUERY_PARAM = "ci";
const JSDELIVR_BASE = "https://cdn.jsdelivr.net/npm/";

function setCiLoggingEnabled(enabled) {
  ciLoggingEnabled = !!enabled;
}

function detectCiLogging(config) {
  if (typeof window !== "undefined") {
    if (typeof window.__RWTRA_CI_MODE__ === "boolean") {
      return window.__RWTRA_CI_MODE__;
    }
    const params = new URLSearchParams(window.location.search || "");
    const q = params.get(CI_LOG_QUERY_PARAM);
    if (q && (q === "1" || q.toLowerCase() === "true")) {
      return true;
    }
  }
  if (config && config.ciLogging === true) return true;
  return false;
}

async function loadConfig() {
  const res = await fetch("config.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load config.json");
  return res.json();
}

const CLIENT_LOG_ENDPOINT = "/__client-log";

function serializeForLog(value) {
  if (value instanceof Error) {
    return { message: value.message, stack: value.stack };
  }
  if (typeof value === "object") {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_err) {
      return { type: typeof value, note: "unserializable" };
    }
  }
  return value;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logClient(event, detail, level = "info") {
  const isErrorLevel = level === "error" || level === "warn";
  if (!ciLoggingEnabled && !isErrorLevel) return;
  if (typeof window === "undefined") return;
  try {
    const payload = {
      event,
      detail: serializeForLog(detail),
      ts: new Date().toISOString(),
      href: window.location && window.location.href
    };
    const body = JSON.stringify(payload);
    const sendBeacon =
      typeof navigator !== "undefined" &&
      navigator &&
      typeof navigator.sendBeacon === "function";
    if (sendBeacon) {
      navigator.sendBeacon(
        CLIENT_LOG_ENDPOINT,
        new Blob([body], { type: "application/json" })
      );
    } else if (typeof fetch === "function") {
      fetch(CLIENT_LOG_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body
      }).catch(() => {});
    }
    if (typeof console !== "undefined" && console.info) {
      const logFn =
        level === "error"
          ? console.error
          : level === "warn"
            ? console.warn
            : console.info;
      logFn("[bootstrap]", event, detail);
    }
  } catch (_err) {
    // ignore logging failures to avoid interfering with app execution
  }
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = url;
    el.onload = () => {
      logClient("loadScript:success", { url });
      resolve();
    };
    el.onerror = () => {
      logClient("loadScript:error", { url });
      reject(new Error("Failed to load " + url));
    };
    document.head.appendChild(el);
  });
}

// ---------- Provider helpers + URL probing ---------------------------

function normalizeProviderBase(provider) {
  if (!provider) return "";
  if (provider === "unpkg" || provider === "unpkg.com") {
    return "https://unpkg.com/";
  }
  if (provider.startsWith("/")) {
    return provider.endsWith("/") ? provider : provider + "/";
  }
  if (provider.startsWith("http://") || provider.startsWith("https://")) {
    return provider.endsWith("/") ? provider : provider + "/";
  }
  return "https://" + provider.replace(/\/+$/, "") + "/";
}

function resolveProvider(mod) {
  const hasDualProviders = mod.ci_provider || mod.production_provider;
  if (hasDualProviders) {
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isCiLike = host === "127.0.0.1" || host === "localhost";
    return isCiLike ? mod.ci_provider || mod.production_provider : mod.production_provider || mod.ci_provider;
  }
  return mod.provider || mod.ci_provider || mod.production_provider || "unpkg.com";
}

function shouldRetryStatus(status) {
  return status === 0 || status >= 500 || status === 429;
}

async function probeUrl(url, opts = {}) {
  let { retries = 2, backoffMs = 300, allowGetFallback = true } = opts;
  let attempt = 0;

  while (true) {
    let lastStatus = 0;
    try {
      const res = await fetch(url, {
        method: "HEAD",
        cache: "no-store"
      });
      lastStatus = res.status;
      if (res.ok) return true;

      if (allowGetFallback && (res.status === 405 || res.status === 403)) {
        const getRes = await fetch(url, { method: "GET", cache: "no-store" });
        lastStatus = getRes.status;
        if (getRes.ok) return true;
      }

      if (retries > 0 && shouldRetryStatus(lastStatus)) {
        retries -= 1;
        await wait(backoffMs * Math.pow(1.5, attempt++));
        continue;
      }

      if (ciLoggingEnabled) {
        logClient("probe:fail", { url, status: lastStatus });
      }
      return false;
    } catch (err) {
      if (retries > 0) {
        retries -= 1;
        await wait(backoffMs * Math.pow(1.5, attempt++));
        continue;
      }
      if (ciLoggingEnabled) {
        logClient("probe:fail", { url, error: err && err.message });
      }
      return false;
    }
  }
}

async function resolveModuleUrl(mod) {
  if (mod.url) return mod.url;

  function collectBases() {
    const bases = [];
    const addBase = (b) => {
      if (!b) return;
      const normalized = normalizeProviderBase(b);
      if (!bases.includes(normalized)) bases.push(normalized);
    };

    addBase(resolveProvider(mod));
    addBase(mod.provider);
    addBase(mod.ci_provider);
    addBase(mod.production_provider);
    if (mod.allowJsDelivr !== false) addBase(JSDELIVR_BASE);
    return bases;
  }

  const bases = collectBases();
  const pkgName = mod.name;
  const versionSegment = mod.version ? "@" + mod.version : "";
  const file = (mod.file || "").replace(/^\/+/, "");
  const pathPrefix = (mod.pathPrefix || "").replace(/^\/+|\/+$/g, "");
  const explicitPath = mod.path ? mod.path.replace(/^\/+/, "") : "";
  const combinedPath = [pathPrefix, file].filter(Boolean).join("/");

  const candidates = [];
  for (const base of bases) {
    const packageRoot = base + pkgName + versionSegment;
    if (explicitPath) {
      candidates.push(packageRoot + "/" + explicitPath);
    } else if (combinedPath) {
      candidates.push(packageRoot + "/" + combinedPath);
      candidates.push(packageRoot + "/umd/" + combinedPath);
      candidates.push(packageRoot + "/dist/" + combinedPath);
    } else {
      candidates.push(packageRoot);
    }
  }

  // De-dupe candidates
  const seen = new Set();
  const unique = [];
  for (const c of candidates) {
    if (!seen.has(c)) {
      seen.add(c);
      unique.push(c);
    }
  }

  for (const url of unique) {
    if (await probeUrl(url)) {
      if (ciLoggingEnabled) {
        logClient("resolve:success", { name: mod.name, url });
      }
      return url;
    }
  }

  if (ciLoggingEnabled) {
    logClient("resolve:fail", { name: mod.name, tried: unique });
  }

  throw new Error(
    "Unable to resolve URL for module " +
      (mod.name || "<unnamed>") +
      " (tried: " +
      unique.join(", ") +
      ")"
  );
}

// ---------- Tools & modules -----------------------------------------

async function loadTools(tools) {
  for (const tool of tools) {
    const url = await resolveModuleUrl(tool);
    await loadScript(url);
    if (!window[tool.global]) {
      throw new Error(
        "Tool global not found after loading " + url + ": " + tool.global
      );
    }
    logClient("tool:loaded", { name: tool.name, url, global: tool.global });
  }
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

async function loadModules(modules) {
  const registry = {};
  for (const mod of modules) {
    const url = await resolveModuleUrl(mod);
    await loadScript(url);
    const globalObj = window[mod.global];
    if (!globalObj) {
      throw new Error(
        "Module global not found after loading " + url + ": " + mod.global
      );
    }
    registry[mod.name] = makeNamespace(globalObj);
    logClient("module:loaded", {
      name: mod.name,
      url,
      global: mod.global
    });
  }
  return registry;
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
  addBase(rule.provider || "unpkg.com");
  if (rule.production_provider) addBase(rule.production_provider);
  if (rule.allowJsDelivr !== false) addBase(JSDELIVR_BASE);

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

function createRequire(
  registry,
  config,
  entryDir = "",
  localModuleLoader,
  dynamicModuleLoader
) {
  let resolvedEntryDir = "";
  let resolvedDynamicModuleLoader = dynamicModuleLoader;

  if (typeof entryDir === "function" && arguments.length === 3) {
    resolvedDynamicModuleLoader = entryDir;
  } else {
    resolvedEntryDir = entryDir || "";
  }

  resolvedDynamicModuleLoader = resolvedDynamicModuleLoader || loadDynamicModule;

  function require(name) {
    if (registry[name]) return registry[name];
    throw new Error(
      "Module not yet loaded: " +
        name +
        " (use a preload step via requireAsync for dynamic modules)"
    );
  }

  async function requireAsync(name, baseDir) {
    if (registry[name]) return registry[name];
    if (localModuleLoader && isLocalModule(name)) {
      return localModuleLoader(
        name,
        baseDir || resolvedEntryDir,
        require,
        registry
      );
    }
    const dynRules = config.dynamicModules || [];
    if (dynRules.some((r) => name.startsWith(r.prefix))) {
      return resolvedDynamicModuleLoader(name, config, registry);
    }
    throw new Error("Module not registered: " + name);
  }

  require._async = requireAsync;
  return require;
}

async function compileSCSS(scssFile) {
  const res = await fetch(scssFile, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load " + scssFile);
  const scss = await res.text();
  const SassImpl = window.Sass;
  if (!SassImpl) {
    throw new Error("Sass global not found (is your Sass tool loaded?)");
  }

  return new Promise((resolve, reject) => {
    try {
      if (typeof SassImpl === "function") {
        const sass = new SassImpl();
        sass.compile(scss, (result) => {
          if (result.status === 0) {
            resolve(result.text);
          } else {
            reject(
              new Error(result.formatted || "Sass (sass.js) compile error")
            );
          }
        });
        return;
      }

      if (typeof SassImpl.compile === "function") {
        if (SassImpl.compile.length >= 2) {
          SassImpl.compile(scss, (result) => {
            if (result.status === 0) {
              resolve(result.text);
            } else {
              reject(
                new Error(result.formatted || "Sass (object) compile error")
              );
            }
          });
          return;
        }

        const result = SassImpl.compile(scss);
        const css = typeof result === "string" ? result : result.css || "";
        resolve(css);
        return;
      }

      reject(
        new Error(
          "Unsupported Sass implementation: neither constructor nor usable compile() found"
        )
      );
    } catch (e) {
      reject(e);
    }
  });
}

function injectCSS(css) {
  const tag = document.createElement("style");
  tag.textContent = css;
  document.head.appendChild(tag);
}

function collectDynamicModuleImports(source, config) {
  const dynRules = config.dynamicModules || [];
  if (!dynRules.length) return [];
  const prefixes = dynRules.map((r) => r.prefix);
  const results = new Set();

  function maybeAdd(spec) {
    if (!spec) return;
    for (const p of prefixes) {
      if (spec.startsWith(p)) {
        results.add(spec);
        break;
      }
    }
  }

  const importRe = /import\s+(?:[^'"]+from\s+)?["']([^"']+)["']/g;
  let m;
  while ((m = importRe.exec(source))) {
    maybeAdd(m[1]);
  }

  const requireRe = /require\(\s*["']([^"']+)["']\s*\)/g;
  while ((m = requireRe.exec(source))) {
    maybeAdd(m[1]);
  }

  return Array.from(results);
}

async function preloadDynamicModulesFromSource(source, requireFn, config) {
  if (!requireFn || typeof requireFn._async !== "function") {
    return;
  }

  const toPreload = collectDynamicModuleImports(source, config);
  if (!toPreload.length) return;

  await Promise.all(
    toPreload.map((name) =>
      requireFn
        ._async(name)
        .catch((err) => console.warn("Preload failed for", name, err))
    )
  );
}

// Scan TS/TSX source code for ES imports and CommonJS require() calls
function collectModuleSpecifiers(source) {
  const specs = new Set();
  const importRe = /import\s+(?:[^'"]+from\s+)?["']([^"']+)["']/g;
  let m;
  while ((m = importRe.exec(source))) {
    specs.add(m[1]);
  }

  const requireRe = /require\(\s*["']([^"']+)["']\s*\)/g;
  while ((m = requireRe.exec(source))) {
    specs.add(m[1]);
  }

  return Array.from(specs);
}

// Preload every imported / required module via requireFn._async
async function preloadModulesFromSource(source, requireFn, baseDir = "") {
  if (!requireFn || typeof requireFn._async !== "function") return;
  const specs = collectModuleSpecifiers(source);
  if (!specs.length) return;

  await Promise.all(
    specs.map((name) =>
      requireFn._async(name, baseDir).catch((err) => {
        console.warn("Preload failed for", name, err);
      })
    )
  );
}

// Compile a TSX entry file, after preloading all its dependencies
async function compileTSX(entryFile, requireFn, entryDir = "") {
  const res = await fetch(entryFile, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load " + entryFile);
  const tsxCode = await res.text();

  await preloadModulesFromSource(tsxCode, requireFn, entryDir);

  const compiled = executeModuleSource(tsxCode, entryFile, entryDir, requireFn);
  logClient("tsx:compiled", { entryFile, entryDir });
  return compiled;
}

const LOCAL_MODULE_EXTENSIONS = ["", ".tsx", ".ts", ".jsx", ".js"];
const moduleContextStack = [];

function isLocalModule(name) {
  return name.startsWith(".") || name.startsWith("/");
}

function normalizeDir(dir) {
  if (!dir) return "";
  return dir.replace(/^\/+/, "").replace(/\/+$/, "");
}

function makeAliasKey(name, baseDir) {
  return normalizeDir(baseDir) + "|" + name;
}

function resolveLocalModuleBase(name, baseDir) {
  const normalizedBase = normalizeDir(baseDir);
  const baseUrl = normalizedBase
    ? `${location.origin}/${normalizedBase}/`
    : `${location.origin}/`;
  const resolvedUrl = new URL(name, baseUrl);
  return resolvedUrl.pathname.replace(/^\//, "");
}

function getModuleDir(filePath) {
  const idx = filePath.lastIndexOf("/");
  return idx === -1 ? "" : filePath.slice(0, idx);
}

function hasKnownExtension(path) {
  return /\.(tsx|ts|jsx|js)$/.test(path);
}

function getCandidateLocalPaths(basePath) {
  const normalizedBase = basePath.replace(/\/+$/, "");
  const seen = new Set();
  const candidates = [];

  function add(candidate) {
    if (!candidate) return;
    if (seen.has(candidate)) return;
    seen.add(candidate);
    candidates.push(candidate);
  }

  add(normalizedBase);
  if (!hasKnownExtension(normalizedBase)) {
    for (const ext of LOCAL_MODULE_EXTENSIONS) {
      add(normalizedBase + ext);
    }
    for (const ext of LOCAL_MODULE_EXTENSIONS) {
      add(`${normalizedBase}/index${ext}`);
    }
  }

  return candidates;
}

function transformSource(source, filePath) {
  return Babel.transform(source, {
    filename: filePath,
    presets: [
      ["typescript", { allExtensions: true, isTSX: true }],
      "react",
      "env"
    ],
    sourceMaps: "inline"
  }).code;
}

function executeModuleSource(source, filePath, moduleDir, requireFn) {
  const compiled = transformSource(source, filePath);
  const exports = {};
  const module = { exports };

  moduleContextStack.push({ path: filePath, dir: moduleDir });
  try {
    new Function("require", "exports", "module", compiled)(
      requireFn,
      exports,
      module
    );
  } finally {
    moduleContextStack.pop();
  }

  return module.exports.default || module.exports;
}

function createLocalModuleLoader(entryDir) {
  const moduleCache = new Map();
  const modulePromises = new Map();
  const aliasToCanonical = new Map();

  return async function loadLocalModule(name, baseDir, requireFn, registry) {
    const normalizedBase = normalizeDir(baseDir || entryDir || "");
    const aliasKey = makeAliasKey(name, normalizedBase);
    const existingCanonical = aliasToCanonical.get(aliasKey);

    if (existingCanonical && registry[existingCanonical]) {
      const cached = registry[existingCanonical];
      registry[name] = cached;
      return cached;
    }

    const basePath = resolveLocalModuleBase(name, normalizedBase);
    const { source, resolvedPath } = await fetchLocalModuleSource(basePath);
    const moduleDir = getModuleDir(resolvedPath);
    aliasToCanonical.set(aliasKey, resolvedPath);

    if (moduleCache.has(resolvedPath)) {
      const cached = moduleCache.get(resolvedPath);
      registry[resolvedPath] = cached;
      registry[name] = cached;
      return cached;
    }

    if (modulePromises.has(resolvedPath)) {
      const pending = await modulePromises.get(resolvedPath);
      registry[resolvedPath] = pending;
      registry[name] = pending;
      return pending;
    }

    const loadPromise = (async () => {
      await preloadModulesFromSource(source, requireFn, moduleDir);
      const moduleExports = executeModuleSource(
        source,
        resolvedPath,
        moduleDir,
        requireFn
      );
      moduleCache.set(resolvedPath, moduleExports);
      registry[resolvedPath] = moduleExports;
      return moduleExports;
    })();

    modulePromises.set(resolvedPath, loadPromise);
    try {
      const result = await loadPromise;
      registry[name] = result;
      return result;
    } finally {
      modulePromises.delete(resolvedPath);
    }
  };
}

async function fetchLocalModuleSource(basePath) {
  const candidates = getCandidateLocalPaths(basePath);

  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, { cache: "no-store" });
      if (res.ok) {
        return {
          source: await res.text(),
          resolvedPath: candidate
        };
      }
    } catch (err) {
      // ignore and try next candidate
    }
  }

  logClient("local-module:failed", { basePath, candidates });
  throw new Error(
    "Failed to load local module: " +
      basePath +
      " (tried: " +
      candidates.join(", ") +
      ")"
  );
}

function frameworkRender(config, registry, App) {
  const rootId = config.render?.rootId || "root";
  const rootEl = document.getElementById(rootId);
  if (!rootEl) throw new Error("Root element not found: #" + rootId);

  const domModuleName = config.render?.domModule;
  const reactModuleName = config.render?.reactModule;
  const domModule = domModuleName ? registry[domModuleName] : null;
  const reactModule = reactModuleName ? registry[reactModuleName] : null;
  if (!domModule) throw new Error("DOM render module missing: " + domModuleName);
  if (!reactModule) throw new Error("React module missing: " + reactModuleName);

  const createRootFn = domModule[config.render.createRoot];
  if (!createRootFn) {
    throw new Error("createRoot not found: " + config.render.createRoot);
  }

  const root = createRootFn(rootEl);
  const renderMethod = config.render.renderMethod || "render";
  if (typeof root[renderMethod] !== "function") {
    throw new Error("Render method not found: " + renderMethod);
  }

  root[renderMethod](reactModule.createElement(App));
}

async function bootstrap() {
  try {
    const config = await loadConfig();
    setCiLoggingEnabled(detectCiLogging(config));
    if (ciLoggingEnabled) {
      logClient("ci:enabled", { config: !!config, href: window.location && window.location.href });
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

if (typeof module !== "undefined" && module.exports) {
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
