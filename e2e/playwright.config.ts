import fs from "fs";
import path from "path";
import { defineConfig } from "@playwright/test";

const configPath = path.resolve(__dirname, "..", "config.json");
const rawConfig = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(rawConfig);
const serverConfig = config.server || {};
const host = serverConfig.host || "127.0.0.1";
const parsedPort = Number(serverConfig.port ?? 4173);
const port = Number.isNaN(parsedPort) ? 4173 : parsedPort;
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: "./tests",
  timeout: 2 * 60 * 1000,
  expect: {
    timeout: 2 * 60 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
    actionTimeout: 15 * 1000,
    navigationTimeout: 2 * 60 * 1000,
    viewport: {
      width: 1280,
      height: 720,
    },
    trace: "on-first-retry",
  },
});
