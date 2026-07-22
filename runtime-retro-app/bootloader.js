(function runtimeBootloader(global) {
  "use strict";

  const moduleCache = new Map();
  const sourceCache = new Map();
  const extensions = ["", ".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"];
  const externals = {
    react: global.React,
    "react-dom/client": global.ReactDOM,
  };

  async function compileScss() {
    const links = [...document.querySelectorAll("link[data-runtime-scss]")];
    const startedAt = performance.now();
    await Promise.all(links.map(async (link) => {
      const response = await fetch(link.href, { cache: "no-store" });
      if (!response.ok) throw new Error(`Cannot load SCSS: ${link.href}`);
      const source = await response.text();
      const result = await new Promise((resolve) => {
        global.Sass.compile(source, resolve);
      });
      if (result.status !== 0) throw new Error(result.formatted || result.message);
      const style = document.createElement("style");
      style.dataset.runtimeCompiledScss = link.getAttribute("href");
      style.textContent = result.text;
      document.head.appendChild(style);
      link.remove();
    }));
    return Math.round(performance.now() - startedAt);
  }

  function isLocal(specifier) {
    return specifier.startsWith(".") || specifier.startsWith("/");
  }

  function resolveSpecifier(specifier, importer) {
    if (!isLocal(specifier)) return specifier;
    return new URL(specifier, new URL(importer, global.location.origin)).pathname;
  }

  async function resolveSource(specifier, importer) {
    const base = resolveSpecifier(specifier, importer);
    if (sourceCache.has(base)) return sourceCache.get(base);
    for (const extension of extensions) {
      const candidate = base + extension;
      const response = await fetch(candidate, { cache: "no-store" });
      if (response.ok) {
        const record = { url: candidate, source: await response.text() };
        sourceCache.set(base, record);
        return record;
      }
    }
    throw new Error(`Cannot resolve ${specifier} from ${importer}`);
  }

  function importsFrom(source) {
    const found = new Set();
    const expression = /(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
    let match;
    while ((match = expression.exec(source)) !== null) found.add(match[1]);
    return [...found];
  }

  async function loadModule(specifier, importer = "/") {
    if (!isLocal(specifier)) {
      if (!(specifier in externals)) throw new Error(`External module is not registered: ${specifier}`);
      return externals[specifier];
    }

    const record = await resolveSource(specifier, importer);
    if (moduleCache.has(record.url)) return moduleCache.get(record.url).exports;

    const module = { exports: {} };
    moduleCache.set(record.url, module);
    const dependencies = importsFrom(record.source);
    await Promise.all(dependencies.map((dependency) => loadModule(dependency, record.url)));

    const compiled = global.Babel.transform(record.source, {
      filename: record.url,
      presets: [
        ["typescript", { allExtensions: true, isTSX: true }],
        ["react", { runtime: "classic" }],
        ["env", { modules: "commonjs", targets: { chrome: "100" } }],
      ],
      sourceMaps: "inline",
    }).code;

    function runtimeRequire(dependency) {
      if (!isLocal(dependency)) return externals[dependency];
      const resolved = resolveSpecifier(dependency, record.url);
      const cachedRecord = [...sourceCache.values()].find((item) => item.url === resolved || item.url.startsWith(resolved + ".") || item.url.startsWith(resolved + "/index."));
      if (!cachedRecord || !moduleCache.has(cachedRecord.url)) throw new Error(`Module was not preloaded: ${dependency}`);
      return moduleCache.get(cachedRecord.url).exports;
    }

    new Function("require", "exports", "module", `${compiled}\n//# sourceURL=${record.url}`)(runtimeRequire, module.exports, module);
    return module.exports;
  }

  async function boot() {
    const startedAt = performance.now();
    const scssElapsed = await compileScss();
    const appModule = await loadModule("/src/App.tsx");
    const App = appModule.default;
    const root = global.ReactDOM.createRoot(document.getElementById("root"));
    root.render(global.React.createElement(App));
    const elapsed = Math.round(performance.now() - startedAt);
    const status = document.getElementById("runtime-status");
    status.textContent = `TSX + SCSS COMPILED IN BROWSER · ${elapsed}MS`;
    status.dataset.runtimeCompiled = "true";
    global.__RUNTIME_RETRO__ = {
      compiled: true,
      elapsed,
      scssElapsed,
      modules: moduleCache.size,
    };
  }

  boot().catch((error) => {
    console.error(error);
    const status = document.getElementById("runtime-status");
    status.textContent = `BOOT FAILED · ${error.message}`;
    status.dataset.runtimeCompiled = "false";
  });
})(globalThis);
