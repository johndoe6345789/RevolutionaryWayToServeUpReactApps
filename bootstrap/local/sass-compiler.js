(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});
  const isCommonJs = typeof module !== "undefined" && module.exports;

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

  const exports = { compileSCSS, injectCSS };

  if (helpers) {
    helpers.sassCompiler = exports;
  }
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
