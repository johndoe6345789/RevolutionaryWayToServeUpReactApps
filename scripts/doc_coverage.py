#!/usr/bin/env python3
"""
Light-weight documentation coverage scanner for JS/TS sources.

The script walks the repository, records every code module (a source file),
top-level globals and function/method candidates, and then checks whether
those names appear in the project's markdown-based API docs.
"""

from __future__ import annotations

import argparse
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, Sequence


def collect_source_files(code_root: Path) -> Iterable[Path]:
    extensions = {".js", ".jsx", ".ts", ".tsx"}
    ignore_dirs = {
        ".git",
        ".venv",
        "dist",
        "node_modules",
        "build",
        "ci",
        "e2e",
        "python",
        "test-tooling",
    }

    for root, dirs, files in os.walk(code_root):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for entry in files:
            path = Path(root) / entry
            if path.name.endswith(".d.ts") and path.name != "bootstrap.d.ts":
                continue
            if path.suffix in extensions:
                yield path


def extract_symbols(text: str) -> tuple[set[str], set[str]]:
    globals_set: set[str] = set()
    functions_set: set[str] = set()

    # crude top-level global catches, assume no leading indentation
    for match in re.finditer(r"^(?:const|let|var)\s+([A-Za-z_]\w*)", text, re.MULTILINE):
        globals_set.add(match.group(1))

    # Various function declaration patterns
    patterns = [
        re.compile(r"\bfunction\s+([A-Za-z_]\w*)\s*\("),
        re.compile(r"\b([A-Za-z_]\w*)\s*=\s*function\b"),
        re.compile(r"\b([A-Za-z_]\w*)\s*=\s*async\s*\("),
        re.compile(r"\b([A-Za-z_]\w*)\s*=\s*\([^)]*\)\s*=>"),
        re.compile(r"\b([A-Za-z_]\w*)\s*:\s*(?:async\s*)?\([^)]*\)\s*=>"),
    ]

    for pattern in patterns:
        for match in pattern.finditer(text):
            functions_set.add(match.group(1))

    return globals_set, functions_set


def load_docs(doc_root: Path, ignore_dirs: Sequence[Path] | None = None) -> str:
    collected = []
    if not doc_root.exists():
        return ""

    ignore_paths = [ignore.resolve() for ignore in (ignore_dirs or [])]
    for path in doc_root.rglob("*.md"):
        if ignore_paths:
            resolved = path.resolve()
            if any(resolved.is_relative_to(ignore) for ignore in ignore_paths):
                continue
        collected.append(path.read_text(encoding="utf-8"))
    return "\n".join(collected)


def is_documented(name: str, doc_text: str) -> bool:
    if not doc_text:
        return False
    escaped = re.escape(name)
    if re.search(rf"\b{escaped}\b", doc_text):
        return True
    return bool(re.search(escaped, doc_text))


def compute_coverage(names: Iterable[str], doc_text: str) -> tuple[int, int]:
    names_set = set(names)
    if not names_set:
        return 0, 0
    documented = sum(1 for name in names_set if is_documented(name, doc_text))
    return documented, len(names_set)


@dataclass
class ModuleSummary:
    path: str
    globals: list[str] = field(default_factory=list)
    functions: list[str] = field(default_factory=list)


def render_module_template(module: ModuleSummary) -> str:
    lines: list[str] = [
        f"# Module template: `{module.path}`",
        "",
        "Use this document as a starting point. Replace the placeholder text with prose, examples, and links that describe the exported surface.",
        "",
        "## Overview",
        "- **Purpose:**",
        "- **Entry point / exports:**",
        "",
        "## Globals",
    ]

    if module.globals:
        for name in module.globals:
            lines.append(f"- `{name}` — describe the meaning and how callers should use it.")
    else:
        lines.append("- _None yet_")

    lines.extend(["", "## Functions / Classes"])
    if module.functions:
        for name in module.functions:
            lines.append(
                f"- `{name}` — explain arguments, return values, and side effects; note if it is async, a class constructor, etc."
            )
    else:
        lines.append("- _None yet_")

    lines.extend(
        [
            "",
            "## Examples",
            "```ts",
            "// Show a minimal snippet that exercises the module.",
            "```",
            "",
            "## Related docs",
            "- Reference other relevant markdown files if they already mention this module.",
        ]
    )

    return "\n".join(lines).rstrip() + "\n"


def ensure_module_templates(
    module_summaries: Sequence[ModuleSummary],
    template_root: Path,
    existing_doc_text: str,
) -> list[Path]:
    created: list[Path] = []
    template_root.mkdir(parents=True, exist_ok=True)

    for module in module_summaries:
        if is_documented(module.path, existing_doc_text):
            continue
        module_path = Path(module.path)
        target_dir = template_root / module_path.parent
        target_dir.mkdir(parents=True, exist_ok=True)
        target_file = target_dir / f"{module_path.name}.md"

        if target_file.exists():
            continue

        target_file.write_text(render_module_template(module), encoding="utf-8")
        created.append(target_file)

    return created


def main() -> None:
    parser = argparse.ArgumentParser(description="Estimate API doc coverage")
    parser.add_argument("--code-root", default=".", help="Code root folder to scan")
    parser.add_argument("--doc-root", default="docs", help="API doc markdown folder")
    parser.add_argument(
        "--template-root",
        default=None,
        help="Directory for per-module markdown templates (optional)",
    )
    args = parser.parse_args()

    code_root = Path(args.code_root).resolve()
    doc_root = (code_root / args.doc_root).resolve()
    template_root = Path(args.template_root).resolve() if args.template_root else None

    module_summaries: list[ModuleSummary] = []
    modules: list[str] = []
    globals_names: list[str] = []
    functions_names: list[str] = []

    ignore_paths: list[Path] = []
    if template_root:
        try:
            if template_root.resolve().is_relative_to(doc_root):
                ignore_paths.append(template_root)
        except ValueError:
            pass
    stub_path = doc_root / "api" / "stubs"
    ignore_paths.append(stub_path)
    existing_doc_text = load_docs(doc_root, ignore_dirs=ignore_paths)

    for path in collect_source_files(code_root):
        rel = path.relative_to(code_root)
        summary = ModuleSummary(path=rel.as_posix())
        text = path.read_text(encoding="utf-8", errors="ignore")
        globals_set, functions_set = extract_symbols(text)
        summary.globals = sorted(globals_set)
        summary.functions = sorted(functions_set)
        module_summaries.append(summary)
        modules.append(summary.path)
        globals_names.extend(f"{summary.path}:{name}" for name in summary.globals)
        functions_names.extend(f"{summary.path}:{name}" for name in summary.functions)

    if template_root:
        created_templates = ensure_module_templates(module_summaries, template_root, existing_doc_text)
        if created_templates:
            print(
                f"Module templates written for {len(created_templates)} modules under {template_root}"
            )

    doc_text = load_docs(doc_root, ignore_dirs=ignore_paths)
    module_docged, module_total = compute_coverage(modules, doc_text)
    globals_docged, globals_total = compute_coverage(globals_names, doc_text)
    functions_docged, functions_total = compute_coverage(functions_names, doc_text)

    overall_total = module_total + globals_total + functions_total
    overall_docged = module_docged + globals_docged + functions_docged
    coverage_pct = (overall_docged / overall_total * 100) if overall_total else 100.0

    print()
    print("Documentation coverage")
    print("----------------------")
    print(f"Modules:    {module_docged}/{module_total} documented")
    print(f"Globals:    {globals_docged}/{globals_total}")
    print(f"Functions:  {functions_docged}/{functions_total}")
    print(f"Overall:    {coverage_pct:.1f}%")


if __name__ == "__main__":
    main()
