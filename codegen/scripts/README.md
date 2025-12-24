# codegen/scripts

This directory contains files for the `codegen/scripts` component of the project.

- **workflow-diagnostics.ts** – CLI helper that inspects `.github/workflows` for common breakages (missing `runs-on`, bad `needs` references, floating `uses` versions). Run with `bun run codegen/scripts/workflow-diagnostics.ts` from the repo root. Add `--json` for machine-readable output or `--workflow=<name>` to limit the scan.
