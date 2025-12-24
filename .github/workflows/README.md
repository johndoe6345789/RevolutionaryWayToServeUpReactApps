# GitHub Actions workflows

Summary of the automation that runs in this repository:

- **ci.yml** – installs dependencies, runs lint/test suites to validate pull requests, and opens a Codex or GitHub Pro task when tests fail.
- **ai-remediation.yml** – converts `ai-ready` issues into actionable AI tasks, tags PRs for AI review, and opens follow-up issues when AI reviewers request changes.
- **bot_issue.yml** – automatically assigns Copilot to issues when they are labeled with `ci-failure`.
- **docker-publish.yml** – builds and pushes the application Docker image when releases are tagged.
- **release-zip.yml** – packages build artifacts into a zip for distribution.
- **copilot-conflict-resolver.yml** – asks Copilot to fix merge conflicts on same-repo PRs and escalates to Codex with a PR comment when Copilot is skipped (e.g., on forked branches).
- **ai-code-review.yml** – asks both Copilot and Codex for a code review on every pull request event (including when the PR is closed).

When adding new workflows, keep them documented here so maintainers can see the full CI/CD surface at a glance.

AI-focused automation should follow the label- and comment-driven patterns in `../ai-assisted-workflows.md` (e.g., responding to `ai-ready`, `ai-needs-review`, or `/run-tests`). When you add new triggers, document the label or slash command in both the workflow file and that guide so the behavior stays discoverable.
