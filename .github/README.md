# GitHub configuration

Automation, CI, and repository-level policy files live here.

- **AI-assisted workflows (`ai-assisted-workflows.md`)** outline how to drive label- and comment-based automation in GitHub without direct API calls.
- **Workflows (`.github/workflows`)** run linting, tests, releases, and Docker publishing for the project. See the workflow README for a quick map of each job.
- **Workflow Settings (`WORKFLOW_SETTINGS.md`)** documents repository settings to ensure workflows do not require approval and run smoothly for contributors.
- **Dependabot (`dependabot.yml`)** keeps npm and GitHub Action dependencies up to date on a weekly schedule.

If you add new CI pipelines or repository automation, place them here so contributors can find everything GitHub-related in one place. Keep the AI workflow guide updated when you add new labels or slash commands that automation depends on.
