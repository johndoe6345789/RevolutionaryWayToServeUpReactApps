#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path
from typing import Sequence

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from scripts.doc_coverage import ModuleSummary, collect_source_files, extract_symbols


def build_modules(code_root: Path) -> list[ModuleSummary]:
    summaries: list[ModuleSummary] = []
    for path in collect_source_files(code_root):
        rel = path.relative_to(code_root)
        text = path.read_text(encoding="utf-8", errors="ignore")
        globals_set, functions_set = extract_symbols(text)
        summaries.append(
            ModuleSummary(path=str(rel), globals=sorted(globals_set), functions=sorted(functions_set))
        )
    return summaries


def render_reference(modules: Sequence[ModuleSummary]) -> str:
    lines = [
        "# API Reference Snapshot",
        "",
        "This file lists every detected module along with its exported globals and functions.",
        "",
        "## Modules",
        "",
    ]

    for module in sorted(modules, key=lambda m: m.path):
        lines.append(f"### `{module.path}`")
        lines.append("")
        lines.append("#### Globals")
        if module.globals:
            for g in module.globals:
                lines.append(f"- `{module.path}:{g}`")
        else:
            lines.append("- _None_")
        lines.append("")
        lines.append("#### Functions")
        if module.functions:
            for fn in module.functions:
                lines.append(f"- `{module.path}:{fn}`")
        else:
            lines.append("- _None_")
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    modules = build_modules(repo_root)
    doc_path = repo_root / "docs" / "api" / "reference.md"
    doc_path.parent.mkdir(parents=True, exist_ok=True)
    doc_path.write_text(render_reference(modules), encoding="utf-8")


if __name__ == "__main__":
    main()
