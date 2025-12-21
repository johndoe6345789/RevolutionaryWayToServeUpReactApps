#!/usr/bin/env python3
"""
Copy HTML/SCSS/JSON/JS/TSX/TS sources into a dist folder for bundling or archiving.
"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

EXTENSIONS = {".html", ".scss", ".json", ".js", ".tsx", ".ts"}
ALWAYS_INCLUDE = {"bootstrap.js"}
DEFAULT_EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "__pycache__",
    ".github",
    ".venv",
    "venv",
    "tests",
    "e2e",
    "test-tooling",
    "server",
}
DEFAULT_EXCLUDE_FILES = {
    "bun.lock",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "poetry.lock",
    "package.json",
}


def collect_source_files(root: Path, dest: Path, exclude_dirs: set[str]) -> list[Path]:
    files: list[Path] = []
    dest = dest.resolve()
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        resolved = path.resolve()
        if dest in resolved.parents or resolved == dest:
            continue
        if path.suffix.lower() not in EXTENSIONS and path.name not in ALWAYS_INCLUDE:
            continue
        relative = path.relative_to(root)
        if any(part in exclude_dirs for part in relative.parts):
            continue
        if any(part.startswith(".") for part in relative.parts):
            continue
        if path.name in DEFAULT_EXCLUDE_FILES:
            continue
        files.append(path)
    return files


def copy_files(root: Path, dest: Path, files: list[Path]) -> int:
    copied = 0
    for source in files:
        relative = source.relative_to(root)
        target = dest / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        copied += 1
    return copied


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Copy html/scss/json/js/tsx/ts files into a dist directory."
    )
    parser.add_argument(
        "-s",
        "--src",
        type=Path,
        default=Path("."),
        help="Source root to scan (defaults to repository root).",
    )
    parser.add_argument(
        "-d",
        "--dest",
        type=Path,
        default=Path("dist"),
        help="Destination folder for the copied sources.",
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Remove the destination folder before copying.",
    )
    parser.add_argument(
        "--exclude-dir",
        action="append",
        default=[],
        metavar="NAME",
        help="Additional directory names to skip while scanning.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    src_root = args.src.resolve()
    dest_root = args.dest.resolve()
    if src_root == dest_root:
        print("src and dest must be different paths", file=sys.stderr)
        sys.exit(1)
    if args.clean and dest_root.exists():
        shutil.rmtree(dest_root)
    dest_root.mkdir(parents=True, exist_ok=True)
    exclude_dirs = set(DEFAULT_EXCLUDE_DIRS) | set(args.exclude_dir)
    files = collect_source_files(src_root, dest_root, exclude_dirs)
    if not files:
        print("No files matched the tracked extensions.", file=sys.stderr)
        sys.exit(0)
    copied = copy_files(src_root, dest_root, files)
    print(f"Copied {copied} files into {dest_root}", file=sys.stderr)


if __name__ == "__main__":
    main()
