#!/usr/bin/env python3
"""Run unit tests without modifying the working directory."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parent


def _python() -> str:
    return sys.executable


def main() -> int:
    root = _repo_root()
    env = os.environ.copy()
    env["PYTHONPATH"] = str(root)
    cmd = [_python(), "-m", "unittest", "discover", "-s", "tests", "-p", "test_*.py"]
    return subprocess.call(cmd, cwd=root, env=env)


if __name__ == "__main__":
    raise SystemExit(main())
