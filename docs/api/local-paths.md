# Module: `bootstrap/local/local-paths.js`

## Overview

- **Purpose:** Help the loader resolve and normalize filesystem-style imports when `index.html` or a TSX entry imports relative modules. This keeps the bootstrap resilient to nested directories on static hosts.
- **Entry point:** Consumers import specific helpers such as `resolveLocalModuleBase` and `getCandidateLocalPaths` when performing code analysis inside the module loader.

## Globals

- _None_ — this module exports helper functions only.

## Functions / Classes

- **`isLocalModule(name)`** — Returns `true` for paths starting with `.` or `/`, which signals the loader to treat them as filesystem-relative.
- **`normalizeDir(dir)`** — Strips leading and trailing slashes from a directory string so alias keys stay consistent.
- **`makeAliasKey(name, baseDir)`** — Builds a stable alias key used in the loader registry by combining the normalized base directory with the requested module name.
- **`resolveLocalModuleBase(name, baseDir, currentHref)`** — Resolves a relative import against the entrypoint’s URL, returning a slash-trimmed path (e.g., `src/components`) used when loading modules dynamically.
- **`getModuleDir(filePath)`** — Yields the containing directory of a filepath, useful when injecting new entries into the module registry.
- **`hasKnownExtension(path)`** — Detects `.tsx`, `.ts`, `.jsx`, or `.js` suffixes so the loader can avoid adding redundant fallbacks.
- **`getCandidateLocalPaths(basePath)`** — Produces every candidate file variant (`.tsx`, `.ts`, `/index.js`, etc.) so the loader can probe for the correct module even when consumers omit extensions.

## Examples

```ts
import {
  resolveLocalModuleBase,
  getCandidateLocalPaths
} from "../../bootstrap/local/local-paths.js";

const resolved = resolveLocalModuleBase("./button", "src", "https://example.com/app/index.html");
const candidates = getCandidateLocalPaths(resolved);
```

## Related docs

- `docs/digital-twin.md` (auto-generated) reflects the coverage status once the doc coverage script runs.
