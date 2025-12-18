const fs = require("fs");
const path = require("path");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const config = require("../config.json");

const { server: serverConfig = {}, providers = {} } = config;
const host = serverConfig.host || "127.0.0.1";
const rawPort = process.env.PORT ?? serverConfig.port ?? 4173;
const parsedPort = Number(rawPort);
const port = Number.isNaN(parsedPort) ? 4173 : parsedPort;
const proxyTarget = process.env.CDN_PROXY_TARGET || providers.default;
const esmTarget = providers.esm;
if (!proxyTarget) {
  throw new Error("Missing CDN proxy target (providers.default) in config.json");
}
if (!esmTarget) {
  throw new Error("Missing CDN ESM target (providers.esm) in config.json");
}
const rootDir = path.resolve(__dirname, "..");
const logPath = path.resolve(__dirname, "server.log");
const logStream = fs.createWriteStream(logPath, { flags: "a" });

const app = express();
app.use(express.json({ limit: "1mb" }));

function logLine(prefix, message) {
  const line = `[${new Date().toISOString()}] ${prefix} ${message}`;
  console.log(line);
  try {
    logStream.write(line + "\n");
  } catch (_err) {
    // ignore file write errors to avoid crashing the server
  }
}

function formatBody(body) {
  try {
    const serialized =
      typeof body === "string" ? body : JSON.stringify(body, null, 2);
    return serialized.length > 4000
      ? serialized.slice(0, 4000) + "…(truncated)"
      : serialized;
  } catch (_err) {
    return "[unserializable body]";
  }
}

// Log every request the proxy handles to help debug CI failures.
app.use((req, _res, next) => {
  const start = Date.now();
  _res.on("finish", () => {
    const ms = Date.now() - start;
    logLine("static", `${req.method} ${req.originalUrl} -> ${_res.statusCode} (${ms}ms)`);
  });
  next();
});

// Proxy CDN traffic so the browser can load modules without CORS issues.
app.use(
  "/proxy/unpkg",
  createProxyMiddleware({
    target: proxyTarget,
    changeOrigin: true,
    pathRewrite: { "^/proxy/unpkg": "" },
    logLevel: "debug",
    onProxyReq(_proxyReq, req) {
      logLine("proxy:req", `${req.method} ${req.originalUrl} -> ${proxyTarget}${req.url}`);
    },
    onProxyRes(proxyRes, req) {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      proxyRes.headers["Access-Control-Allow-Headers"] = "*";
      logLine("proxy:res", `${req.method} ${req.originalUrl} -> ${proxyTarget}${req.url} [${proxyRes.statusCode}]`);
    },
    onError(err, req) {
      logLine("proxy:err", `${req.method} ${req.originalUrl} -> ${proxyTarget}${req.url}: ${err.message}`);
    }
  }),
);

const esmProxy = createProxyMiddleware({
  target: esmTarget,
  changeOrigin: true,
  logLevel: "debug",
  onProxyReq(_proxyReq, req) {
    logLine("esm:req", `${req.method} ${req.originalUrl} -> ${esmTarget}${req.url}`);
  },
  onProxyRes(proxyRes, req) {
    proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    proxyRes.headers["Access-Control-Allow-Headers"] = "*";
    logLine(
      "esm:res",
      `${req.method} ${req.originalUrl} -> ${esmTarget}${req.url} [${proxyRes.statusCode}]`
    );
  },
  onError(err, req) {
    logLine(
      "esm:err",
      `${req.method} ${req.originalUrl} -> ${esmTarget}${req.url}: ${err.message}`
    );
  },
});

function shouldProxyEsm(pathname) {
  return /^\/(@[^/]+\/)?[^/]+@[^/]+/.test(pathname);
}

app.use((req, res, next) => {
  if (shouldProxyEsm(req.path)) {
    return esmProxy(req, res, next);
  }
  next();
});

// Endpoint for client-side logging coming from bootstrap/app code.
app.post("/__client-log", (req, res) => {
  const body = formatBody(req.body);
  logLine("client", `${req.ip} ${req.method} ${req.originalUrl} ${body}`);
  res.status(204).end();
});

// Serve the repository root as static assets.
app.use(express.static(rootDir, { etag: false, maxAge: 0 }));

app.listen(port, host, () => {
  logLine("server", `Serving ${rootDir} on http://${host}:${port}`);
  logLine("server", `Proxying /proxy/unpkg/* -> ${proxyTarget}`);
});

process.on("exit", () => {
  try {
    logStream.end();
  } catch (_err) {
    // ignore
  }
});
