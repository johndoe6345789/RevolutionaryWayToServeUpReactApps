# Local toolchain

These helpers bridge the CDN bootstrap with the inline compilers used to compile SCSS/TSX on the page.

## Documents

- [`local-loader.md`](local-loader.md) – Combines Sass/TSX compiler helpers, path utilities, and `createRequire`/`frameworkRender`.
- [`local-module-loader.md`](local-module-loader.md) – Fetches and compiles local TSX modules, preloads dependencies, and caches exports for the loader registry.
- [`sass-compiler.md`](sass-compiler.md) – Wraps the Sass.js runtime, compiles `styles.scss`, and injects `<style>` tags.
- [`tsx-compiler.md`](tsx-compiler.md) – Compiles TSX entries with Babel, executes the transformed bundle, and tracks the module context.

These helpers are registered on `__rwtraBootstrap.helpers` so tests and the browser runtime can call them interchangeably.
