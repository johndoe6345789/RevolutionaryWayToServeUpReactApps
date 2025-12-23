#!/bin/bash
# Script to push all resolved PR branches

set -e

echo "=== Push Resolved PR Branches ==="
echo ""
echo "This script will push all 5 resolved PR branches to remote."
echo "Make sure you have push permissions to these branches."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Pushing resolved branches..."
echo ""

# Array of branches to push
BRANCHES=(
    "codex/ensure-bun-installation-and-run-lint"
    "codex/move-primitives-to-external-json-file"
    "codex/refactor-codebase-for-one-root-function-per-file"
    "codex/update-to-one-interface-per-file"
    "codex/update-codegen-to-derive-component-types"
)

PR_NUMBERS=(36 37 40 38 32)

SUCCESS_COUNT=0
FAILED_BRANCHES=()

for i in "${!BRANCHES[@]}"; do
    BRANCH="${BRANCHES[$i]}"
    PR_NUM="${PR_NUMBERS[$i]}"
    
    echo "[$((i+1))/${#BRANCHES[@]}] Pushing PR #$PR_NUM: $BRANCH..."
    
    if git push origin "$BRANCH"; then
        echo "✓ Successfully pushed $BRANCH"
        ((SUCCESS_COUNT++))
    else
        echo "✗ Failed to push $BRANCH"
        FAILED_BRANCHES+=("$BRANCH (PR #$PR_NUM)")
    fi
    echo ""
done

echo "=== Summary ==="
echo "Successfully pushed: $SUCCESS_COUNT/${#BRANCHES[@]} branches"

if [ ${#FAILED_BRANCHES[@]} -gt 0 ]; then
    echo ""
    echo "Failed branches:"
    for branch in "${FAILED_BRANCHES[@]}"; do
        echo "  - $branch"
    done
    echo ""
    echo "You may need to:"
    echo "  1. Check your GitHub authentication (gh auth login)"
    echo "  2. Verify you have push permissions to these branches"
    echo "  3. Contact the PR author if branches are from a fork"
else
    echo ""
    echo "✓ All branches pushed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Go to GitHub and verify PRs no longer show merge conflicts"
    echo "  2. Wait for CI checks to pass"
    echo "  3. Merge PRs in order: #36 → #37 → #40 → #38 → #32"
fi
