# scripts

Utility scripts that support development and maintenance tasks.

- **clean.ts** – runs the clean plugin from the codegen package to delete common build artifacts (`dist`, `.next`, `coverage`, etc.). Supports `--targets`, `--dry-run`, and `--force` flags for safe cleanup. Use `bun run scripts/clean.ts --help` to see options.
- **lint-all.ts** – runs linting for both packages in the repo (`npm run lint` in `codegen/` and `bunx eslint .` in `retro-react-app/`). Invoke with `bun run scripts/lint-all.ts` from the repository root.

Add new repo-wide scripts here so they are easy to find and documented in one place.
