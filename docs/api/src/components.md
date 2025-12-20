# Module: `src/components`

## Overview

- **Purpose:** Provide composable pieces (hero, featured grid, footer) that assemble the RetroDeck interface and reuse the theme/styles defined in `src/theme.ts`.
- **Entry point:** The components are imported by `src/App.tsx`; refer to each submodule for their focused responsibilities.

## Globals

- _None:_ each file exports a default React component.

### HeroSection (`src/components/HeroSection.tsx`)

- Builds a layered hero with gradient background, neon chips, call-to-action buttons, and an SVG arcade console illustration.
- Logs interactions (`Launch Arcade Mode`, `Browse ROM Library`) via `console.log` and renders system tag chips derived from `SYSTEM_TAGS`.

### FeaturedGames (`src/components/FeaturedGames.tsx`)

- Renders a grid of cards using `FEATURED_GAMES`. Each card shows a cover image via `CardMedia`, title/badge metadata, genre chips, and quick-action buttons that log `Quick play:` or `View details` with the game ID.
- The layout guarantees cards stretch vertically by using column flex and pushing the action row to the bottom.

### FooterStrip (`src/components/FooterStrip.tsx`)

- Displays a descriptive caption plus small `Chip`s for optional features such as `CRT Shader`, `Netplay`, and `Big Screen Mode`, all styled with transparent borders matching the dark palette.

## Examples

```tsx
import FeaturedGames from "./components/FeaturedGames";
import HeroSection from "./components/HeroSection";

<HeroSection />
<FeaturedGames />
<FooterStrip />
```

## Related docs

- `docs/api/src/app.md` demonstrates how the components assemble inside the main `App` shell.

## Navigation

- [Source modules index](index.md)
