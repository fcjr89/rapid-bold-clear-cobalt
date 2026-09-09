const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".map": "application/json",
};

function resolveDistDir(root) {
  const candidates = [
    process.env.STEAM_DIST,
    path.join(root, "dist", "client"),
    path.join(root, "dist"),
    path.join(root, ".output", "public"),
  ].filter(Boolean);

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "index.html"))) return dir;
  }
  return null;
}

function startDistServer(distDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const raw = decodeURIComponent((req.url || "/").split("?")[0] || "/");
        let rel = raw === "/" ? "/index.html" : raw;
        let filePath = path.normalize(path.join(distDir, rel));
        if (!filePath.startsWith(distDir)) {
          res.writeHead(403).end("Forbidden");
          return;
        }
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          if (!path.extname(rel)) {
            filePath = path.join(distDir, "index.html");
          } else {
            res.writeHead(404).end("Not found");
            return;
          }
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.writeHead(500).end(String(err));
      }
    });

    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("Failed to bind dist server"));
        return;
      }
      resolve({
        port: addr.port,
        close: () => server.close(),
      });
    });
    server.on("error", reject);
  });
}

module.exports = { resolveDistDir, startDistServer };
