(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});
  const isCommonJs = typeof module !== "undefined" && module.exports;

  const LOCAL_MODULE_EXTENSIONS = ["", ".tsx", ".ts", ".jsx", ".js"];

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

  function resolveLocalModuleBase(name, baseDir, currentHref) {
    const normalizedBase = normalizeDir(baseDir);
    const href =
      currentHref ||
      (typeof location !== "undefined" ? location.href : "http://localhost/");
    const baseUrl = new URL(
      normalizedBase ? `${normalizedBase}/` : "./",
      href
    );
    const resolvedUrl = new URL(name, baseUrl);
    return resolvedUrl.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
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

  const exports = {
    isLocalModule,
    normalizeDir,
    makeAliasKey,
    resolveLocalModuleBase,
    getModuleDir,
    hasKnownExtension,
    getCandidateLocalPaths
  };

  helpers.localPaths = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
