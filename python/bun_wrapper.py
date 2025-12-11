#!/usr/bin/env python3
"""
Small wrapper around Bun that downloads the latest release, caches it, and forwards
arguments so callers can treat this script as a drop-in `bun` binary from Python.
"""
from __future__ import annotations

import argparse
import json
import os
import platform
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
import zipfile
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

API_LATEST_RELEASE = "https://api.github.com/repos/oven-sh/bun/releases/latest"
USER_AGENT = "bun-wrapper/1.0"
DOWNLOAD_TIMEOUT_S = 10 * 60


def default_cache_root() -> Path:
    env = os.environ
    if sys.platform.startswith("win"):
        base = env.get("XDG_CACHE_HOME") or env.get("LOCALAPPDATA") or env.get("APPDATA")
        if not base:
            base = Path.home() / "AppData" / "Local"
    else:
        base = env.get("XDG_CACHE_HOME")
        if not base:
            base = Path.home() / ".cache"
    return Path(base) / "bun-wrapper"


def fetch_latest_release() -> Tuple[str, List[Dict[str, Any]]]:
    request = urllib.request.Request(API_LATEST_RELEASE, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=DOWNLOAD_TIMEOUT_S) as response:
        if response.status != 200:
            raise RuntimeError(f"failed to fetch release metadata ({response.status})")
        data = json.load(response)
    tag = data.get("tag_name")
    if not tag:
        raise RuntimeError("release metadata did not include a tag name")
    assets = data.get("assets")
    if not isinstance(assets, list):
        raise RuntimeError("unexpected release metadata shape")
    return tag, assets


def resolve_os_label() -> str:
    system = platform.system().lower()
    if system.startswith("win"):
        return "windows"
    if system.startswith("darwin"):
        return "darwin"
    if system.startswith("linux"):
        return "linux"
    raise RuntimeError(f"unsupported operating system: {system}")


def resolve_arch_label() -> str:
    machine = platform.machine().lower()
    if machine in {"amd64", "x86_64"}:
        return "x64"
    if "arm" in machine or "aarch" in machine:
        return "aarch64"
    if machine in {"i386", "i686", "x86"}:
        return "x86"
    return machine


def choose_asset(
    assets: Iterable[Dict[str, Any]], os_label: str, arch_label: str
) -> Dict[str, Any]:
    asset_by_name = {asset["name"]: asset for asset in assets if "name" in asset}
    libc = platform.libc_ver()[0].lower()
    variants: List[str] = []
    if os_label == "linux" and libc == "musl":
        variants.extend(["-musl", "-musl-profile", "-musl-baseline", "-musl-baseline-profile"])
    variants.extend(["", "-profile", "-baseline", "-baseline-profile"])
    for variant in variants:
        candidate = f"bun-{os_label}-{arch_label}{variant}.zip"
        asset = asset_by_name.get(candidate)
        if asset:
            return asset
    # fallback: any asset that starts with the prefix
    prefix = f"bun-{os_label}-{arch_label}"
    for asset in assets:
        name = asset.get("name", "")
        if name.startswith(prefix) and name.endswith(".zip"):
            return asset
    raise RuntimeError(f"no release asset matching {prefix} could be found")


def download_asset(url: str, dest: Path) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=DOWNLOAD_TIMEOUT_S) as response, open(
        dest, "wb"
    ) as out_file:
        shutil.copyfileobj(response, out_file)


def extract_zip(zip_path: Path, destination: Path) -> None:
    with zipfile.ZipFile(zip_path) as archive:
        archive.extractall(destination)


def find_bun_binary(extracted_root: Path) -> Path:
    candidates = ["bun.exe", "bun"]
    for candidate in candidates:
        for match in extracted_root.rglob(candidate):
            if match.is_file():
                return match
    raise FileNotFoundError("bun binary not found in the extracted archive")


def ensure_bun_binary(cache_root: Path, force_download: bool) -> Path:
    cache_root.mkdir(parents=True, exist_ok=True)
    version, assets = fetch_latest_release()
    version_root = cache_root / version
    if force_download and version_root.exists():
        shutil.rmtree(version_root)
    if version_root.exists():
        try:
            return find_bun_binary(version_root)
        except FileNotFoundError:
            shutil.rmtree(version_root)
    os_label = resolve_os_label()
    arch_label = resolve_arch_label()
    asset = choose_asset(assets, os_label, arch_label)
    download_url = asset.get("browser_download_url")
    if not download_url:
        raise RuntimeError("asset missing download URL")
    print(f"Downloading Bun {version} for {os_label}/{arch_label}...", file=sys.stderr)
    temp_zip = Path(tempfile.mktemp(suffix=".zip"))
    try:
        download_asset(download_url, temp_zip)
        if version_root.exists():
            shutil.rmtree(version_root)
        version_root.mkdir(parents=True, exist_ok=True)
        extract_zip(temp_zip, version_root)
    finally:
        try:
            temp_zip.unlink()
        except OSError:
            pass
    binary_path = find_bun_binary(version_root)
    if not sys.platform.startswith("win"):
        binary_path.chmod(binary_path.stat().st_mode | 0o111)
    return binary_path


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Download and cache Bun releases, then proxy commands to the Bun binary."
    )
    parser.add_argument(
        "-c",
        "--cache-dir",
        type=Path,
        help="Override where Bun releases are cached (defaults to XDG/APPDATA).",
    )
    parser.add_argument(
        "-f", "--force-download", action="store_true", help="Re-download even if the latest release is already cached."
    )
    parser.add_argument(
        "-p", "--print-bun-path", action="store_true", help="Print the resolved Bun binary path and exit."
    )
    parser.add_argument("bun_args", nargs=argparse.REMAINDER, help="Arguments to forward to the Bun executable.")
    args = parser.parse_args()
    cache_dir = args.cache_dir or Path(os.environ.get("BUN_WRAPPER_CACHE_DIR") or default_cache_root())
    try:
        bun_binary = ensure_bun_binary(cache_dir, args.force_download)
    except (urllib.error.URLError, RuntimeError, zipfile.BadZipFile) as exc:
        parser.error(str(exc))
    if args.print_bun_path:
        print(str(bun_binary))
        return
    command = [str(bun_binary)] + args.bun_args
    if not command[1:]:
        print("Running Bun without arguments; the built-in help will be shown.", file=sys.stderr)
    result = subprocess.run(command)
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
