# Module: `bootstrap/initializers/compilers/sass-compiler.js`

## Overview

- **Purpose:** Compile remote SCSS files at runtime using the Sass.js runtime that must already be loaded on the page, then inject the resulting CSS into the document.
- **Entry point:** Used by `bootstrap.js` to compile the configured styles (`styles.scss`) before the app renders.

## Globals

- _None:_ exposes helpers via the shared `helpers.sassCompiler` namespace.

## Functions

- **`compileSCSS(scssFile)`** — Fetches an SCSS entry file, looks for the global `Sass` implementation, and compiles the stylesheet using whichever API is available (constructor-based, callback-based, or synchronous `compile`). Rejects with descriptive errors when Sass is missing or the compiler raises a failure.
- **`injectCSS(css)`** — Appends a `<style>` tag with the provided CSS so compiled styles get applied immediately.

## Examples

```ts
const css = await compileSCSS("styles.scss");
injectCSS(css);
```

## Related docs

- `docs/api/bootstrap/local-loader.md` and `docs/api/bootstrap/core.md` describe where these helpers fit into the bootstrap pipeline.

## Navigation

- [Bootstrap local tools README](README.md)
