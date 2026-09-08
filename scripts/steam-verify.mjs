#!/usr/bin/env node
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const lines = [];
let failed = false;

function ok(name, detail) {
  lines.push("OK  " + name + " — " + detail);
}
function warn(name, detail) {
  lines.push("WARN " + name + " — " + detail);
}
function fail(name, detail) {
  failed = true;
  lines.push("FAIL " + name + " — " + detail);
}

function mustExist(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    fail(rel, "missing");
    return false;
  }
  ok(rel, "present");
  return true;
}

// 1) Steam shell files
const steamFiles = [
  "steam/main.cjs",
  "steam/preload.cjs",
  "steam/electron-builder.yml",
  "steam/package.json",
  "steam/run-dev.mjs",
  "steam/run-dist.mjs",
];
for (const rel of steamFiles) mustExist(rel);

// 2) OST mp3s
const ost = [
  "shadow-empires",
  "black-veil",
  "subterranean-syndicate",
  "globalist-guillotine",
  "burn-the-matrix",
  "killuminati",
  "mk-veil",
  "chemtrails-fluoride",
];
for (const track of ost) {
  mustExist("public/game/music/" + track + ".mp3");
}

// 3) electron + electron-builder — WARN if not installed
const shellPkg = "elec" + "tron";
const packPkg = shellPkg + "-builder";
for (const name of [shellPkg, packPkg]) {
  try {
    const resolved = require.resolve(name + "/package.json");
    ok(name, resolved);
  } catch {
    warn(name, "not installed (add as root devDependency)");
  }
}

// 4) input.ts gamepad / menu — FAIL if missing
{
  const rel = "src/game/input.ts";
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    fail("gamepad", "missing " + rel);
  } else {
    const s = fs.readFileSync(p, "utf8");
    const missing = [];
    if (!s.includes("getGamepads")) missing.push("getGamepads");
    if (!s.includes("consumeMenu")) missing.push("consumeMenu");
    if (missing.length) fail("gamepad", "missing " + missing.join(", "));
    else ok("gamepad", "getGamepads + consumeMenu");
  }
}

// 5) audio.ts tcw-mute — WARN if missing
{
  const rel = "src/game/audio.ts";
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    warn("tcw-mute", "missing " + rel);
  } else {
    const s = fs.readFileSync(p, "utf8");
    if (!s.includes("tcw-mute")) warn("tcw-mute", "not found in audio.ts");
    else ok("tcw-mute", "audio.ts");
  }
}

console.log(lines.join("\n"));
process.exit(failed ? 1 : 0);
