#!/usr/bin/env node
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const lines = [];
let ok = true;

function check(name, fn) {
  try {
    lines.push("OK  " + name + " — " + fn());
  } catch (e) {
    ok = false;
    lines.push("FAIL " + name + " — " + e.message);
  }
}

function mustExist(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error("missing " + rel);
  return rel;
}

check("capacitor.config.ts", () => {
  const t = fs.readFileSync(path.join(root, "capacitor.config.ts"), "utf8");
  if (!t.includes("com.fcjr89.theculturewar")) throw new Error("appId");
  if (!t.includes("THE CULTURE WAR")) throw new Error("appName");
  if (!t.includes(".vercel/output/static")) throw new Error("webDir");
  return "appId/appName/webDir";
});

check("docs/MOBILE.md", () => mustExist("docs/MOBILE.md"));
check("MOBILE_SHIP_NOTES.md", () => mustExist("MOBILE_SHIP_NOTES.md"));
check("scripts/mobile-prepare.mjs", () => mustExist("scripts/mobile-prepare.mjs"));
check("ios/README.md", () => mustExist("ios/README.md"));
check("android/README.md", () => mustExist("android/README.md"));
check("studio/optimized/mobile", () => {
  mustExist("studio/optimized/mobile/README.md");
  return "studio/optimized/mobile";
});

check("package.json scripts", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  for (const s of ["mobile:prepare", "mobile:sync", "mobile:ios", "mobile:android", "mobile:ios:sync", "mobile:android:sync", "mobile:verify"]) {
    if (!pkg.scripts?.[s]) throw new Error("missing script " + s);
  }
  return "mobile:* scripts";
});

const caps = [
  "@capacitor/core",
  "@capacitor/cli",
  "@capacitor/ios",
  "@capacitor/android",
  "@capacitor/app",
  "@capacitor/status-bar",
  "@capacitor/haptics",
];
for (const name of caps) {
  check(name, () => {
    try {
      return require.resolve(name + "/package.json");
    } catch {
      const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
      const all = { ...pkg.dependencies, ...pkg.devDependencies };
      if (all[name]) return "declared (not installed yet)";
      throw new Error("not declared");
    }
  });
}

check("input.ts gamepad/touch", () => {
  const s = fs.readFileSync(path.join(root, "src/game/input.ts"), "utf8");
  if (!s.includes("setInjected")) throw new Error("setInjected");
  if (!s.includes("getGamepads")) throw new Error("getGamepads");
  return "touch inject + gamepad";
});

console.log(lines.join("\n"));
console.log(ok ? "mobile-verify PASS" : "mobile-verify FAIL");
process.exit(ok ? 0 : 1);
