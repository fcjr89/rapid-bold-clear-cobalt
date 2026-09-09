#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const require = createRequire(import.meta.url);

async function run(cmd, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, ...env },
      shell: process.platform === "win32",
    });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(cmd + " exited " + code))));
  });
}

console.log("[desktop-package] Building Vite production bundle…");
await run("node", ["scripts/with-app-env.mjs", "vite", "build"]);

let builderCli;
try {
  builderCli = require.resolve("electron-builder/cli.js", { paths: [root] });
} catch {
  console.error("[desktop-package] electron-builder is not installed. Add electron and electron-builder as devDependencies, then retry.");
  process.exit(1);
}

console.log("[desktop-package] Packaging with electron-builder…");
await run(process.execPath, [builderCli, "--config", path.join(root, "steam/electron-builder.yml")], {
  STEAM_APP_ID: process.env.STEAM_APP_ID || process.env.STEAMWORKS_APP_ID || "480",
});
