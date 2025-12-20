import sys
import textwrap
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory

import scripts.doc_coverage as doc_coverage


class TestDocCoverage(unittest.TestCase):
    def _run_cli(self, repo_root, extra_args=None):
        args = ["doc_coverage.py", "--code-root", str(repo_root), "--doc-root", "docs"]
        if extra_args:
            args.extend(extra_args)
        argv_backup = sys.argv
        try:
            sys.argv = args
            buffer = StringIO()
            with redirect_stdout(buffer):
                result = doc_coverage.DocCoverageCLI.execute()
        finally:
            sys.argv = argv_backup
        return buffer.getvalue(), result

    def test_extract_symbols_finds_globals_and_functions(self):
        source = textwrap.dedent(
            """
            const topLevel = 1
            let another = 2
            var legacy

            function declared() {}
            const arrow = () => {}
            const method: () => void = () => {}
            asyncLocal: async () => {}
            """
        )

        globals_set, functions_set = doc_coverage.DocumentationAnalyzer.extract_symbols(source)
        self.assertIn("topLevel", globals_set)
        self.assertIn("another", globals_set)
        self.assertIn("legacy", globals_set)
        self.assertIn("declared", functions_set)
        self.assertIn("arrow", functions_set)
        self.assertIn("method", functions_set)
        self.assertIn("asyncLocal", functions_set)

    def test_compute_coverage_detects_documented_entries(self):
        doc_text = "moduleA:foo moduleA:bar cables"
        names = ["moduleA:foo", "moduleA:untracked", "moduleA:bar", "moduleB:baz"]

        documented, total = doc_coverage.DocumentationAnalyzer.compute_coverage(names, doc_text)
        self.assertEqual(total, 4)
        self.assertEqual(documented, 2)

    def test_cli_reports_coverage_for_documented_module(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            src_dir = repo_root / "src"
            docs_dir = repo_root / "docs"
            api_dir = docs_dir / "api"
            src_dir.mkdir(parents=True)
            api_dir.mkdir(parents=True)
            (src_dir / "app.js").write_text("const exposed = 1\nfunction helper() {}\n", encoding="utf-8")
            api_src_dir = api_dir / "src"
            api_src_dir.mkdir(parents=True, exist_ok=True)
            (api_src_dir / "README.md").write_text("# src module docs\n", encoding="utf-8")
            (api_src_dir / "app.md").write_text("# Module: `src/app.js`\n", encoding="utf-8")

            output, result = self._run_cli(repo_root)
            self.assertIn("Documentation coverage", output)
            self.assertIn("Modules:    1/1 documented", output)
            self.assertEqual(result, 0)

    def test_symbol_detection_receives_bare_function_reference(self):
        doc_text = "The loader calls compileSCSS before injectCSS runs."
        symbol_name = "bootstrap/initializers/compilers/sass-compiler.js:compileSCSS"

        self.assertTrue(doc_coverage.DocumentationAnalyzer.is_documented(symbol_name, doc_text))

    def test_is_documented_handles_empty_docs(self):
        self.assertFalse(doc_coverage.DocumentationAnalyzer.is_documented("module:name", ""))

    def test_collect_source_files_filters_declarations(self):
        with TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            (root / "node_modules").mkdir()
            (root / "app.js").write_text("const foo = 1")
            (root / "ignore.d.ts").write_text("declare const bar: number")
            collected = list(doc_coverage.DocumentationAnalyzer.collect_source_files(root))
            names = [p.name for p in collected]
            self.assertIn("app.js", names)
            self.assertNotIn("ignore.d.ts", names)
            self.assertNotIn("node_modules", [str(p) for p in collected])

    def test_collect_source_files_includes_html_when_requested(self):
        with TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            (root / "bootstrap").mkdir()
            (root / "bootstrap" / "script-list.html").write_text("<!doctype html>")
            collected = list(
                doc_coverage.DocumentationAnalyzer.collect_source_files(root, extensions={".html"})
            )
            self.assertEqual(len(collected), 1)
            self.assertTrue(collected[0].name.endswith("script-list.html"))

    def test_render_module_template_includes_symbols(self):
        generator = doc_coverage.TemplateGenerator(Path("templates"))
        summary = doc_coverage.ModuleSummary("src/utils.js", globals=["CONST"], functions=["doThing"])
        template = doc_coverage.TemplateGenerator._render_module_template(summary)
        self.assertIn("CONST", template)
        self.assertIn("doThing", template)

    def test_generate_module_template_files(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            doc_root = repo_root / "docs"
            doc_root.mkdir(parents=True)
            template_root = Path(tmpdir) / "templates"
            generator = doc_coverage.TemplateGenerator(template_root)
            module_summary = doc_coverage.ModuleSummary("src/app.js", globals=[], functions=[])
            buffer = StringIO()
            with redirect_stdout(buffer):
                generator.generate(
                    doc_coverage.TemplateGenerationRequest(
                        module_summaries=[module_summary], existing_doc_text=""
                    )
                )
            self.assertTrue((template_root / "src" / "app.js.md").exists())

    def test_cli_with_template_root_writes_templates(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            src_dir = repo_root / "src"
            docs = repo_root / "docs"
            template_root = repo_root / "templates"
            src_dir.mkdir(parents=True)
            docs.mkdir(parents=True)
            (src_dir / "new.js").write_text("const foo = 1", encoding="utf-8")

            output, _ = self._run_cli(repo_root, ["--template-root", str(template_root)])
            self.assertIn("Module templates written for 1 modules", output)
            self.assertTrue((template_root / "src" / "new.js.md").exists())

    def _write_stub(self, stub_path: Path, module_path: str) -> None:
        stub_path.parent.mkdir(parents=True, exist_ok=True)
        stub_path.write_text(
            textwrap.dedent(
                f"""
                # Module documentation template

                ## Module: `{module_path}`

                ### Overview

                - **Purpose:** Placeholder
                """
            ).strip()
        )

    def test_stub_penalty_lists_missing_templates(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            src = repo_root / "src"
            docs = repo_root / "docs" / "api"
            src.mkdir(parents=True)
            docs.mkdir(parents=True)
            (src / "foo.js").write_text("const foo = 1\n", encoding="utf-8")
            (docs / "foo.md").write_text("# Module: `src/foo.js`\n", encoding="utf-8")
            stub_path = docs / "stubs" / "missing.md"
            self._write_stub(stub_path, "missing/module.js")

            output, _ = self._run_cli(repo_root)
            self.assertIn("penalized", output)
            self.assertIn("stub template", output)
            self.assertTrue(stub_path.exists())

    def test_fix_stubs_removes_templates_when_doc_present(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            doc_root = repo_root / "docs"
            src = repo_root / "src"
            src.mkdir(parents=True)
            doc_root.mkdir(parents=True)
            target_docs = doc_root / "api" / "src"
            target_docs.mkdir(parents=True)
            (src / "bar.js").write_text("const bar = 1\n", encoding="utf-8")
            (target_docs / "bar.md").write_text("# Module: `src/bar.js`\n", encoding="utf-8")
            (target_docs / "README.md").write_text("# src docs\n", encoding="utf-8")
            stub_path = doc_root / "api" / "stubs" / "bar.md"
            self._write_stub(stub_path, "src/bar.js")

            output, result = self._run_cli(repo_root, ["--fix-stubs"])
            self.assertNotIn("penalized", output)
            self.assertFalse(stub_path.exists())
            self.assertEqual(result, 0)

    def test_module_docs_require_module_heading(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            src_dir = repo_root / "src"
            docs_dir = repo_root / "docs"
            api_dir = docs_dir / "api"
            src_dir.mkdir(parents=True)
            api_dir.mkdir(parents=True)

            (src_dir / "app.js").write_text("const foo = 1\n", encoding="utf-8")
            (src_dir / "other.js").write_text("const bar = 2\n", encoding="utf-8")

            (api_dir / "app.md").write_text("# Module: `src/app.js`\n", encoding="utf-8")
            (api_dir / "other.md").write_text(
                "This document mentions src/other.js but lacks a module heading.", encoding="utf-8"
            )

            output, _ = self._run_cli(repo_root)
            self.assertIn("Modules:    1/2 documented", output)
            self.assertIn("Missing module docs:", output)
            self.assertIn("- src/other.js", output)

    def test_missing_readme_penalty_applied(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            src_dir = repo_root / "src"
            doc_root = repo_root / "docs"
            api_dir = doc_root / "api"
            src_dir.mkdir(parents=True)
            api_dir.mkdir(parents=True)
            (api_dir / "README.md").write_text("# API docs\n", encoding="utf-8")

            (src_dir / "feature.js").write_text("const feature = 1\n", encoding="utf-8")

            feature_dir = api_dir / "src"
            feature_dir.mkdir(parents=True)
            (feature_dir / "feature.md").write_text(
                "# Module: `src/feature.js`\n", encoding="utf-8"
            )

            output, _ = self._run_cli(repo_root)
            self.assertIn("Missing README.md in these directories:", output)
            self.assertIn("- api/src", output)
            self.assertIn("Overall:    98.0% (penalized 2.0% for 1 missing README)", output)

    def test_extra_module_docs_penalty(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            src_dir = repo_root / "src"
            doc_root = repo_root / "docs"
            api_dir = doc_root / "api"
            src_dir.mkdir(parents=True)
            api_dir.mkdir(parents=True)

            (src_dir / "foo.js").write_text("const foo = 1\n", encoding="utf-8")
            foo_dir = api_dir / "src"
            foo_dir.mkdir(parents=True)
            (foo_dir / "foo.md").write_text("# Module: `src/foo.js`\n", encoding="utf-8")
            (foo_dir / "README.md").write_text("# src docs\n", encoding="utf-8")
            missing_dir = api_dir / "missing"
            missing_dir.mkdir(parents=True)
            (missing_dir / "ghost.md").write_text(
                "# Module: `missing/ghost.js`\n", encoding="utf-8"
            )
            (missing_dir / "README.md").write_text("# missing docs\n", encoding="utf-8")

            output, _ = self._run_cli(repo_root)
            self.assertIn("Documented modules without matching source files:", output)
            self.assertIn("- missing/ghost.js", output)
            self.assertIn("Overall:    98.0% (penalized 2.0% for 1 extra module doc)", output)

    def test_bootstrap_unmatched_doc_penalty(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            bootstrap_dir = repo_root / "bootstrap"
            doc_root = repo_root / "docs"
            api_dir = doc_root / "api"
            bootstrap_doc = api_dir / "bootstrap"
            bootstrap_dir.mkdir(parents=True)
            api_dir.mkdir(parents=True)
            bootstrap_doc.mkdir(parents=True)

            (bootstrap_dir / "module.js").write_text("export const core = 1\n", encoding="utf-8")
            (api_dir / "README.md").write_text("# API\n", encoding="utf-8")
            (bootstrap_doc / "README.md").write_text("# Bootstrap\n", encoding="utf-8")

            (bootstrap_doc / "module.md").write_text(
                "# Module: `bootstrap/module.js`\n", encoding="utf-8"
            )
            (bootstrap_doc / "orphan.md").write_text(
                "# Module: `bootstrap/missing.js`\n", encoding="utf-8"
            )

            output, _ = self._run_cli(repo_root)
            self.assertIn("Bootstrap docs without matching source files:", output)
            self.assertIn("- api/bootstrap/orphan.md -> bootstrap/missing.js", output)
            self.assertIn("Documented modules not located at expected path:", output)
            self.assertIn(
                "Overall:    96.0% (penalized 4.0% for 1 misplaced doc and 1 unmatched bootstrap doc)", output
            )

    def test_misplaced_docs_penalty(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            bootstrap_dir = repo_root / "bootstrap"
            doc_root = repo_root / "docs"
            api_dir = doc_root / "api"
            mis_doc_dir = api_dir / "local"
            bootstrap_dir.mkdir(parents=True)
            mis_doc_dir.mkdir(parents=True)

            (bootstrap_dir / "loader.js").write_text("export const load = () => {}\n", encoding="utf-8")
            (api_dir / "README.md").write_text("# API\n", encoding="utf-8")
            (mis_doc_dir / "loader.md").write_text(
                "# Module: `bootstrap/loader.js`\n\n- `load`\n", encoding="utf-8"
            )
            (mis_doc_dir / "README.md").write_text("# Local\n", encoding="utf-8")

            output, result = self._run_cli(repo_root)
            self.assertIn("Documented modules not located at expected path:", output)
            self.assertIn(
                "api/local/loader.md (expected api/bootstrap/loader.md)", output
            )
            self.assertIn("Overall:    98.0% (penalized 2.0% for 1 misplaced doc)", output)
            self.assertEqual(result, 1)


if __name__ == "__main__":
    unittest.main()
