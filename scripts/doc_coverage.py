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
from typing import Callable, Iterable, Sequence
import sys


DEFAULT_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".html"}
DEFAULT_IGNORE_DIRS = {
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
STRINGS = {
    "cli_description": "Estimate API doc coverage",
    "coverage_heading": "Documentation coverage",
    "missing_modules": "Missing module docs:",
    "stub_template_phrase": "Module documentation template",
    "stub_penalty_note": "...convert or delete these matching templates so the penalty vanishes:",
    "missing_readme_title": "Missing README.md in these directories:",
    "bootstrap_unmatched_title": "Bootstrap docs without matching source files:",
    "extra_docs_title": "Documented modules without matching source files:",
    "misplaced_docs_title": "Documented modules not located at expected path:",
}
MODULE_HEADING_RE = re.compile(r"#\s*Module:\s*`([^`]+)`", re.IGNORECASE)

PATH_CONFIG = {
    "doc_base": Path("api"),
    "module_overrides": {
        "index.html": Path("api/index.html.md"),
        "bootstrap.js": Path("api/bootstrap.md"),
        "bootstrap.d.ts": Path("api/bootstrap.md"),
    },
    "mirror_sections": [
        {
            "name": "bootstrap",
            "doc_prefix": Path("api/bootstrap"),
            "src_prefix": Path("bootstrap"),
        },
    ],
}


def collect_source_files(
    code_root: Path,
    extensions: set[str] | None = None,
    ignore_dirs: set[str] | None = None,
) -> Iterable[Path]:
    extensions = extensions or DEFAULT_EXTENSIONS
    extensions = {ext if ext.startswith(".") else f".{ext}" for ext in extensions}
    ignore_dirs = ignore_dirs or DEFAULT_IGNORE_DIRS

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


def load_docs(
    doc_root: Path, ignore_dirs: Sequence[Path] | None = None
) -> tuple[str, list[tuple[Path, str]]]:
    collected = []
    entries: list[tuple[Path, str]] = []
    if not doc_root.exists():
        return "", entries

    ignore_paths = [ignore.resolve() for ignore in (ignore_dirs or [])]
    for path in doc_root.rglob("*.md"):
        if ignore_paths:
            resolved = path.resolve()
            if any(resolved.is_relative_to(ignore) for ignore in ignore_paths):
                continue
        text = path.read_text(encoding="utf-8")
        collected.append(text)
        for match in MODULE_HEADING_RE.finditer(text):
            module = match.group(1)
            if module:
                entries.append((path, module))
    return "\n".join(collected), entries


def is_documented(name: str, doc_text: str) -> bool:
    if not doc_text:
        return False

    escaped = re.escape(name)
    if re.search(rf"\b{escaped}\b", doc_text):
        return True

    if ":" in name:
        module_path, symbol = name.rsplit(":", 1)
        symbol_escaped = re.escape(symbol)
        if re.search(rf"\b{symbol_escaped}\b", doc_text):
            return True
        module_escaped = re.escape(module_path)
        combined_pattern = rf"{module_escaped}.*{symbol_escaped}"
        if re.search(combined_pattern, doc_text):
            return True

    return bool(re.search(escaped, doc_text))


def compute_coverage(names: Iterable[str], doc_text: str) -> tuple[int, int]:
    names_set = set(names)
    if not names_set:
        return 0, 0
    documented = sum(1 for name in names_set if is_documented(name, doc_text))
    return documented, len(names_set)


def compute_module_coverage(
    modules: Sequence[str], documented_modules: set[str]
) -> tuple[int, int, list[str]]:
    unique_modules = list(dict.fromkeys(modules))
    documented = 0
    missing: list[str] = []
    for module in unique_modules:
        key = module.lower()
        if key in documented_modules:
            documented += 1
        else:
            missing.append(module)
    return documented, len(unique_modules), missing


def pluralize(noun: str, count: int) -> str:
    return noun if count == 1 else f"{noun}s"


@dataclass
class Section:
    title: str
    items: Sequence
    formatter: Callable[[object], str]

    def publish(self) -> None:
        if not self.items:
            return
        print(self.title)
        for item in self.items:
            print(self.formatter(item))


@dataclass
class PenaltySpec:
    count: int
    penalty: float
    formatter: Callable[[int], str]


def format_relative_path(path: Path, base: Path) -> str:
    try:
        rel = path.relative_to(base)
    except ValueError:
        rel = path
    return f"  - {rel}"


def is_code_module_path(module_path: str) -> bool:
    cleaned = module_path.strip()
    if "<" in cleaned or ">" in cleaned:
        return False
    lower = cleaned.lower()
    if not any(lower.endswith(ext) for ext in DEFAULT_EXTENSIONS):
        return False
    return not lower.startswith("docs/")


def is_in_ignore_dir(module_path: str) -> bool:
    cleaned = module_path.strip().lstrip("./")
    if not cleaned:
        return False
    first_part = cleaned.split("/", 1)[0]
    return first_part in DEFAULT_IGNORE_DIRS


def find_unmatched_bootstrap_docs(
    entries: Sequence[tuple[Path, str]], doc_root: Path, code_root: Path
) -> list[tuple[Path, str]]:
    unmatched: list[tuple[Path, str]] = []
    for doc_path, module_path in entries:
        try:
            relative = doc_path.relative_to(doc_root)
        except ValueError:
            continue
        for section in PATH_CONFIG["mirror_sections"]:
            doc_prefix = section["doc_prefix"]
            prefix_parts = doc_prefix.parts
            if relative.parts[: len(prefix_parts)] != prefix_parts:
                continue
            target = code_root / Path(module_path)
            if not target.exists():
                unmatched.append((doc_path, module_path))
            break
    return unmatched


def find_missing_readmes(
    api_root: Path, ignore_dirs: Sequence[Path] | None = None
) -> list[Path]:
    if not api_root.exists():
        return []
    ignore_paths = [ignore.resolve() for ignore in (ignore_dirs or [])]
    directories: set[Path] = set()
    for path in api_root.rglob("*.md"):
        resolved = path.resolve()
        if ignore_paths and any(resolved.is_relative_to(ignore) for ignore in ignore_paths):
            continue
        directories.add(path.parent)
    missing: list[Path] = []
    for directory in sorted(directories):
        if directory == api_root:
            continue
        if not (directory / "README.md").exists():
            missing.append(directory)
    return missing


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


def parse_extensions(value: str) -> set[str]:
    candidates = [part.strip() for part in value.split(",") if part.strip()]
    if not candidates:
        return DEFAULT_EXTENSIONS.copy()
    return {part if part.startswith(".") else f".{part}" for part in candidates}


def expected_doc_path(module_path: str) -> Path:
    cleaned = module_path.strip()
    override = PATH_CONFIG["module_overrides"].get(cleaned)
    if override:
        return override
    sanitized = Path(cleaned)
    base = sanitized.with_suffix("") if sanitized.suffix else sanitized
    return PATH_CONFIG["doc_base"] / base.with_suffix(".md")


def main() -> int:
    parser = argparse.ArgumentParser(description=STRINGS["cli_description"])
    parser.add_argument("--code-root", default=".", help="Code root folder to scan")
    parser.add_argument("--doc-root", default="docs", help="API doc markdown folder")
    parser.add_argument(
        "--template-root",
        default=None,
        help="Directory for per-module markdown templates (optional)",
    )
    parser.add_argument(
        "--fix-stubs",
        action="store_true",
        help="Delete stub templates that already have fully documented counterparts.",
    )
    parser.add_argument(
        "--extensions",
        default=",".join(sorted(DEFAULT_EXTENSIONS)),
        help="Comma-separated list of file extensions to scan (include leading dot or not); defaults to js,jsx,ts,tsx,html.",
    )
    args = parser.parse_args()

    code_root = Path(args.code_root).resolve()
    doc_root = (code_root / args.doc_root).resolve()
    template_root = Path(args.template_root).resolve() if args.template_root else None
    extensions = parse_extensions(args.extensions)

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
    existing_doc_text, _ = load_docs(doc_root, ignore_dirs=ignore_paths)

    for path in collect_source_files(code_root, extensions, DEFAULT_IGNORE_DIRS):
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

    doc_text, documented_entries = load_docs(doc_root, ignore_dirs=ignore_paths)
    documented_modules = {
        module.lower() for _, module in documented_entries if module
    }
    documented_module_roots = [module for _, module in documented_entries if module]
    module_docged, module_total, missing_modules = compute_module_coverage(
        modules, documented_modules
    )
    globals_docged, globals_total = compute_coverage(globals_names, doc_text)
    functions_docged, functions_total = compute_coverage(functions_names, doc_text)

    overall_total = module_total + globals_total + functions_total
    overall_docged = module_docged + globals_docged + functions_docged
    coverage_pct = (overall_docged / overall_total * 100) if overall_total else 100.0

    stub_templates = []
    matched_stubs: list[Path] = []
    for path in stub_path.rglob("*.md"):
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        if STRINGS["stub_template_phrase"] not in text:
            continue
        module_match = MODULE_HEADING_RE.search(text)
        if module_match:
            module_path = module_match.group(1)
            module_lower = module_path.lower() if module_path else ""
            if module_lower and module_lower in documented_modules:
                matched_stubs.append(path)
                continue
        stub_templates.append(path)
    stub_penalty = min(len(stub_templates) * 2.0, 100.0)
    missing_readmes = find_missing_readmes(doc_root / "api", ignore_dirs=ignore_paths)
    readme_penalty = min(len(missing_readmes) * 2.0, 100.0)
    modules_set = {module.lower() for module in modules}
    extra_docs = sorted(
        {
            doc
            for doc in documented_module_roots
            if (
                doc.lower() not in modules_set
                and is_code_module_path(doc)
                and not is_in_ignore_dir(doc)
                and not doc.lower().startswith("bootstrap")
            )
        }
    )
    extra_docs_penalty = min(len(extra_docs) * 2.0, 100.0)
    bootstrap_extra_docs = find_unmatched_bootstrap_docs(
        documented_entries, doc_root, code_root
    )
    bootstrap_extra_penalty = min(len(bootstrap_extra_docs) * 2.0, 100.0)
    misplaced_docs = []
    for doc_path, module in documented_entries:
        try:
            rel = doc_path.relative_to(doc_root)
        except ValueError:
            continue
        if not module.lower().startswith("bootstrap"):
            continue
        expected = expected_doc_path(module)
        if rel != expected:
            misplaced_docs.append((rel, expected))
    misplaced_penalty = min(len(misplaced_docs) * 2.0, 100.0)
    total_penalty = min(
        stub_penalty
        + readme_penalty
        + extra_docs_penalty
        + bootstrap_extra_penalty
        + misplaced_penalty,
        100.0,
    )
    coverage_with_penalty = max(coverage_pct - total_penalty, 0.0)
    coverage_with_penalty = max(coverage_pct - total_penalty, 0.0)

    if args.fix_stubs and matched_stubs:
        for path in matched_stubs:
            try:
                path.unlink()
            except OSError:
                continue
        print(
            f"Removed {len(matched_stubs)} stub templates whose modules already have docs."
        )

    print()
    print(STRINGS["coverage_heading"])
    print("----------------------")
    print(f"Modules:    {module_docged}/{module_total} documented")
    if missing_modules:
        print(STRINGS["missing_modules"])
        for module in missing_modules:
            print(f"  - {module}")
    print(f"Globals:    {globals_docged}/{globals_total}")
    print(f"Functions:  {functions_docged}/{functions_total}")

    penalty_specs = [
        PenaltySpec(
            len(stub_templates),
            stub_penalty,
            lambda count: f"{count} {pluralize('stub template', count)}",
        ),
        PenaltySpec(
            len(missing_readmes),
            readme_penalty,
            lambda count: f"{count} missing {pluralize('README', count)}",
        ),
        PenaltySpec(
            len(extra_docs),
            extra_docs_penalty,
            lambda count: f"{count} extra module {pluralize('doc', count)}",
        ),
        PenaltySpec(
            len(misplaced_docs),
            misplaced_penalty,
            lambda count: f"{count} misplaced {pluralize('doc', count)}",
        ),
        PenaltySpec(
            len(bootstrap_extra_docs),
            bootstrap_extra_penalty,
            lambda count: f"{count} unmatched bootstrap {pluralize('doc', count)}",
        ),
    ]
    active_penalties = [spec for spec in penalty_specs if spec.count]
    if total_penalty:
        reason = " and ".join(
            spec.formatter(spec.count) for spec in active_penalties if spec.count
        )
        print(
            f"Overall:    {coverage_with_penalty:.1f}% (penalized {total_penalty:.1f}% for {reason})"
        )
    else:
        print(f"Overall:    {coverage_pct:.1f}%")

    if stub_penalty:
        print(STRINGS["stub_penalty_note"])
        for stub in stub_templates:
            print(f"  - {stub.relative_to(doc_root)}")

    sections = [
        Section(
            STRINGS["missing_readme_title"],
            missing_readmes,
            lambda path: format_relative_path(path, doc_root),
        ),
        Section(
            STRINGS["bootstrap_unmatched_title"],
            bootstrap_extra_docs,
            lambda pair: f"  - {pair[0].relative_to(doc_root)} -> {pair[1]}",
        ),
        Section(
            STRINGS["extra_docs_title"],
            extra_docs,
            lambda doc: f"  - {doc}",
        ),
        Section(
            STRINGS["misplaced_docs_title"],
            misplaced_docs,
            lambda pair: f"  - {pair[0]} (expected {pair[1]})",
        ),
    ]
    for section in sections:
        section.publish()

    strict_failure = bool(
        missing_modules or total_penalty > 0 or bootstrap_extra_docs or misplaced_docs
    )
    return 1 if strict_failure else 0


if __name__ == "__main__":
    sys.exit(main())
