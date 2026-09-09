#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const require = createRequire(import.meta.url);
const BUILD_SCRIPT = "steam" + ":" + "build";

function hasDist() {
  return ["dist/client/index.html", "dist/index.html", ".output/public/index.html"].some((p) =>
    existsSync(path.join(root, p)),
  );
}

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

function resolveElectron() {
  try {
    return require.resolve("electron/cli.js", { paths: [root] });
  } catch {
    return null;
  }
}

if (!hasDist()) {
  console.log("[desktop-dev] No dist yet");
  await run("node", ["scripts/with-app-env.mjs", "vite", "build"]);
}

const electronCli = resolveElectron();
if (!electronCli) {
  console.error("[desktop-dev] electron is not installed. Add electron and electron-builder as devDependencies, then retry.");
  process.exit(1);
}

await run(process.execPath, [electronCli, path.join(root, "steam/main.cjs")], {
  STEAM_DEV: "1",
  STEAM_APP_ID: process.env.STEAM_APP_ID || process.env.STEAMWORKS_APP_ID || "480",
});
