import sys
import textwrap
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory

import scripts.doc_coverage as doc_coverage


class TestDocCoverage(unittest.TestCase):
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

        globals_set, functions_set = doc_coverage.extract_symbols(source)
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

        documented, total = doc_coverage.compute_coverage(names, doc_text)
        self.assertEqual(total, 4)
        self.assertEqual(documented, 2)

    def test_main_writes_twin_in_docs_folder(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            src_dir = repo_root / "src"
            docs_dir = repo_root / "docs"
            docs_dir.mkdir(parents=True)
            src_dir.mkdir(parents=True)

            module_file = src_dir / "app.js"
            module_file.write_text("const exposed = 1\nfunction helper() {}\n")

            api_dir = docs_dir / "api"
            api_dir.mkdir(parents=True, exist_ok=True)
            (api_dir / "app.md").write_text("app.js:helper")

            argv_backup = sys.argv
            try:
                sys.argv = ["doc_coverage.py", "--code-root", str(repo_root)]
                buffer = StringIO()
                with redirect_stdout(buffer):
                    doc_coverage.main()
                output = buffer.getvalue()
            finally:
                sys.argv = argv_backup

            self.assertIn("Documentation coverage", output)
            self.assertTrue((docs_dir / "api" / "app.md").exists())


    def test_symbol_detection_receives_bare_function_reference(self):
        doc_text = "The loader calls compileSCSS before injectCSS runs."
        symbol_name = "bootstrap/local/sass-compiler.js:compileSCSS"

        self.assertTrue(doc_coverage.is_documented(symbol_name, doc_text))

    def test_is_documented_handles_empty_docs(self):
        self.assertFalse(doc_coverage.is_documented("module:name", ""))

    def test_collect_source_files_filters_declarations(self):
        with TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            (root / "node_modules").mkdir()
            (root / "app.js").write_text("const foo = 1")
            (root / "ignore.d.ts").write_text("declare const bar: number")
            collected = list(doc_coverage.collect_source_files(root))
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
                doc_coverage.collect_source_files(root, extensions={".html"})
            )
            self.assertEqual(len(collected), 1)
            self.assertTrue(collected[0].name.endswith("script-list.html"))

    def test_render_module_template_includes_symbols(self):
        summary = doc_coverage.ModuleSummary("src/utils.js", globals=["CONST"], functions=["doThing"])
        template = doc_coverage.render_module_template(summary)
        self.assertIn("CONST", template)
        self.assertIn("doThing", template)

    def test_ensure_module_templates_creates_file(self):
        with TemporaryDirectory() as tmpdir:
            template_root = Path(tmpdir)
            summary = doc_coverage.ModuleSummary("pkg/foo.js", globals=["foo"], functions=[])
        created = doc_coverage.ensure_module_templates([summary], template_root, "")
        self.assertEqual(len(created), 1)
        self.assertTrue((template_root / "pkg" / "foo.js.md").exists())

    def test_main_with_template_root_writes_templates(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            src_dir = repo_root / "src"
            docs = repo_root / "docs"
            template_root = repo_root / "templates"
            src_dir.mkdir(parents=True)
            docs.mkdir(parents=True)
            (src_dir / "new.js").write_text("const foo = 1")
            argv_backup = sys.argv
            try:
                sys.argv = [
                    "doc_coverage.py",
                    "--code-root",
                    str(repo_root),
                    "--doc-root",
                    "docs",
                    "--template-root",
                    str(template_root),
                ]
                buffer = StringIO()
                with redirect_stdout(buffer):
                    doc_coverage.main()
                output = buffer.getvalue()
            finally:
                sys.argv = argv_backup
            self.assertIn("Module templates written", output)

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
            ),
            encoding="utf-8",
        )

    def test_stub_penalty_lists_missing_templates(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            src = repo_root / "src"
            docs = repo_root / "docs" / "api"
            (src / "foo.js").parent.mkdir(parents=True)
            (src / "foo.js").write_text("const foo = 1\n", encoding="utf-8")
            docs.mkdir(parents=True)
            (docs / "foo.md").write_text("# Module: `src/foo.js`\n", encoding="utf-8")
            stub_path = docs / "stubs" / "missing.md"
            self._write_stub(stub_path, "missing/module.js")

            argv_backup = sys.argv
            try:
                sys.argv = [
                    "doc_coverage.py",
                    "--code-root",
                    str(repo_root),
                    "--doc-root",
                    "docs",
                ]
                buffer = StringIO()
                with redirect_stdout(buffer):
                    doc_coverage.main()
                output = buffer.getvalue()
            finally:
                sys.argv = argv_backup

            self.assertIn("penalized", output)
            self.assertIn("api/stubs/missing.md", output)
            self.assertTrue(stub_path.exists())

    def test_fix_stubs_removes_templates_when_doc_present(self):
        with TemporaryDirectory() as tmpdir:
            repo_root = Path(tmpdir) / "repo"
            doc_root = repo_root / "docs"
            src = repo_root / "src"
            (src / "bar.js").parent.mkdir(parents=True)
            (src / "bar.js").write_text("const bar = 1\n", encoding="utf-8")
            target_docs = doc_root / "api"
            target_docs.mkdir(parents=True)
            (target_docs / "bar.md").write_text("# Module: `src/bar.js`\n", encoding="utf-8")
            stub_path = target_docs / "stubs" / "bar.md"
            self._write_stub(stub_path, "src/bar.js")

            argv_backup = sys.argv
            try:
                sys.argv = [
                    "doc_coverage.py",
                    "--code-root",
                    str(repo_root),
                    "--doc-root",
                    "docs",
                    "--fix-stubs",
                ]
                buffer = StringIO()
                with redirect_stdout(buffer):
                    doc_coverage.main()
                output = buffer.getvalue()
            finally:
                sys.argv = argv_backup

            self.assertNotIn("penalized", output)
            self.assertFalse(stub_path.exists())


if __name__ == "__main__":
    unittest.main()
