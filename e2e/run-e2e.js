#!/usr/bin/env node

import { spawn } from "child_process";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = join(__dirname, "../config.json");
let config = { server: {} };
if (existsSync(configPath)) {
  config = JSON.parse(readFileSync(configPath, "utf-8"));
}

const serverConfig = config.server || {};
const host = serverConfig.host || "127.0.0.1";
const rawPort = serverConfig.port ?? 3000;
const parsedPort = Number(rawPort);
const port = Number.isNaN(parsedPort) ? 3000 : parsedPort;
const baseUrl = `http://${host}:${port}`;

const args = [
  "x",
  "start-server-and-test",
  "serve",
  baseUrl,
  "bun x playwright test"
];

const runner = spawn("bun", args, {
  cwd: __dirname,
  stdio: "inherit"
});

runner.on("exit", (code) => {
  process.exit(code ?? 0);
});

runner.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
