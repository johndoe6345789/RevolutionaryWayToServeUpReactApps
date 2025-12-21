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
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Iterable, Sequence

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
    "missing_readme_links_title": "README files missing links to local docs:",
    "missing_globals_title": "Missing documented globals:",
    "missing_functions_title": "Missing documented functions / classes:",
    "bootstrap_unmatched_title": "Bootstrap docs without matching source files:",
    "extra_docs_title": "Documented modules without matching source files:",
    "misplaced_docs_title": "Documented modules not located at expected path:",
    "broken_readme_links_title": "Broken README links pointing at missing files:",
    "module_template_title": "# Module template: `{module}`",
    "template_intro": "Use this document as a starting point. Replace the placeholder text with prose, examples, and links that describe the exported surface.",
    "template_overview_heading": "## Overview",
    "template_overview_purpose": "- **Purpose:**",
    "template_overview_entry": "- **Entry point / exports:**",
    "template_globals_heading": "## Globals",
    "template_global_entry": "- `{name}` — describe the meaning and how callers should use it.",
    "template_none_yet": "- _None yet_",
    "template_functions_heading": "## Functions / Classes",
    "template_function_entry": "- `{name}` — explain arguments, return values, and side effects; note if it is async, a class constructor, etc.",
    "template_examples_heading": "## Examples",
    "template_code_block_start": "```ts",
    "template_examples_note": "// Show a minimal snippet that exercises the module.",
    "template_code_block_end": "```",
    "template_related_heading": "## Related docs",
    "template_related_item": "- Reference other relevant markdown files if they already mention this module.",
    "module_template_written": "Module templates written for {count} modules under {path}",
}
IGNORED_DOC_FILES = {Path("api/globals.md")}

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
MODULE_HEADING_RE = re.compile(r"#\s*Module:\s*`([^`]+)`", re.IGNORECASE)
LINK_TARGET_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
MISSING_GLOBALS_TITLE = "Missing documented globals:"
MISSING_FUNCTIONS_TITLE = "Missing documented functions / classes:"


@dataclass
class DocCoverageConfig:
    code_root: Path
    doc_root: Path
    template_root: Path | None
    extensions: set[str]
    fix_stubs: bool


class ServiceRegistry(dict[str, object]):
    """Simple registry for named services used in the workflow."""

    def register(self, name: str, service: object) -> None:
        self[name] = service

    def get_service(self, name: str) -> object:
        return self[name]


@dataclass
class ModuleSummary:
    """Tracks a module path and exposes collected globals/functions."""
    path: str
    globals: list[str] = field(default_factory=list)
    functions: list[str] = field(default_factory=list)


@dataclass
class PenaltySpec:
    """Captures penalty metadata for summary printing."""
    count: int
    penalty: float
    formatter: Callable[[int], str]


@dataclass
class Section:
    """Printable report section that emits items with a formatter."""
    title: str
    items: Sequence
    formatter: Callable[[object], str]

    def publish(self) -> None:
        """Prints the section if there are items inside."""
        if not self.items:
            return
        print(self.title)
        for item in self.items:
            print(self.formatter(item))


class TextUtils:
    """Convenience formatter helpers used by the reporter."""
    @staticmethod
    def pluralize(noun: str, count: int) -> str:
        """Return singular/plural noun depending on count."""
        return noun if count == 1 else f"{noun}s"

    @staticmethod
    def format_relative_path(path: Path, base: Path) -> str:
        """Return a relative path string safe for printing."""
        try:
            rel = path.relative_to(base)
        except ValueError:
            rel = path
        return f"  - {rel}"


SUMMARY_ROWS = [
    ("Modules", lambda metrics: f"{metrics.module_docged}/{metrics.module_total} documented"),
    ("Globals", lambda metrics: f"{metrics.globals_docged}/{metrics.globals_total}"),
    ("Functions / Classes", lambda metrics: f"{metrics.functions_docged}/{metrics.functions_total}"),
]

PENALTY_CONFIG = [
    {
        "items_key": "stub_templates",
        "penalty_key": "stub",
        "formatter": lambda count: f"{count} {TextUtils.pluralize('stub template', count)}",
    },
    {
        "items_key": "missing_readmes",
        "penalty_key": "readme",
        "formatter": lambda count: f"{count} missing {TextUtils.pluralize('README', count)}",
    },
    {
        "items_key": "extra_docs",
        "penalty_key": "extra",
        "formatter": lambda count: f"{count} extra module {TextUtils.pluralize('doc', count)}",
    },
    {
        "items_key": "misplaced",
        "penalty_key": "misplaced",
        "formatter": lambda count: f"{count} misplaced {TextUtils.pluralize('doc', count)}",
    },
    {
        "items_key": "bootstrap_extra",
        "penalty_key": "bootstrap",
        "formatter": lambda count: f"{count} unmatched bootstrap {TextUtils.pluralize('doc', count)}",
    },
    {
        "items_key": "broken_readme_links",
        "penalty_key": "readme_links",
        "formatter": lambda count: f"{count} broken README {TextUtils.pluralize('link', count)}",
    },
    {
        "items_key": "missing_readme_links",
        "penalty_key": "missing_links",
        "formatter": lambda count: f"{count} README {TextUtils.pluralize('missing link', count)}",
    },
]

SECTION_CONFIG = [
    {
        "title_key": "missing_readme_title",
        "items_key": "missing_readmes",
        "formatter": lambda item, base: TextUtils.format_relative_path(item, base),
    },
    {
        "title_key": "bootstrap_unmatched_title",
        "items_key": "bootstrap_extra",
        "formatter": lambda pair, base: f"  - {pair[0].relative_to(base)} -> {pair[1]}",
    },
    {
        "title_key": "extra_docs_title",
        "items_key": "extra_docs",
        "formatter": lambda doc, base: f"  - {doc}",
    },
    {
        "title_key": "misplaced_docs_title",
        "items_key": "misplaced",
        "formatter": lambda pair, base: f"  - {pair[0]} (expected {pair[1]})",
    },
    {
        "title_key": "broken_readme_links_title",
        "items_key": "broken_readme_links",
        "formatter": lambda pair, base: f"  - {pair[0]} references {pair[1]}",
    },
    {
        "title_key": "missing_readme_links_title",
        "items_key": "missing_readme_links",
        "formatter": lambda pair, base: f"  - {pair[0]} missing links to {', '.join(pair[1])}",
    },
]


@dataclass
class ModuleCollectorConfig:
    """Configuration for module discovery behavior."""
    code_root: Path
    extensions: set[str]


@dataclass
class ModuleCollectionRequest:
    """Request parameters for module discovery."""
    ignore_dirs: set[str] = field(default_factory=lambda: DEFAULT_IGNORE_DIRS.copy())


@dataclass
class ModuleCollectionResult:
    """Results returned after scanning the code tree."""
    module_summaries: list[ModuleSummary]
    modules: list[str]
    globals_list: list[str]
    functions_list: list[str]


@dataclass
class StubManagerConfig:
    """Configuration describing doc/template root for stubs."""
    doc_root: Path
    template_root: Path | None


@dataclass
class TemplateGenerationRequest:
    """Parameters to drive per-module template generation."""
    module_summaries: list[ModuleSummary]
    existing_doc_text: str


@dataclass
class PenaltyRequest:
    """Inputs required for penalty calculation."""
    documented_module_roots: list[str]
    documented_modules: set[str]
    entries: list[tuple[Path, str]]


@dataclass
class MissingReadmeConfig:
    """Configuration for missing README search."""
    doc_root: Path
    ignore_paths: list[Path]


@dataclass
class MissingReadmeRequest:
    """Tracks directories that should be excluded when locating README.md."""
    ignore_paths: list[Path]


@dataclass
class ReportMetrics:
    """Aggregated statistics that drive report generation."""
    module_docged: int
    module_total: int
    globals_docged: int
    globals_total: int
    functions_docged: int
    functions_total: int
    missing_modules: list[str]
    missing_globals: list[str]
    missing_functions: list[str]
    coverage_pct: float
    coverage_with_penalty: float
    penalties: dict[str, object]


@dataclass
class BootstrapDocCheckerConfig:
    """Configuration pairing docs and source roots for bootstrap validation."""
    doc_root: Path
    code_root: Path


@dataclass
class PenaltyCalculatorConfig:
    """Configuration used by the penalty calculator."""
    doc_root: Path
    code_root: Path
    stub_path: Path
    ignore_paths: list[Path]
    modules: list[str]
    fix_stubs: bool


class DocumentationAnalyzer:
    CLASS_DECL_RE = re.compile(r"^\s*(?:export\s+)?class\s+[A-Za-z_]\w*")
    METHOD_DECL_RE = re.compile(
        r"^\s*(?:(?:static|async|get|set)\s+)*\*?\s*([A-Za-z_]\w*)\s*\("
    )
    FIELD_ARROW_RE = re.compile(
        r"^\s*(?:static\s+)?([A-Za-z_]\w*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>"
    )
    FIELD_FUNC_RE = re.compile(
        r"^\s*(?:static\s+)?([A-Za-z_]\w*)\s*=\s*(?:async\s*)?function\b"
    )

    @staticmethod
    def collect_source_files(
        code_root: Path, extensions: set[str] | None = None, ignore_dirs: set[str] | None = None
    ) -> Iterable[Path]:
        """Yield all tracked source files matching the configured extensions."""
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

    @staticmethod
    def extract_symbols(text: str) -> tuple[set[str], set[str]]:
        """Return the set of globals and functions/classes declared in the provided source."""
        globals_set: set[str] = set()
        functions_set: set[str] = set()
        for match in re.finditer(
            r"^(?:export\s+)?(?:const|let|var)\s+([A-Za-z_]\w*)",
            text,
            re.MULTILINE,
        ):
            globals_set.add(match.group(1))
        lines = text.splitlines()
        class_depths = DocumentationAnalyzer._class_depths(lines)
        functions_set.update(DocumentationAnalyzer._extract_class_methods(lines, class_depths))
        patterns = [
            re.compile(r"\bfunction\s*\*?\s*([A-Za-z_]\w*)\s*\("),
            re.compile(r"\b([A-Za-z_]\w*)\s*=\s*function\b"),
            re.compile(r"\b([A-Za-z_]\w*)\s*=\s*async\s*\("),
            re.compile(r"\b([A-Za-z_]\w*)\s*=\s*\([^)]*\)\s*=>"),
            re.compile(r"\b([A-Za-z_]\w*)\s*:\s*(?:async\s*)?\([^)]*\)\s*=>"),
        ]
        for index, line in enumerate(lines):
            if class_depths[index] > 0:
                continue
            for pattern in patterns:
                match = pattern.search(line)
                if match:
                    functions_set.add(match.group(1))
        for match in re.finditer(
            r"^(?:export\s+(?:default\s+)?)?class\s+([A-Za-z_]\w*)",
            text,
            re.MULTILINE,
        ):
            functions_set.add(match.group(1))
        return globals_set, functions_set

    @staticmethod
    def _class_depths(lines: list[str]) -> list[int]:
        depths = [0] * len(lines)
        class_depth = 0
        pending_class = False
        for idx, line in enumerate(lines):
            depths[idx] = class_depth
            if pending_class:
                if "{" in line:
                    pending_class = False
                    class_depth += line.count("{") - line.count("}")
                    if class_depth < 0:
                        class_depth = 0
                continue
            if class_depth == 0 and DocumentationAnalyzer.CLASS_DECL_RE.search(line):
                pending_class = True
                if "{" in line:
                    pending_class = False
                    class_depth += line.count("{") - line.count("}")
                    if class_depth < 0:
                        class_depth = 0
                continue
            if class_depth > 0:
                class_depth += line.count("{") - line.count("}")
                if class_depth < 0:
                    class_depth = 0
        return depths

    @staticmethod
    def _extract_class_methods(lines: list[str], class_depths: list[int]) -> set[str]:
        methods: set[str] = set()
        for idx, line in enumerate(lines):
            if class_depths[idx] != 1:
                continue
            for pattern in (
                DocumentationAnalyzer.METHOD_DECL_RE,
                DocumentationAnalyzer.FIELD_ARROW_RE,
                DocumentationAnalyzer.FIELD_FUNC_RE,
            ):
                match = pattern.search(line)
                if not match:
                    continue
                if DocumentationAnalyzer._has_jsdoc(lines, idx):
                    methods.add(match.group(1))
                break
        return methods

    @staticmethod
    def _has_jsdoc(lines: list[str], index: int) -> bool:
        cursor = index - 1
        while cursor >= 0:
            stripped = lines[cursor].strip()
            if not stripped:
                cursor -= 1
                continue
            if stripped.startswith("/**"):
                return True
            if stripped.startswith("*") or stripped.startswith("*/") or stripped.startswith("//"):
                cursor -= 1
                continue
            return False
        return False

    @staticmethod
    def load_docs(doc_root: Path, ignore_dirs: Sequence[Path] | None = None) -> tuple[str, list[tuple[Path, str]]]:
        """Read markdown docs and collect any '# Module:' headings."""
        collected = []
        entries: list[tuple[Path, str]] = []
        if not doc_root.exists():
            return "", entries
        ignore_paths = [ignore.resolve() for ignore in (ignore_dirs or [])]
        for path in doc_root.rglob("*.md"):
            resolved = path.resolve()
            if ignore_paths and any(resolved.is_relative_to(ignore) for ignore in ignore_paths):
                continue
            try:
                relative = resolved.relative_to(doc_root)
            except ValueError:
                relative = None
            if relative and relative in IGNORED_DOC_FILES:
                continue
            text = path.read_text(encoding="utf-8")
            collected.append(text)
            for match in MODULE_HEADING_RE.finditer(text):
                module = match.group(1)
                if module:
                    entries.append((path, module))
        return "\n".join(collected), entries

    @staticmethod
    def compute_coverage(names: Iterable[str], doc_text: str) -> tuple[int, int]:
        """Count how many of the given names appear in the documentation text."""
        names_set = set(names)
        if not names_set:
            return 0, 0
        documented = sum(1 for name in names_set if DocumentationAnalyzer.is_documented(name, doc_text))
        return documented, len(names_set)

    @staticmethod
    def find_missing_names(names: Iterable[str], doc_text: str) -> list[str]:
        """Return sorted names from the iterable that are not documented."""
        missing: set[str] = set()
        documented_cache: dict[str, bool] = {}
        for name in names:
            if name in documented_cache:
                if not documented_cache[name]:
                    missing.add(name)
                continue
            documented = DocumentationAnalyzer.is_documented(name, doc_text)
            documented_cache[name] = documented
            if not documented:
                missing.add(name)
        return sorted(missing)
    @staticmethod
    def compute_module_coverage(modules: Sequence[str], documented_modules: set[str]) -> tuple[int, int, list[str]]:
        """Compare module file list against documented module headings."""
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

    @staticmethod
    def is_documented(name: str, doc_text: str) -> bool:
        """Determine if a module or symbol name exists within the docs."""
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

    @staticmethod
    def parse_extensions(value: str) -> set[str]:
        """Return a normalized set of extensions from the CLI argument."""
        candidates = [part.strip() for part in value.split(",") if part.strip()]
        if not candidates:
            return DEFAULT_EXTENSIONS.copy()
        return {part if part.startswith(".") else f".{part}" for part in candidates}


@dataclass
@dataclass
class WorkflowStep:
    """Describes a named workflow action."""
    name: str
    action: Callable[[ExecutionContext], None]


@dataclass
class ExecutionContext:
    """Shared state object passed among workflow steps."""
    module_summaries: list[ModuleSummary] = field(default_factory=list)
    modules: list[str] = field(default_factory=list)
    globals_list: list[str] = field(default_factory=list)
    functions_list: list[str] = field(default_factory=list)
    ignore_paths: list[Path] = field(default_factory=list)
    existing_doc_text: str = ""
    doc_text: str = ""
    documented_entries: list[tuple[Path, str]] = field(default_factory=list)
    documented_modules: set[str] = field(default_factory=set)
    documented_module_roots: list[str] = field(default_factory=list)
    module_docged: int = 0
    module_total: int = 0
    globals_docged: int = 0
    globals_total: int = 0
    functions_docged: int = 0
    functions_total: int = 0
    coverage_pct: float = 100.0
    coverage_with_penalty: float = 100.0
    penalties: dict[str, object] | None = None
    metrics: ReportMetrics | None = None
    strict_failure: bool = False
    missing_modules: list[str] = field(default_factory=list)
    missing_globals: list[str] = field(default_factory=list)
    missing_functions: list[str] = field(default_factory=list)


class ModuleCollectorService:
    """Collects module summaries, globals, and functions from the codebase."""
    def __init__(self, config: ModuleCollectorConfig) -> None:
        self.code_root = config.code_root
        self.extensions = config.extensions

    def collect(self, request: ModuleCollectionRequest) -> ModuleCollectionResult:
        """Scan the code root for modules matching the configured extensions."""
        module_summaries: list[ModuleSummary] = []
        modules: list[str] = []
        globals_list: list[str] = []
        functions_list: list[str] = []
        for path in DocumentationAnalyzer.collect_source_files(
            self.code_root, self.extensions, request.ignore_dirs
        ):
            rel = path.relative_to(self.code_root)
            summary = ModuleSummary(path=rel.as_posix())
            text = path.read_text(encoding="utf-8", errors="ignore")
            globals_set, functions_set = DocumentationAnalyzer.extract_symbols(text)
            summary.globals = sorted(globals_set)
            summary.functions = sorted(functions_set)
            module_summaries.append(summary)
            modules.append(summary.path)
            globals_list.extend(f"{summary.path}:{name}" for name in summary.globals)
            functions_list.extend(f"{summary.path}:{name}" for name in summary.functions)
        return ModuleCollectionResult(
            module_summaries=module_summaries,
            modules=modules,
            globals_list=globals_list,
            functions_list=functions_list,
        )

class StubManagerService:
    """Manages stub/template directories and ignore lists."""
    def __init__(self, config: StubManagerConfig) -> None:
        self.config = config

    def _populate_template_ignore(self) -> None:
        """Add template root to ignore list if it sits inside docs."""
        if not self.template_root:
            return
        try:
            if self.template_root.resolve().is_relative_to(self.doc_root):
                self.ignore_paths.append(self.template_root)
        except ValueError:
            pass

    def initialize(self) -> None:
        """Populate ignore paths after construction to keep init trivial."""
        self.doc_root = self.config.doc_root or Path(".")
        self.template_root = self.config.template_root
        self.stub_path = self.doc_root / "api" / "stubs"
        self.ignore_paths = [self.stub_path]
        self._populate_template_ignore()


class TemplateGeneratorService:
    """Generates markdown templates for undocumented modules."""
    def __init__(self, template_root: Path | None) -> None:
        self.template_root = template_root

    def generate(self, request: TemplateGenerationRequest) -> None:
        """Emit placeholder markdown for undocumented modules."""
        if not self.template_root:
            return
        created_templates: list[Path] = []
        self.template_root.mkdir(parents=True, exist_ok=True)
        doc_text = request.existing_doc_text
        for module in request.module_summaries:
            if DocumentationAnalyzer.is_documented(module.path, doc_text):
                continue
            module_path = Path(module.path)
            target_dir = self.template_root / module_path.parent
            target_dir.mkdir(parents=True, exist_ok=True)
            target_file = target_dir / f"{module_path.name}.md"
            if target_file.exists():
                continue
            target_file.write_text(
                self._render_module_template(module), encoding="utf-8"
            )
            created_templates.append(target_file)
        if created_templates:
            print(
                STRINGS["module_template_written"].format(
                    count=len(created_templates),
                    path=self.template_root,
                )
            )

    @staticmethod
    def _render_module_template(module: ModuleSummary) -> str:
        """Return the template body for a single module."""
        lines: list[str] = [
            STRINGS["module_template_title"].format(module=module.path),
            "",
            STRINGS["template_intro"],
            "",
            STRINGS["template_overview_heading"],
            STRINGS["template_overview_purpose"],
            STRINGS["template_overview_entry"],
            "",
            STRINGS["template_globals_heading"],
        ]
        if module.globals:
            lines.extend(
                STRINGS["template_global_entry"].format(name=name)
                for name in module.globals
            )
        else:
            lines.append(STRINGS["template_none_yet"])
        lines.extend(["", STRINGS["template_functions_heading"]])
        if module.functions:
            lines.extend(
                STRINGS["template_function_entry"].format(name=name)
                for name in module.functions
            )
        else:
            lines.append(STRINGS["template_none_yet"])
        lines.extend(
            [
                "",
                STRINGS["template_examples_heading"],
                STRINGS["template_code_block_start"],
                STRINGS["template_examples_note"],
                STRINGS["template_code_block_end"],
                "",
                STRINGS["template_related_heading"],
                STRINGS["template_related_item"],
            ]
        )
        return "\n".join(lines).rstrip() + "\n"


TemplateGenerator = TemplateGeneratorService


class PathRules:
    """Utilities for interpreting module-to-doc paths."""
    @staticmethod
    def expected_doc_path(module_path: str) -> Path:
        """Return the expected doc path for a bootstrap module."""
        cleaned = module_path.strip()
        override = PATH_CONFIG["module_overrides"].get(cleaned)
        if override:
            return override
        sanitized = Path(cleaned)
        base = sanitized.with_suffix("") if sanitized.suffix else sanitized
        return PATH_CONFIG["doc_base"] / base.with_suffix(".md")

    @staticmethod
    def is_code_module_path(module_path: str) -> bool:
        """Return True when the path references a tracked source module."""
        cleaned = module_path.strip()
        if "<" in cleaned or ">" in cleaned:
            return False
        lower = cleaned.lower()
        if not any(lower.endswith(ext) for ext in DEFAULT_EXTENSIONS):
            return False
        return not lower.startswith("docs/")

    @staticmethod
    def is_in_ignore_dir(module_path: str) -> bool:
        """Return True when the path starts in an ignored directory."""
        cleaned = module_path.strip().lstrip("./")
        if not cleaned:
            return False
        first_part = cleaned.split("/", 1)[0]
        return first_part in DEFAULT_IGNORE_DIRS


class MissingReadmeFinder:
    """Finds directories under docs/api lacking a README."""
    def __init__(self, config: MissingReadmeConfig) -> None:
        self.api_root = config.doc_root / "api"
        self.ignore_paths = [ignore.resolve() for ignore in config.ignore_paths]

    def find(self) -> list[Path]:
        """Return directories that are missing README.md files."""
        directories = self._collect_directories()
        return [
            directory
            for directory in sorted(directories)
            if directory != self.api_root and not (directory / "README.md").exists()
        ]

    def _collect_directories(self) -> set[Path]:
        """Collect every directory under docs/api that contains markdown."""
        directories: set[Path] = set()
        for path in self.api_root.rglob("*.md"):
            resolved = path.resolve()
            if self.ignore_paths and any(resolved.is_relative_to(ignore) for ignore in self.ignore_paths):
                continue
            directories.add(path.parent)
        return directories


class ReadmeLinkChecker:
    """Detects README links that point to files which no longer exist."""

    def __init__(self, doc_root: Path) -> None:
        self.doc_root = doc_root

    def find(self) -> list[tuple[Path, str]]:
        """Return (README path relative to doc root, missing target) pairs."""
        broken: list[tuple[Path, str]] = []
        for readme in self.doc_root.rglob("README.md"):
            try:
                text = readme.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            for match in LINK_TARGET_RE.finditer(text):
                href = match.group(1).strip()
                if not href or href.startswith(("http://", "https://", "mailto:")) or href.startswith("#"):
                    continue
                cleaned = href.split("?", 1)[0].split("#", 1)[0].strip()
                if not cleaned:
                    continue
                suffix = Path(cleaned).suffix.lower()
                if suffix and suffix not in {".md", ".mdx"}:
                    continue
                target = readme.parent / cleaned
                if target.exists():
                    continue
                try:
                    relative_readme = readme.relative_to(self.doc_root)
                except ValueError:
                    continue
                broken.append((relative_readme, cleaned))
        return broken


class ReadmeLinkCoverageChecker:
    """Ensures README links cover all sibling docs in the same directory."""

    def __init__(self, doc_root: Path) -> None:
        self.doc_root = doc_root

    def find(self) -> list[tuple[Path, list[str]]]:
        """Return (README path relative to doc root, missing files) tuples."""
        missing: list[tuple[Path, list[str]]] = []
        for readme in self.doc_root.rglob("README.md"):
            files_in_dir = {
                path.name
                for path in readme.parent.iterdir()
                if path.is_file() and path.suffix.lower() in {".md", ".mdx"} and path.name != "README.md"
            }
            if not files_in_dir:
                continue
            linked: set[str] = set()
            parent_resolved = readme.parent.resolve()
            try:
                text = readme.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            for match in LINK_TARGET_RE.finditer(text):
                href = match.group(1).strip()
                if not href or href.startswith(("http://", "https://", "mailto:")) or href.startswith("#"):
                    continue
                cleaned = href.split("?", 1)[0].split("#", 1)[0].strip()
                if not cleaned:
                    continue
                target = (readme.parent / cleaned).resolve()
                try:
                    target.relative_to(parent_resolved)
                except ValueError:
                    continue
                if target.is_file() and target.name in files_in_dir:
                    linked.add(target.name)
            missing_files = sorted(files_in_dir - linked)
            if not missing_files:
                continue
            try:
                relative_readme = readme.relative_to(self.doc_root)
            except ValueError:
                continue
            missing.append((relative_readme, missing_files))
        return missing


class ExtraDocFinder:
    """Identifies documented modules that lack corresponding source files."""
    def __init__(self, modules: list[str]) -> None:
        self.recorded = {module.lower() for module in modules}

    def find(self, documented_module_roots: list[str]) -> list[str]:
        """Return docs that have no matching code modules."""
        extras = {
            doc
            for doc in documented_module_roots
            if (
                doc.lower() not in self.recorded
                and PathRules.is_code_module_path(doc)
                and not PathRules.is_in_ignore_dir(doc)
                and not doc.lower().startswith("bootstrap")
            )
        }
        return sorted(extras)


class BootstrapDocChecker:
    """Validates bootstrap docs against mirrored source paths."""
    def __init__(self, config: BootstrapDocCheckerConfig) -> None:
        self.doc_root = config.doc_root
        self.code_root = config.code_root

    def find(self, entries: list[tuple[Path, str]]) -> list[tuple[Path, str]]:
        """List bootstrap docs that do not map to existing source files."""
        unmatched: list[tuple[Path, str]] = []
        for doc_path, module_path in entries:
            if not self._matches_section(doc_path):
                continue
            relative = doc_path.relative_to(self.doc_root)
            target = self.code_root / Path(module_path)
            if not target.exists():
                unmatched.append((doc_path, module_path))
        return unmatched

    def _matches_section(self, doc_path: Path) -> bool:
        """Return True if the doc path starts under a configured mirror section."""
        try:
            relative = doc_path.relative_to(self.doc_root)
        except ValueError:
            return False
        for section in PATH_CONFIG["mirror_sections"]:
            doc_prefix = section["doc_prefix"].parts
            if relative.parts[: len(doc_prefix)] != doc_prefix:
                continue
            return True
        return False


class MisplacedDocChecker:
    """Checks that bootstrap docs sit at their expected doc paths."""
    def __init__(self, doc_root: Path) -> None:
        self.doc_root = doc_root

    def find(self, entries: list[tuple[Path, str]]) -> list[tuple[Path, Path]]:
        """Report bootstrap docs located outside their canonical directory."""
        misplaced: list[tuple[Path, Path]] = []
        for doc_path, module in entries:
            if not module.lower().startswith("bootstrap"):
                continue
            try:
                relative = doc_path.relative_to(self.doc_root)
            except ValueError:
                continue
            expected = PathRules.expected_doc_path(module)
            if relative != expected:
                misplaced.append((relative, expected))
        return misplaced

class PenaltyCalculatorService:
    """Centralizes penalty detection for stubs, missing READMEs, and extra docs."""
    def __init__(
        self,
        config: PenaltyCalculatorConfig,
    ) -> None:
        self.config = config

    def calculate(self, request: PenaltyRequest) -> dict[str, object]:
        """Compute penalty details for the current documentation state."""
        stub_templates, matched_stubs = self._find_stub_templates(request.documented_modules)
        self._handle_stub_matches(matched_stubs)
        extra_finder = ExtraDocFinder(self.config.modules)
        bootstrap_checker = BootstrapDocChecker(
            BootstrapDocCheckerConfig(self.config.doc_root, self.config.code_root)
        )
        misplaced_checker = MisplacedDocChecker(self.config.doc_root)
        missing_request = MissingReadmeRequest(ignore_paths=self.config.ignore_paths)
        components = {
            "stub_templates": stub_templates,
            "missing_readmes": self._missing_readmes(missing_request),
            "extra_docs": extra_finder.find(request.documented_module_roots),
            "bootstrap_extra": bootstrap_checker.find(request.entries),
            "misplaced": misplaced_checker.find(request.entries),
            "broken_readme_links": self._broken_readme_links(),
            "missing_readme_links": self._missing_readme_links(),
        }
        penalty_values = {name: self._penalty(items) for name, items in components.items()}
        total = min(sum(penalty_values.values()), 100.0)
        return {
            **components,
            "penalties": {
                "stub": penalty_values["stub_templates"],
                "readme": penalty_values["missing_readmes"],
                "extra": penalty_values["extra_docs"],
                "bootstrap": penalty_values["bootstrap_extra"],
                "misplaced": penalty_values["misplaced"],
                "readme_links": penalty_values["broken_readme_links"],
                "missing_links": penalty_values["missing_readme_links"],
            },
            "total": total,
        }

    def _find_stub_templates(self, documented_modules: set[str]) -> tuple[list[Path], list[Path]]:
        """Inspect stub templates and split matched vs unmatched files."""
        templates: list[Path] = []
        matched: list[Path] = []
        if not self.config.stub_path.exists():
            return templates, matched
        for path in self.config.stub_path.rglob("*.md"):
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
                    matched.append(path)
                    continue
                templates.append(path)
        return templates, matched

    def _handle_stub_matches(self, matched_stubs: list[Path]) -> None:
        """Optionally delete stub templates for modules that now have docs."""
        if not (self.config.fix_stubs and matched_stubs):
            return
        self._remove_templates(matched_stubs)
        print(f"Removed {len(matched_stubs)} stub templates whose modules already have docs.")

    def _missing_readmes(self, request: MissingReadmeRequest) -> list[Path]:
        """Delegate README discovery to the finder class."""
        config = MissingReadmeConfig(self.config.doc_root, request.ignore_paths)
        finder = MissingReadmeFinder(config)
        return finder.find()

    def _broken_readme_links(self) -> list[tuple[Path, str]]:
        """Inspect README links for references to missing files."""
        checker = ReadmeLinkChecker(self.config.doc_root)
        return checker.find()

    def _missing_readme_links(self) -> list[tuple[Path, list[str]]]:
        """Check each README reports every sibling doc file via links."""
        checker = ReadmeLinkCoverageChecker(self.config.doc_root)
        return checker.find()

    @staticmethod
    def _penalty(items: Sequence) -> float:
        return min(len(items) * 2.0, 100.0)

    @staticmethod
    def _remove_templates(paths: list[Path]) -> None:
        for path in paths:
            try:
                path.unlink()
            except OSError:
                continue


class ReporterService:
    """Prints the documentation coverage summary and penalty sections."""
    def __init__(self, doc_root: Path) -> None:
        self.doc_root = doc_root

    def publish(self, metrics: ReportMetrics) -> None:
        print()
        print(STRINGS["coverage_heading"])
        print("----------------------")
        for label, fn in SUMMARY_ROWS:
            print(f"{label}:    {fn(metrics)}")
        if metrics.missing_modules:
            print(STRINGS["missing_modules"])
            for module in metrics.missing_modules:
                print(f"  - {module}")
        if metrics.missing_globals:
            print(STRINGS["missing_globals_title"])
            for item in metrics.missing_globals:
                print(f"  - {item}")
        if metrics.missing_functions:
            print(STRINGS["missing_functions_title"])
            for item in metrics.missing_functions:
                print(f"  - {item}")
        penalty_specs = [
            PenaltySpec(
                len(metrics.penalties[cfg["items_key"]]),
                metrics.penalties["penalties"][cfg["penalty_key"]],
                cfg["formatter"],
            )
            for cfg in PENALTY_CONFIG
        ]
        active_penalties = [spec for spec in penalty_specs if spec.count]
        if metrics.penalties["total"]:
            reason = " and ".join(spec.formatter(spec.count) for spec in active_penalties)
            print(
                f"Overall:    {metrics.coverage_with_penalty:.1f}% "
                f"(penalized {metrics.penalties['total']:.1f}% for {reason})"
            )
        else:
            print(f"Overall:    {metrics.coverage_pct:.1f}%")
        for section_cfg in SECTION_CONFIG:
            section = Section(
                STRINGS[section_cfg["title_key"]],
                metrics.penalties[section_cfg["items_key"]],
                lambda item, fmt=section_cfg["formatter"]: fmt(item, self.doc_root),
            )
            section.publish()


class DocCoverageRunner:
    """Entrypoint that wires the configuration into the coverage framework."""
    def __init__(self, config: DocCoverageConfig) -> None:
        self.config = config
        self.services = ServiceRegistry()
        stub_manager = StubManagerService(
            StubManagerConfig(self.config.doc_root, self.config.template_root)
        )
        stub_manager.initialize()
        self.services.register("stub_manager", stub_manager)
        self.services.register(
            "module_collector",
            ModuleCollectorService(
                ModuleCollectorConfig(self.config.code_root, self.config.extensions)
            ),
        )
        self.services.register("template_generator", TemplateGeneratorService(self.config.template_root))
        self.services.register("reporter", ReporterService(self.config.doc_root))

    def run(self) -> int:
        """Execute the configured coverage workflow and return its exit code."""
        framework = DocCoverageFramework(self.config, self.services)
        return framework.run()


class DocCoverageFramework:
    """Orchestrates the individual workflow steps to compute doc coverage."""
    def __init__(self, config: DocCoverageConfig, services: ServiceRegistry) -> None:
        self.config = config
        self.services = services

    def run(self) -> int:
        """Stepper that executes the configured workflow and reports the final status."""
        stub_manager = self.services.get_service("stub_manager")
        context = ExecutionContext(ignore_paths=list(stub_manager.ignore_paths))
        for step in self._workflow_steps():
            step.action(context)
        return 1 if context.strict_failure else 0

    def _workflow_steps(self) -> list[WorkflowStep]:
        """Return the ordered list of workflow steps to execute."""
        return [
            WorkflowStep("collect modules", self._collect_modules),
            WorkflowStep("load docs for templates", self._load_existing_docs),
            WorkflowStep("generate templates", self._generate_templates),
            WorkflowStep("reload docs", self._reload_docs),
            WorkflowStep("compute coverage", self._compute_coverage),
            WorkflowStep("calculate penalties", self._calculate_penalties),
            WorkflowStep("publish report", self._publish),
        ]

    def _collect_modules(self, context: ExecutionContext) -> None:
        """Scan source files and cache their summaries."""
        module_collector = self.services.get_service("module_collector")
        result = module_collector.collect(ModuleCollectionRequest())
        context.module_summaries = result.module_summaries
        context.modules = result.modules
        context.globals_list = result.globals_list
        context.functions_list = result.functions_list

    def _load_existing_docs(self, context: ExecutionContext) -> None:
        """Load docs once before template generation."""
        text, _ = DocumentationAnalyzer.load_docs(
            self.config.doc_root, ignore_dirs=context.ignore_paths
        )
        context.existing_doc_text = text

    def _generate_templates(self, context: ExecutionContext) -> None:
        """Generate templates for modules missing docs."""
        request = TemplateGenerationRequest(
            module_summaries=context.module_summaries,
            existing_doc_text=context.existing_doc_text,
        )
        template_generator = self.services.get_service("template_generator")
        template_generator.generate(request)

    def _reload_docs(self, context: ExecutionContext) -> None:
        """Reload docs after templates may have been created."""
        text, entries = DocumentationAnalyzer.load_docs(
            self.config.doc_root, ignore_dirs=context.ignore_paths
        )
        context.doc_text = text
        context.documented_entries = entries

    def _compute_coverage(self, context: ExecutionContext) -> None:
        """Fill the context with coverage statistics."""
        documented_modules = {module.lower() for _, module in context.documented_entries if module}
        context.documented_modules = documented_modules
        context.documented_module_roots = [module for _, module in context.documented_entries if module]
        module_docged, module_total, missing_modules = DocumentationAnalyzer.compute_module_coverage(
            context.modules, documented_modules
        )
        globals_docged, globals_total = DocumentationAnalyzer.compute_coverage(context.globals_list, context.doc_text)
        functions_docged, functions_total = DocumentationAnalyzer.compute_coverage(context.functions_list, context.doc_text)
        context.missing_globals = DocumentationAnalyzer.find_missing_names(context.globals_list, context.doc_text)
        context.missing_functions = DocumentationAnalyzer.find_missing_names(context.functions_list, context.doc_text)
        overall_total = module_total + globals_total + functions_total
        overall_docged = module_docged + globals_docged + functions_docged
        context.module_docged = module_docged
        context.module_total = module_total
        context.globals_docged = globals_docged
        context.globals_total = globals_total
        context.functions_docged = functions_docged
        context.functions_total = functions_total
        context.coverage_pct = (overall_docged / overall_total * 100) if overall_total else 100.0
        context.strict_failure = bool(missing_modules)
        context.missing_modules = missing_modules

    def _calculate_penalties(self, context: ExecutionContext) -> None:
        """Evaluate penalty conditions and update overall coverage."""
        penalty_request = PenaltyRequest(
            documented_module_roots=context.documented_module_roots,
            documented_modules=context.documented_modules,
            entries=context.documented_entries,
        )
        stub_manager = self.services.get_service("stub_manager")
        penalty_calculator = PenaltyCalculatorService(
            PenaltyCalculatorConfig(
                doc_root=self.config.doc_root,
                code_root=self.config.code_root,
                stub_path=stub_manager.stub_path,
                ignore_paths=context.ignore_paths,
                modules=context.modules,
                fix_stubs=self.config.fix_stubs,
            )
        )
        penalties = penalty_calculator.calculate(penalty_request)
        context.penalties = penalties
        context.coverage_with_penalty = max(context.coverage_pct - penalties["total"], 0.0)
        context.strict_failure = bool(
            context.strict_failure
            or penalties["total"] > 0
            or penalties["bootstrap_extra"]
            or penalties["misplaced"]
        )

    def _publish(self, context: ExecutionContext) -> None:
        """Materialize metrics object and print the report."""
        metrics = ReportMetrics(
            module_docged=context.module_docged,
            module_total=context.module_total,
            globals_docged=context.globals_docged,
            globals_total=context.globals_total,
            functions_docged=context.functions_docged,
            functions_total=context.functions_total,
            missing_modules=context.missing_modules,
            missing_globals=context.missing_globals,
            missing_functions=context.missing_functions,
            coverage_pct=context.coverage_pct,
            coverage_with_penalty=context.coverage_with_penalty,
            penalties=context.penalties or {},
        )
        context.metrics = metrics
        reporter = self.services.get_service("reporter")
        reporter.publish(metrics)


class DocCoverageCLI:
    @staticmethod
    def execute() -> int:
        """Parse CLI args and delegate to the coverage runner."""
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
        extensions = DocumentationAnalyzer.parse_extensions(args.extensions)
        config = DocCoverageConfig(code_root, doc_root, template_root, extensions, args.fix_stubs)
        runner = DocCoverageRunner(config)
        return runner.run()


if __name__ == "__main__":
    sys.exit(DocCoverageCLI.execute())
