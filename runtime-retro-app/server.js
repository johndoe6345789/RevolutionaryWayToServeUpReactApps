const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".ts": "text/plain; charset=utf-8",
  ".tsx": "text/plain; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".scss": "text/x-scss; charset=utf-8",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".rom": "application/octet-stream",
  ".szx": "application/octet-stream",
};

http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  const pathname = decodeURIComponent(url.pathname);
  const requested = path.resolve(root, `.${pathname}`);
  const fallback = path.join(root, "index.html");
  const safe = requested.startsWith(root) ? requested : fallback;
  const file = fs.existsSync(safe) && fs.statSync(safe).isFile()
    ? safe
    : fallback;
  const headers = {
    "Content-Type": mime[path.extname(file)] || "application/octet-stream",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  response.writeHead(200, headers);
  fs.createReadStream(file).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`Runtime Retro listening on ${port}`);
});
