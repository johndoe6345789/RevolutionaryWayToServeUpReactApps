#!/usr/bin/env node

const { spawn } = require("child_process");
const config = require("../config.json");

const serverConfig = config.server || {};
const host = serverConfig.host || "127.0.0.1";
const rawPort = serverConfig.port ?? 4173;
const parsedPort = Number(rawPort);
const port = Number.isNaN(parsedPort) ? 4173 : parsedPort;
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
