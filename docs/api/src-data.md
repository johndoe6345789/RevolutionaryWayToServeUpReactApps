# Module: `src/data.ts`

## Overview

- **Purpose:** Provide curated data for the RetroDeck UI so the hero and featured sections have deterministic content during development and testing.
- **Entry point:** Import the module’s named exports (`FEATURED_GAMES`, `SYSTEM_TAGS`, `CTA_BUTTON_STYLE`) directly where the components need consistent metadata.

## Globals

- **`FEATURED_GAMES`** — Array of featured ROM entries. Each object includes `id`, `title`, `system`, `description`, `genre`, `badge`, and a `cover` URL that the featured game cards show.
- **`SYSTEM_TAGS`** — Ordered platform tags surfaced in the hero section to reinforce supported consoles (Arcade, NES, SNES, etc.).
- **`CTA_BUTTON_STYLE`** — Shared style object for buttons (`px`, `py`, `borderRadius`, `fontSize`) so the hero CTAs keep a consistent pill shape.

## Functions / Classes

- _None_: this module exports data constants only.

## Examples

```ts
import { FEATURED_GAMES } from "../data";

const primary = FEATURED_GAMES[0];
console.log(primary.title, primary.genre.join(", "));
```

## Related docs

- `docs/digital-twin.md` (generated) enumerates this module along with every constant once coverage runs.
