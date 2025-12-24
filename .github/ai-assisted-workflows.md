# AI-Assisted GitHub Workflows

This repo prefers GitHub-native automation for AI assistance. Drive work with labels, plain-English comments, and task lists so everything stays auditable in issues and PR threads.

## Core principles
- **Stay inside GitHub**: Avoid direct API calls from the AI. Use labels, milestones, and template metadata.
- **Plain-English communication**: Comment with intent, expected outcomes, and guardrails instead of opaque payloads.
- **Labels as switches**: Reserve labels like `ai-ready`, `ai-in-progress`, `ai-needs-review`, `ai-blocked`, and `ai-follow-up` to drive automation and signal state.
- **Native artifacts first**: Open issues, maintain task lists, and leave PR comments before reaching for external services.
- **Auditability**: Keep decisions and status updates in the thread so humans can follow along and intervene.

## Recommended flow
1. **Open/prepare an issue** with the problem statement, acceptance criteria, and `ai-ready` label when it is actionable. CI failures now auto-open issues with `ai-ready` plus guidance for the AI.
2. **Draft a PR** from the AI and outline the plan in the description; keep status updates in comments rather than API callbacks.
3. **Track tasks** with Markdown checklists that the AI checks off as work completes.
4. **Hand off for review** by swapping to `ai-needs-review` and posting a recap of changes and verification notes. The AI remediation workflow automatically adds `ai-needs-review` to new or updated PRs.
5. **Trigger validation** through labels or slash commands (e.g., `/run-tests`) that workflows can parse—never by custom endpoints.
6. **Close out** by merging via the PR UI, closing linked issues, and posting a final changelog comment plus any `ai-follow-up` tags. If an AI reviewer requests changes, the workflow opens an `ai-follow-up` issue to restart the loop.

## Comment and tag patterns
- **Status**: “Completed lint setup; waiting on `/run-tests`.”
- **Requests**: “@maintainers please review API retries; need confirmation on limits.”
- **Actions**: Slash commands like `/run-tests` or `/create-issue <title>` that GitHub Actions consume—no direct API calls.
- **Labels**: `ai-ready`, `ai-in-progress`, `ai-needs-review`, `ai-blocked`, `ai-follow-up` map to automation triggers.

## Quick reliability checklist
- Prefer labels/comments over external orchestration.
- Mirror important summaries in PR descriptions.
- Keep instructions human-readable, not tokenized.
- Use deterministic workflows instead of ad-hoc scripts.
