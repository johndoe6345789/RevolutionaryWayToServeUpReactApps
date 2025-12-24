# AI-Assisted GitHub Workflows

A resilient way to coordinate AI help inside GitHub without depending on flaky API endpoints. Drive automation with labels/tags, comment-based cues, and native GitHub artifacts so the workflow keeps working even when external services are unavailable.

## Core principles
- **Stay in GitHub**: Avoid direct API calls from the AI. Express intent with labels, milestones, and templates that GitHub already understands.
- **Plain-English communication**: Leave clear issue and PR comments instead of opaque payloads. Include the intent, the expected outcome, and any guardrails.
- **Labels as switches**: Use consistent tags (e.g., `ai-ready`, `ai-needs-review`, `ai-failed-checks`) to trigger automations in Actions and to advertise state to teammates.
- **Native artifacts first**: Open issues, create/check off task lists, and add PR comments before considering any external service.
- **Auditability**: Keep decisions and actions in the thread so humans can follow the AI’s reasoning and intervene quickly.

## Recommended flow
1. **Start with an issue**: Describe the problem, expected deliverables, and acceptance criteria. Apply an `ai-ready` label when the description is complete.
2. **Branch and PR**: Have the AI open a draft PR (or convert one) and summarize its plan in the description. Keep running commentary in updates instead of pushing status to an API.
3. **Task tracking**: Maintain Markdown checklists inside the issue/PR to track steps. The AI checks boxes as it completes work.
4. **Reviews and handoffs**: When ready for eyes-on, swap `ai-ready` for `ai-needs-review` and leave a plain-English recap comment covering what changed and what to verify.
5. **Validation**: If automation is needed (tests, linting, deploys), trigger it with labels or slash-command comments (e.g., `/run-tests`) that Actions can listen to.
6. **Merge and close**: After approval, merge via the PR UI and close linked issues. Post a final comment with a short changelog and any follow-up tags like `ai-follow-up`.

## Comment and tagging patterns
- **Status updates**: “Completed setup for linting. Waiting on `/run-tests` to finish.”
- **Requests**: “@maintainers please review API error handling. Expecting confirmation on retry strategy.”
- **Actions via comments**: Use predictable slash commands (`/run-tests`, `/create-issue <title>`) that GitHub Actions parse—no direct API calls from the AI.
- **Labels that drive automation**: Map labels like `ai-ready`, `ai-in-progress`, `ai-needs-review`, `ai-blocked`, `ai-follow-up` to workflows so the AI never needs to hit APIs directly.

## Reliability checklist for the AI
- Never depend on custom endpoints for orchestration; prefer labels and comments.
- Keep every decision and result in the PR/issue thread for traceability.
- Prefer deterministic Actions workflows over ad-hoc scripts.
- Mirror important summaries in the PR description so context survives rebases and force-pushes.
- Keep instructions human-readable; avoid terse machine-coded tokens.
