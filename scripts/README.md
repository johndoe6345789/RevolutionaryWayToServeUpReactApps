# scripts

Utility scripts that support development and maintenance tasks.

- **clean.ts** – runs the clean plugin from the codegen package to delete common build artifacts (`dist`, `.next`, `coverage`, etc.). Supports `--targets`, `--dry-run`, and `--force` flags for safe cleanup. Use `bun run scripts/clean.ts --help` to see options.

Add new repo-wide scripts here so they are easy to find and documented in one place.
