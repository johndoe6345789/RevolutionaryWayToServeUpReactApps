# RevolutionaryWayToServeUpReactApps
![CI](https://github.com/JohnDoe6345789/RevolutionaryWayToServeUpReactApps/actions/workflows/ci.yml/badge.svg)
![Docker build](https://github.com/JohnDoe6345789/RevolutionaryWayToServeUpReactApps/actions/workflows/docker-build.yml/badge.svg)
![Bun](https://img.shields.io/badge/bun-1.3.4-7d3cff)
![License](https://img.shields.io/github/license/JohnDoe6345789/RevolutionaryWayToServeUpReactApps)

Revolutionary Way To Serve Up React Apps packages a RetroDeck-style landing page that is rendered entirely in the browser and validated by a Playwright smoke test that spins up the exact bundle created at runtime via `bootstrap.js`.

## What is inside

- `bootstrap.js` compiles the TSX/SCSS sources and exposes them through a client-rendered entry point served by `http-server`.
- `e2e/tests/page-load.spec.ts` is the Playwright smoke test that verifies the landing page renders and becomes interactive.
- `test-tooling` contains additional unit tests that run in the CI workflow as a preliminary validation.
- `e2e/Dockerfile` builds an environment where `bun run test --prefix e2e` can be executed headlessly with Playwright and the proper browsers.

## Getting started

### Requirements

- Bun 1.3.4 (matched by the official CI workflow and providing the Node.js compatibility layer used across the repo).
- Docker 24+ if you plan to build and run the containerized test.

### Install dependencies

```bash
bun install
bun install --prefix test-tooling
bun install --prefix e2e
```

### Run locally

- Start the static server:

  ```bash
  bun run serve
  ```

- In another shell, run the Playwright smoke test with the built bundle:

  ```bash
  bun run test --prefix e2e
  ```

### Run unit tests

```bash
bun test --prefix test-tooling
```

## Dockerized smoke test

The repository ships with a container image that mirrors the GitHub Actions environment and avoids managing local servers:

1. Build the image (the Playwright base image already provides Node 18 while the `e2e/Dockerfile` installs Bun 1.3.4 to run the smoke test):

   ```bash
   docker build -f e2e/Dockerfile -t rwtra-e2e .
   ```

2. Execute the containerized smoke test (it starts `http-server`, waits for `/`, and runs `bun run test --prefix e2e` via the `e2e` package):

   ```bash
   docker run --rm rwtra-e2e
   ```

   Inside the container the test targets `http://127.0.0.1:4173`, matching the default `http-server` port that Bun launches from `e2e/serve`.

## Continuous integration

- **CI workflow** (`ci.yml`): boots Bun 1.3.4, installs every workspace, runs the `test-tooling` suite via `bun test --prefix test-tooling`, prepares the Playwright e2e stack, and then launches `bun run test --prefix e2e`.
- **Docker image build** (`docker-build.yml`): ensures a reproducible Playwright container can be produced for smoke-testing.

## License

This project is distributed under the terms of the MIT License (see `LICENSE`).
