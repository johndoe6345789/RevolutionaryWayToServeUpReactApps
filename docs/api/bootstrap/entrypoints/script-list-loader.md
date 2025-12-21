# Module: `bootstrap/entrypoints/script-list-loader.js`

## Overview

- **Purpose:** Fetch and sequentially load the script manifest (`bootstrap/entrypoints/script-list.html`) when the browser needs a controlled order of helper scripts rather than bundling them.
- **Entry point:** Included as the first script in `index.html` so the manifest can inject every helper before the main `bootstrap.js` executes.

## Behavior

- **`loadFromManifest()`** orchestrates the manifest fetch and iterates the parsed `<script>` tags, awaiting `loadScript` for each entry so the helpers load sequentially.
- Each injected script attaches `onload`/`onerror` callbacks to resolve or reject the helper promise while logging failures through `rwtra:scripts`.
- Loads `bootstrap/entrypoints/script-list.html` with `cache: "no-store"`, parses the returned HTML, and extracts every `<script src="..."></script>` entry.
- The helper scripts are injected with `async=false` so they execute in the manifest order, and the loader stops once every script resolves or rejects with a logged error.
- Errors are reported via `console.error` with the `rwtra:scripts` prefix so CI loggers can correlate manifest failures.

## Globals

- `ScriptListLoader`
- `scriptListLoader`
## Examples

```html
<script src="bootstrap/entrypoints/script-list-loader.js"></script>
```

## Related docs

- `docs/api/bootstrap/README.md` describes how the manifest stage fits into the bootstrap pipeline.

## Navigation

- [Bootstrap index](README.md)
- [API reference overview](../README.md)
