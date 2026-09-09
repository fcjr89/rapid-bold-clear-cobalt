#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const target = process.argv[2] || "--win";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const builder = "elec" + "tron-builder";
try { require.resolve(builder + "/package.json"); require.resolve("elec" + "tron/package.json"); }
catch { console.error("[steam] Install root devDeps: electron and electron-builder"); process.exit(1); }
const steamCfg = path.join(root, "steam", "electron-builder.yml");
const electronCfg = path.join(root, "electron", "electron-builder.yml");
const cfg = fs.existsSync(steamCfg) ? steamCfg : electronCfg;
console.log("[steam] Packaging", cfg, target);
const child = spawn("npx", [builder, "--config", cfg, target], { cwd: root, stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
