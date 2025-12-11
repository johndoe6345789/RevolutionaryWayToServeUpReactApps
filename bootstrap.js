async function loadConfig() {
  const res = await fetch("config.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load config.json");
  return res.json();
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = url;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("Failed to load " + url));
    document.head.appendChild(el);
  });
}

// ---------- Provider helpers + URL probing ---------------------------

function normalizeProviderBase(provider) {
  if (!provider) return "";
  if (provider === "unpkg" || provider === "unpkg.com") {
    return "https://unpkg.com/";
  }
  if (provider.startsWith("http://") || provider.startsWith("https://")) {
    return provider.endsWith("/") ? provider : provider + "/";
  }
  return "https://" + provider.replace(/\/+$/, "") + "/";
}

async function probeUrl(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      cache: "no-store"
    });
    return res.ok;
  } catch (_e) {
    return false;
  }
}

async function resolveModuleUrl(mod) {
  if (mod.url) return mod.url;

  const base = normalizeProviderBase(mod.provider || "unpkg.com");
  const pkgName = mod.name;
  const versionSegment = mod.version ? "@" + mod.version : "";
  const file = (mod.file || "").replace(/^\/+/, "");
  const explicitPath = mod.path ? mod.path.replace(/^\/+/, "") : "";
  const packageRoot = base + pkgName + versionSegment;

  const candidates = [];
  if (explicitPath) {
    candidates.push(packageRoot + "/" + explicitPath);
  } else if (file) {
    candidates.push(packageRoot + "/" + file);
    candidates.push(packageRoot + "/umd/" + file);
    candidates.push(packageRoot + "/dist/" + file);
  } else {
    candidates.push(packageRoot);
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
      return url;
    }
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
  }
}

function makeNamespace(globalObj) {
  const ns = { default: globalObj };
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
  const base = normalizeProviderBase(rule.provider || "unpkg.com");
  const pkg = rule.package || rule.prefix.replace(/\/\*?$/, "");
  const version = rule.version ? "@" + rule.version : "";
  const fileName = (rule.filePattern || "{icon}.js").replace("{icon}", icon);
  const packageRoot = base + pkg + version;

  const candidates = [
    packageRoot + "/" + fileName,
    packageRoot + "/umd/" + fileName,
    packageRoot + "/dist/" + fileName
  ];

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
  return registry[name];
}

function createRequire(registry, config) {
  async function requireAsync(name) {
    if (registry[name]) return registry[name];
    const dynRules = config.dynamicModules || [];
    if (dynRules.some((r) => name.startsWith(r.prefix))) {
      return loadDynamicModule(name, config, registry);
    }
    throw new Error("Module not registered: " + name);
  }

  function require(name) {
    if (registry[name]) return registry[name];
    throw new Error(
      "Module not yet loaded: " +
        name +
        " (use a preload step via requireAsync for dynamic modules)"
    );
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
async function preloadModulesFromSource(source, requireFn) {
  if (!requireFn || typeof requireFn._async !== "function") return;
  const specs = collectModuleSpecifiers(source);
  if (!specs.length) return;

  await Promise.all(
    specs.map((name) =>
      requireFn._async(name).catch((err) => {
        console.warn("Preload failed for", name, err);
      })
    )
  );
}

// Compile a TSX entry file, after preloading all its dependencies
async function compileTSX(entryFile, requireFn) {
  const res = await fetch(entryFile, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load " + entryFile);
  const tsxCode = await res.text();

  await preloadModulesFromSource(tsxCode, requireFn);

  const compiled = Babel.transform(tsxCode, {
    filename: entryFile,
    presets: [
      ["typescript", { allExtensions: true, isTSX: true }],
      "react",
      "env"
    ],
    sourceMaps: "inline"
  }).code;

  const exports = {};
  const module = { exports };

  new Function("require", "exports", "module", compiled)(
    requireFn,
    exports,
    module
  );

  return module.exports.default || module.exports;
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
    const entryFile = config.entry || "main.tsx";
    const scssFile = config.styles || "styles.scss";

    await loadTools(config.tools || []);

    const css = await compileSCSS(scssFile);
    injectCSS(css);

    const registry = await loadModules(config.modules || []);
    const requireFn = createRequire(registry, config);

    const App = await compileTSX(entryFile, requireFn);

    frameworkRender(config, registry, App);
  } catch (err) {
    console.error(err);
    const root = document.getElementById("root");
    if (root) {
      root.textContent =
        "Bootstrap error: " + (err && err.message ? err.message : err);
    }
  }
}

bootstrap();
