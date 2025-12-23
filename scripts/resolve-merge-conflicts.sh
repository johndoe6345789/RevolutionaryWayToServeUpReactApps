#!/bin/bash
# Script to resolve merge conflicts in open pull requests
# This script updates each PR branch with the latest main branch

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Bulk Merge Conflict Resolution Script ===${NC}"
echo ""

# List of PR branches that need conflict resolution
PR_BRANCHES=(
    "codex/update-codegen-to-derive-component-types"  # PR #32
    "codex/ensure-bun-installation-and-run-lint"       # PR #36
    "codex/move-primitives-to-external-json-file"      # PR #37
    "codex/update-to-one-interface-per-file"           # PR #38
    "codex/refactor-codebase-for-one-root-function-per-file"  # PR #40
)

# Function to resolve conflicts for a branch
resolve_branch_conflicts() {
    local branch_name=$1
    echo -e "${YELLOW}Processing branch: ${branch_name}${NC}"
    
    # Fetch the latest version of the branch
    git fetch origin "$branch_name:$branch_name" 2>/dev/null || {
        echo -e "${RED}Failed to fetch branch $branch_name${NC}"
        return 1
    }
    
    # Checkout the branch
    git checkout "$branch_name" || {
        echo -e "${RED}Failed to checkout branch $branch_name${NC}"
        return 1
    }
    
    # Attempt to merge main
    echo "Merging main into $branch_name..."
    if git merge main --no-edit; then
        echo -e "${GREEN}✓ Successfully merged main into $branch_name${NC}"
        
        # Push the updated branch
        git push origin "$branch_name" || {
            echo -e "${YELLOW}Note: Could not push to $branch_name. You may need to push manually.${NC}"
        }
    else
        echo -e "${RED}✗ Merge conflicts detected in $branch_name${NC}"
        echo "Conflicts in the following files:"
        git diff --name-only --diff-filter=U
        echo ""
        echo -e "${YELLOW}Please resolve conflicts manually in the following files:${NC}"
        git diff --name-only --diff-filter=U | while read file; do
            echo "  - $file"
        done
        
        # Abort the merge
        git merge --abort
        return 1
    fi
    
    echo ""
}

# Store current branch
current_branch=$(git branch --show-current)

# Ensure we have the latest main
echo "Fetching latest main branch..."
git fetch origin main:main || git fetch origin main

# Process each PR branch
failed_branches=()
success_count=0

for branch in "${PR_BRANCHES[@]}"; do
    if resolve_branch_conflicts "$branch"; then
        ((success_count++))
    else
        failed_branches+=("$branch")
    fi
done

# Return to original branch
git checkout "$current_branch"

# Summary
echo -e "${GREEN}=== Summary ===${NC}"
echo "Successfully resolved: $success_count/${#PR_BRANCHES[@]} branches"

if [ ${#failed_branches[@]} -gt 0 ]; then
    echo -e "${YELLOW}Branches that need manual conflict resolution:${NC}"
    for branch in "${failed_branches[@]}"; do
        echo "  - $branch"
    done
    echo ""
    echo -e "${YELLOW}To manually resolve conflicts for a branch:${NC}"
    echo "  1. git checkout <branch-name>"
    echo "  2. git merge main"
    echo "  3. Resolve conflicts in the listed files"
    echo "  4. git add <resolved-files>"
    echo "  5. git commit"
    echo "  6. git push origin <branch-name>"
fi
