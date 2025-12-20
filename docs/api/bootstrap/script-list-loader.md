# Module: `bootstrap/script-list-loader.js`

## Overview

- **Purpose:** Fetch and sequentially load the script manifest (`bootstrap/script-list.html`) when the browser needs a controlled order of helper scripts rather than bundling them.
- **Entry point:** Included as the first script in `index.html` so the manifest can inject every helper before the main `bootstrap.js` executes.

## Behavior

- Loads `bootstrap/script-list.html` with `cache: "no-store"`, parses the returned HTML, and extracts every `<script src="..."></script>` entry.
- The helper scripts are injected with `async=false` so they execute in the manifest order, and the loader stops once every script resolves or rejects with a logged error.
- Errors are reported via `console.error` with the `rwtra:scripts` prefix so CI loggers can correlate manifest failures.

## Examples

```html
<script src="bootstrap/script-list-loader.js"></script>
```

## Related docs

- `docs/api/bootstrap/index.md` describes how the manifest stage fits into the bootstrap pipeline.

## Navigation

- [Bootstrap index](index.md)
- [API reference overview](../index.md)
