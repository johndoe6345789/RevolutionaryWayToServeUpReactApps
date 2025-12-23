#!/usr/bin/env python3
"""
Script to analyze merge conflicts in open pull requests
"""

import json
import subprocess
import sys
from typing import List, Dict, Tuple

# PR information
PRS = [
    {"number": 32, "branch": "codex/update-codegen-to-derive-component-types", "title": "Enhance web UI generator outputs"},
    {"number": 36, "branch": "codex/ensure-bun-installation-and-run-lint", "title": "Fix lint issues in retro-react-app"},
    {"number": 37, "branch": "codex/move-primitives-to-external-json-file", "title": "Move hero section test primitives into shared fixture"},
    {"number": 38, "branch": "codex/update-to-one-interface-per-file", "title": "Refactor webui interfaces into dedicated files"},
    {"number": 40, "branch": "codex/refactor-codebase-for-one-root-function-per-file", "title": "Ensure each file exposes a single top-level function"},
]


def run_command(cmd: List[str]) -> Tuple[int, str, str]:
    """Run a shell command and return exit code, stdout, stderr"""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.returncode, result.stdout, result.stderr
    except Exception as e:
        return 1, "", str(e)


def analyze_pr_conflicts(pr: Dict) -> Dict:
    """Analyze conflicts for a specific PR"""
    print(f"\n{'='*60}")
    print(f"Analyzing PR #{pr['number']}: {pr['title']}")
    print(f"Branch: {pr['branch']}")
    print(f"{'='*60}")
    
    result = {
        "pr_number": pr["number"],
        "branch": pr["branch"],
        "title": pr["title"],
        "conflicts": [],
        "status": "unknown"
    }
    
    # Fetch the branch
    print(f"Fetching branch {pr['branch']}...")
    code, stdout, stderr = run_command(["git", "fetch", "origin", pr["branch"]])
    if code != 0:
        print(f"❌ Failed to fetch: {stderr}")
        result["status"] = "fetch_failed"
        return result
    
    # Get the branch commit
    code, stdout, stderr = run_command(["git", "rev-parse", "FETCH_HEAD"])
    if code != 0:
        print(f"❌ Failed to get commit: {stderr}")
        result["status"] = "invalid_branch"
        return result
    
    branch_commit = stdout.strip()
    print(f"Branch commit: {branch_commit[:8]}")
    
    # Get main commit
    code, stdout, stderr = run_command(["git", "rev-parse", "main"])
    if code != 0:
        print(f"❌ Failed to get main commit: {stderr}")
        result["status"] = "no_main"
        return result
    
    main_commit = stdout.strip()
    print(f"Main commit: {main_commit[:8]}")
    
    # Check if branch is behind main
    code, stdout, stderr = run_command([
        "git", "merge-base", "--is-ancestor", branch_commit, main_commit
    ])
    if code == 0:
        print("✓ Branch is already in main (no conflicts)")
        result["status"] = "already_merged"
        return result
    
    # Try to find merge base
    code, stdout, stderr = run_command([
        "git", "merge-base", branch_commit, main_commit
    ])
    if code != 0:
        print(f"❌ Could not find merge base")
        result["status"] = "no_merge_base"
        return result
    
    merge_base = stdout.strip()
    print(f"Merge base: {merge_base[:8]}")
    
    # Get list of files changed in the branch
    code, stdout, stderr = run_command([
        "git", "diff", "--name-only", f"{merge_base}..{branch_commit}"
    ])
    branch_files = set(stdout.strip().split('\n')) if stdout.strip() else set()
    print(f"Files changed in branch: {len(branch_files)}")
    
    # Get list of files changed in main since merge base
    code, stdout, stderr = run_command([
        "git", "diff", "--name-only", f"{merge_base}..{main_commit}"
    ])
    main_files = set(stdout.strip().split('\n')) if stdout.strip() else set()
    print(f"Files changed in main: {len(main_files)}")
    
    # Find potentially conflicting files
    potentially_conflicting = branch_files & main_files
    print(f"Potentially conflicting files: {len(potentially_conflicting)}")
    
    if potentially_conflicting:
        print("\nFiles modified in both branches:")
        for file in sorted(potentially_conflicting):
            print(f"  - {file}")
            result["conflicts"].append(file)
        result["status"] = "has_conflicts"
    else:
        print("✓ No overlapping file changes detected")
        result["status"] = "clean_merge"
    
    return result


def main():
    """Main function"""
    print("=" * 60)
    print("Merge Conflict Analysis Tool")
    print("=" * 60)
    
    # Ensure we're in the repo root
    code, stdout, stderr = run_command(["git", "rev-parse", "--show-toplevel"])
    if code != 0:
        print("❌ Not in a git repository")
        sys.exit(1)
    
    repo_root = stdout.strip()
    print(f"Repository root: {repo_root}")
    
    # Fetch main
    print("\nFetching main branch...")
    # First fetch, then force-update local branch if it exists
    code, stdout, stderr = run_command(["git", "fetch", "origin", "main"])
    if code != 0:
        print(f"❌ Failed to fetch main: {stderr}")
        sys.exit(1)
    
    # Force-update local main branch to match origin
    code, stdout, stderr = run_command(["git", "branch", "-f", "main", "FETCH_HEAD"])
    if code != 0:
        print(f"❌ Failed to update main branch: {stderr}")
        sys.exit(1)
    
    # Analyze each PR
    results = []
    for pr in PRS:
        result = analyze_pr_conflicts(pr)
        results.append(result)
    
    # Generate summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    for result in results:
        status_emoji = {
            "has_conflicts": "❌",
            "clean_merge": "✓",
            "already_merged": "✓",
            "fetch_failed": "❌",
            "invalid_branch": "❌",
            "no_main": "❌",
            "no_merge_base": "❌",
            "unknown": "?"
        }.get(result["status"], "?")
        
        print(f"\n{status_emoji} PR #{result['pr_number']}: {result['title']}")
        print(f"   Branch: {result['branch']}")
        print(f"   Status: {result['status']}")
        if result["conflicts"]:
            print(f"   Conflicting files: {len(result['conflicts'])}")
            for file in result["conflicts"][:5]:  # Show first 5
                print(f"     - {file}")
            if len(result["conflicts"]) > 5:
                print(f"     ... and {len(result['conflicts']) - 5} more")
    
    # Save results to JSON
    output_file = "conflict-analysis.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n✓ Full results saved to {output_file}")


if __name__ == "__main__":
    main()
