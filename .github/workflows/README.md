# GitHub Actions workflows

Summary of the automation that runs in this repository:

- **ci.yml** – installs dependencies, runs lint/test suites to validate pull requests, and opens a Codex or GitHub Pro task when tests fail.
- **docker-publish.yml** – builds and pushes the application Docker image when releases are tagged.
- **release-zip.yml** – packages build artifacts into a zip for distribution.
- **copilot-conflict-resolver.yml** – asks Copilot to fix merge conflicts on same-repo PRs and escalates to Codex with a PR comment when Copilot is skipped (for example, on forked branches).

When adding new workflows, keep them documented here so maintainers can see the full CI/CD surface at a glance.
