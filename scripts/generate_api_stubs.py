#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from scripts.doc_coverage import ModuleSummary, collect_source_files, extract_symbols

TEMPLATE_PATH = REPO_ROOT / "docs" / "templates" / "js-ts-module-template.md"
STUB_ROOT = REPO_ROOT / "docs" / "api" / "stubs"


def build_modules() -> list[ModuleSummary]:
    summaries: list[ModuleSummary] = []
    for path in collect_source_files(REPO_ROOT):
        rel = path.relative_to(REPO_ROOT)
        text = path.read_text(encoding="utf-8", errors="ignore")
        globals_set, functions_set = extract_symbols(text)
        summaries.append(
            ModuleSummary(
                path=str(rel),
                globals=sorted(globals_set),
                functions=sorted(functions_set),
            )
        )
    return summaries


def render_stub(module: ModuleSummary, template: str) -> str:
    return template.replace("<path/or/identifier>", module.path).strip() + "\n"


def main() -> None:
    template_text = TEMPLATE_PATH.read_text(encoding="utf-8")
    modules = build_modules()
    for module in modules:
        target = STUB_ROOT / Path(module.path).with_suffix(".md")
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            continue
        target.write_text(render_stub(module, template_text), encoding="utf-8")


if __name__ == "__main__":
    main()
