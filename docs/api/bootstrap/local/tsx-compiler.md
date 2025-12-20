# Module: `bootstrap/initializers/compilers/tsx-compiler.js`

## Overview

- **Purpose:** Compile TSX entry points at runtime using the Babel runtime (assumed global as `Babel`), preload any referenced modules, and execute the compiled code inside the loader’s context.
- **Entry point:** Called from `bootstrap.js` when compiling the configured entry file (`main.tsx` or custom path).

## Globals

- `moduleContextStack` — Tracks the current module path/directory so diagnostic helpers can trace recursive requires; exported for debugging.

## Functions

- **`transformSource(source, filePath)`** — Uses Babel presets for TypeScript, React, and `env` to compile TSX to plain JS with inline source maps.
- **`executeModuleSource(source, filePath, moduleDir, requireFn)`** — Wraps the compiled bundle with `require`, `exports`, and `module`, pushes the context onto the stack, and returns the module’s default export.
- **`compileTSX(entryFile, requireFn, entryDir)`** — Fetches the TSX entry, preloads modules via `preloadModulesFromSource`, runs the compiled bundle, logs the compilation, and returns the rendered component.

## Examples

```ts
const App = await compileTSX("src/main.tsx", requireFn, "src");
frameworkRender(config, registry, App);
```

## Related docs

- `docs/api/bootstrap/local-loader.md` explains how the loader wires this compiler into the bootstrap `require`/render flow.

## Navigation

- [Bootstrap local tools README](README.md)
