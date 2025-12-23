# Playwright specs

Each file here targets a user flow:

- `navigation-flow.spec.ts` – sanity check that the main pages and links render.
- `responsive-design.spec.ts` – viewport snapshots to verify layouts at mobile/tablet/desktop sizes.
- `theme-switching.spec.ts` and `language-switching.spec.ts` – verify UI toggles update content and styling.
- `page-load.spec.ts` – ensures the home screen loads quickly without console errors.
- `game-interactions.spec.ts` – validates interactive elements in the retro game experience.
- `integration/` – any cross-feature scenarios that combine multiple behaviors.

Add new specs with descriptive filenames so CI output immediately hints at the failing flow.
