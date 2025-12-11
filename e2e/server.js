const path = require("path");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const port = Number(process.env.PORT || 4173);
const rootDir = path.resolve(__dirname, "..");
const proxyTarget = process.env.CDN_PROXY_TARGET || "https://unpkg.com";

const app = express();

// Proxy CDN traffic so the browser can load modules without CORS issues.
app.use(
  "/proxy/unpkg",
  createProxyMiddleware({
    target: proxyTarget,
    changeOrigin: true,
    pathRewrite: { "^/proxy/unpkg": "" },
    onProxyRes(proxyRes) {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      proxyRes.headers["Access-Control-Allow-Headers"] = "*";
    },
  }),
);

// Serve the repository root as static assets.
app.use(express.static(rootDir, { etag: false, maxAge: 0 }));

app.listen(port, () => {
  console.log(`Serving ${rootDir} on http://127.0.0.1:${port}`);
  console.log(`Proxying /proxy/unpkg/* -> ${proxyTarget}`);
});
