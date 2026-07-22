const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".ts": "text/plain; charset=utf-8", ".tsx": "text/plain; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json" };

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const requested = path.resolve(root, `.${pathname}`);
  const safe = requested.startsWith(root) ? requested : path.join(root, "index.html");
  const file = fs.existsSync(safe) && fs.statSync(safe).isFile() ? safe : path.join(root, "index.html");
  response.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  fs.createReadStream(file).pipe(response);
}).listen(port, "0.0.0.0", () => console.log(`Runtime Retro listening on ${port}`));
