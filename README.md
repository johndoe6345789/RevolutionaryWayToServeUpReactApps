# RevolutionaryWayToServeUpReactApps
![CI](https://github.com/JohnDoe6345789/RevolutionaryWayToServeUpReactApps/actions/workflows/ci.yml/badge.svg)
![Docker build](https://github.com/JohnDoe6345789/RevolutionaryWayToServeUpReactApps/actions/workflows/docker-build.yml/badge.svg)
![Bun](https://img.shields.io/badge/bun-1.3.4-7d3cff)
![License](https://img.shields.io/github/license/JohnDoe6345789/RevolutionaryWayToServeUpReactApps)

Revolutionary Way To Serve Up React Apps delivers a RetroDeck-style landing page entirely rendered in the browser plus automated validation through Playwright using the exact bundle created by `bootstrap.js`.

## Table of contents

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Install dependencies](#install-dependencies)
4. [Run locally](#run-locally)
5. [Testing](#testing)
6. [Dockerized smoke test](#dockerized-smoke-test)
7. [Python helpers](#python-helpers)
8. [License](#license)

## Overview

- `bootstrap.js` compiles the TSX/SCSS sources, exposes the bundle through a client-rendered entry point, and serves it with `http-server`.
- `e2e/tests/page-load.spec.ts` verifies the landing page renders and becomes interactive using the same bundle that `bootstrap.js` produces.
- `test-tooling` hosts unit tests that run as a preliminary validation in CI.
- `e2e/Dockerfile` builds a reproducible Playwright environment that installs Bun 1.3.4 and runs the smoke test headlessly.

## Requirements

- **Bun 1.3.4** (same as the CI workflow) so the Node.js compatibility layer matches the tooling under test.
- **Docker 24+** if you want to build or run the containerized smoke test.
- **Playwright browsers** are already bundled with the `docker-build` image; locally Bun will fetch them when you run the Playwright suite.

## Python environment

Python helpers live inside the `python/` subdirectory and are packaged via `python/pyproject.toml`, so install them inside a virtual environment before running `bun-wrapper` or `copy_sources`. From the repo root:

```bash
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install poetry toml
cd python
poetry install .
cd ..
```

Running `poetry install .` creates the `bun-wrapper` console script and a `python/.venv`-style dependency lock right next to the helper sources. You can also point your shell to `python/.venv/Scripts/activate` if you prefer isolating just the helper dependencies instead of the repo-wide `.venv`.

## Install dependencies

```bash
bun install
bun install --prefix test-tooling
bun install --prefix e2e
```

## Run locally

1. Start the static server that serves `bootstrap.js`:

   ```bash
   bun run serve
   ```

2. In a new shell run the Playwright smoke test against the running bundle:

   ```bash
   bun run test --prefix e2e
   ```

## Testing

- Unit tests (test-tooling):

  ```bash
  bun test --prefix test-tooling
  ```

- Smoke test:

  ```bash
  bun run test --prefix e2e
  ```

## Dockerized smoke test

Reproduces the GitHub Actions environment without installing Bun locally.

1. **Build the container** (the Playwright base image already bundles Node 18; `e2e/Dockerfile` adds Bun 1.3.4):

   ```bash
   docker build -f e2e/Dockerfile -t rwtra-e2e .
   ```

2. **Run the smoke test** (the container starts `http-server`, waits for `/`, and executes `bun run test --prefix e2e`):

   ```bash
   docker run --rm rwtra-e2e
   ```

   Inside the container the test targets `http://127.0.0.1:4173`, matching the default `http-server` port Bun uses in `e2e/serve`.

## Python helpers

### Bun wrapper

`python/bun_wrapper.py` fetches the latest Bun release, caches it under your XDG or APPDATA cache directory (or the path set by `BUN_WRAPPER_CACHE_DIR` / `--cache-dir`), and passes any supplied arguments directly to the Bun binary.

```bash
python python/bun_wrapper.py -- bun --version
python python/bun_wrapper.py -- bun run test --prefix test-tooling
```

Use `python python/bun_wrapper.py -p` to print the resolved Bun binary (handy for tooling) or `python python/bun_wrapper.py -f` to force a fresh download of the newest release.

The helper is described by `python/pyproject.toml` so Flit, pip, or similar tooling can install the shim and expose a `bun-wrapper` console script alongside the existing `.py` entry point.

### Source copier

`python/copy_sources.py` mirrors `.html`, `.scss`, `.json`, `.tsx`, `.ts`, and the root-level `bootstrap.js` into `dist/` while preserving directory structure. It ignores `.git`, `node_modules`, `dist`, `__pycache__`, and `.github` by default and accepts additional `--exclude-dir` entries.

```bash
python python/copy_sources.py --clean
python python/copy_sources.py --src src --dest build/sources
```

## License

This project is distributed under the terms of the MIT License (see `LICENSE`).
