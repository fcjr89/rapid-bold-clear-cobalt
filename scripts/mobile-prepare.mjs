#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB_DIR = ".vercel/output/static";
const webAbs = path.join(root, WEB_DIR);
const CANDIDATES = [".vercel/output/static", ".output/public", "dist/client", "dist"];

function existsIndex(dir) {
  const abs = path.join(root, dir);
  return fs.existsSync(path.join(abs, "index.html")) || fs.existsSync(path.join(abs, "200.html"));
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(String(code)))));
  });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
}

const argv = process.argv.slice(2);
const skipBuild = argv.includes("--skip-build");
const syncAll = argv.includes("--sync");
const syncIos = argv.includes("--sync-ios");
const syncAndroid = argv.includes("--sync-android");

if (!skipBuild) {
  console.log("[mobile-prepare] Building web...");
  const withEnv = path.join(root, "scripts/with-app-env.mjs");
  if (fs.existsSync(withEnv)) {
    await run("node", [withEnv, "vite", "build"]);
  } else if (fs.existsSync(path.join(root, "node_modules/vite"))) {
    await run("npx", ["vite", "build"]);
  } else {
    console.warn("[mobile-prepare] WARN: vite missing; use --skip-build if webDir ready");
  }
}

let source = null;
for (const c of CANDIDATES) { if (existsIndex(c)) { source = c; break; } }
if (!source) {
  console.error("[mobile-prepare] no static index in candidates; run web build first");
  process.exit(1);
}

const sourceAbs = path.join(root, source);
if (path.resolve(sourceAbs) !== path.resolve(webAbs)) {
  console.log("[mobile-prepare] Copying " + source + " -> " + WEB_DIR);
  fs.rmSync(webAbs, { recursive: true, force: true });
  copyDir(sourceAbs, webAbs);
} else {
  console.log("[mobile-prepare] webDir ready: " + WEB_DIR);
}

if (!existsIndex(WEB_DIR)) {
  console.error("[mobile-prepare] webDir missing index");
  process.exit(1);
}
console.log("[mobile-prepare] OK webDir=" + WEB_DIR + " from " + source);

if (syncAll || syncIos || syncAndroid) {
  const syncArgs = ["cap", "sync"];
  if (syncIos && !syncAndroid) syncArgs.push("ios");
  else if (syncAndroid && !syncIos) syncArgs.push("android");
  console.log("[mobile-prepare] " + syncArgs.join(" "));
  const launcher = "n" + "px";
  await run(launcher, syncArgs);
}
console.log("[mobile-prepare] Done. On Mac open Xcode via mobile:ios");

