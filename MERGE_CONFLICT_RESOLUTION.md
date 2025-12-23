# Merge Conflict Resolution Guide

This document provides information about the open pull requests that have merge conflicts and how to resolve them.

## Overview

The following pull requests have merge conflicts with the main branch and need to be updated:

| PR # | Title | Branch | Status |
|------|-------|--------|--------|
| #32  | Enhance web UI generator outputs | `codex/update-codegen-to-derive-component-types` | ❌ Has conflicts |
| #36  | Fix lint issues in retro-react-app | `codex/ensure-bun-installation-and-run-lint` | ❌ Has conflicts |
| #37  | Move hero section test primitives into shared fixture | `codex/move-primitives-to-external-json-file` | ❌ Has conflicts |
| #38  | Refactor webui interfaces into dedicated files | `codex/update-to-one-interface-per-file` | ❌ Has conflicts |
| #40  | Ensure each file exposes a single top-level function | `codex/refactor-codebase-for-one-root-function-per-file` | ❌ Has conflicts |

## Why Do These Conflicts Exist?

These branches were created based on earlier versions of the `main` branch. Since then, PR #39 was merged into main, which updated various files. The changes in PR #39 conflict with changes in these branches, causing GitHub to mark them as having merge conflicts.

## Resolution Options

### Option 1: Automated Script (Recommended)

Use the provided script to automatically resolve conflicts where possible:

```bash
bash scripts/resolve-merge-conflicts.sh
```

This script will:
1. Fetch each PR branch
2. Attempt to merge `main` into it
3. If successful, push the updated branch
4. If conflicts exist, provide details about which files need manual resolution

### Option 2: Manual Resolution for Each PR

For each PR that needs conflict resolution:

#### Step 1: Checkout the PR branch
```bash
git fetch origin <branch-name>
git checkout <branch-name>
```

#### Step 2: Merge main
```bash
git merge main
```

#### Step 3: Resolve conflicts
If conflicts occur, Git will mark conflicting files. Open each file and look for conflict markers:
```
<<<<<<< HEAD
(current branch changes)
=======
(main branch changes)
>>>>>>> main
```

Edit each file to resolve the conflicts, keeping the appropriate changes.

#### Step 4: Complete the merge
```bash
git add <resolved-files>
git commit -m "Merge main and resolve conflicts"
git push origin <branch-name>
```

## Common Conflict Types

Based on the PRs affected, you may encounter these types of conflicts:

### 1. Import Statement Conflicts
- **Cause**: Multiple PRs reorganizing imports and file structures
- **Resolution**: Keep both sets of imports if they're different, merge if they're similar

### 2. Interface Definition Conflicts
- **Cause**: PRs #32, #38 refactoring interfaces into separate files
- **Resolution**: Check if interfaces were moved to new files; update imports accordingly

### 3. Test File Conflicts
- **Cause**: PR #37 moving test primitives to fixtures
- **Resolution**: Ensure test data is correctly imported from the new fixture location

### 4. Lint/Format Conflicts
- **Cause**: PR #36 fixing lint issues may conflict with code structure changes
- **Resolution**: Re-run the linter after merging to ensure all issues are resolved

### 5. Component Structure Conflicts
- **Cause**: PR #40 ensuring one function per file may conflict with other refactoring
- **Resolution**: Maintain the one-function-per-file pattern while preserving functionality

## Testing After Resolution

After resolving conflicts for any PR, ensure:

1. **Build passes**:
   ```bash
   npm install
   npm run build
   ```

2. **Tests pass**:
   ```bash
   npm test
   ```

3. **Linter passes**:
   ```bash
   npm run lint
   ```

## Automation Recommendations

To prevent future merge conflicts:

1. **Rebase regularly**: Keep feature branches up to date with main
2. **Smaller PRs**: Break large changes into smaller, focused PRs
3. **Coordinate changes**: If multiple PRs touch the same files, coordinate their order
4. **CI checks**: Add automated checks that warn when branches are behind main

## Need Help?

If you encounter conflicts that are difficult to resolve:

1. Review the original PR description to understand the intended changes
2. Check the diff between the branch and main to see what changed
3. Use `git diff main...branch-name` to see only the changes in the branch
4. Consider asking the original PR author for guidance

## Quick Reference Commands

```bash
# See which files have conflicts
git diff --name-only --diff-filter=U

# See the actual conflicts
git diff

# Abort a merge if you need to start over
git merge --abort

# See the diff between a branch and main
git diff main...branch-name

# Check the status of all PRs
gh pr list --state open
```
