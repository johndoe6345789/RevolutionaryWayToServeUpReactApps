# GitHub Actions Workflow Settings

This document describes the required repository settings to ensure workflows run smoothly without requiring manual approval.

## Repository Settings Configuration

To ensure workflows do not require approval for pull requests from contributors, configure the following settings in the repository:

### Actions Permissions

Navigate to: **Settings** → **Actions** → **General** → **Fork pull request workflows from outside collaborators**

Set the approval requirements to one of the following based on your security needs:

1. **Recommended for open source projects**:
   - ✅ **Require approval for first-time contributors**: Approval required only for brand new contributors
   
2. **For trusted contributor base**:
   - ✅ **Require approval for all outside collaborators**: Approval required for non-collaborators
   
3. **For minimal friction (use with caution)**:
   - ✅ **Not require approval**: No approval required (only recommended if workflows are carefully designed)

### Current Workflow Security Design

Our workflows are designed with security in mind:

- **`pull_request` triggers**: Most CI workflows (`ci.yml`, `ci-tasks.yml`, `task-lint.yml`, etc.) use `pull_request` triggers, which run in the context of the PR branch without access to secrets. These workflows can run safely without approval.

- **`pull_request_target` triggers**: Workflows that need to post comments or access secrets (`ai-code-review.yml`, `copilot-conflict-resolver.yml`) use `pull_request_target`. For workflows that need stricter protections (for example, when mentioning Copilot or using secrets), we add explicit fork detection:
  - `copilot-conflict-resolver.yml` checks if the PR is from a fork and uses conditional logic to skip Copilot @-mentions for forked PRs while still posting informational comments
  - `ai-code-review.yml` intentionally does **not** implement fork detection and will process PRs from forks. This workflow is designed to be safe in that context: it performs only read-only analysis, does not check out or execute PR code, does not access repository secrets, and emits only controlled comment outputs.

- **Protected workflows**: Workflows triggered by `push` to `main`, `release`, or `workflow_dispatch` do not require approval as they only run on branches within the repository.

## Verifying Settings

To verify your repository settings are correctly configured:

1. Create a test pull request from a fork or as a first-time contributor
2. Check if the workflow runs automatically or shows "waiting for approval"
3. Adjust the settings above if workflows are stuck waiting for approval

## Security Considerations

When configuring approval settings, consider:

- **Public repositories**: More restrictive settings recommended to prevent abuse
- **Private repositories**: Can be more permissive if contributors are trusted
- **Workflows with secrets**: Always use `pull_request_target` with fork detection for workflows that need secrets
- **Code review**: Always review changes to `.github/workflows/` directory before approving workflow runs

## Updating These Settings

Repository administrators can update these settings at any time. Changes take effect immediately for new workflow runs.

For enterprise or organization-wide policies, contact your GitHub administrator as these settings may be enforced at a higher level.
