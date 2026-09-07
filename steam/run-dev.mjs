#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(path.join(root, "package.json"));
const pkg = "elec" + "tron";
let bin;
try { bin = require(pkg); } catch {
  console.error("[steam] Install desktop shell deps first");
  process.exit(1);
}
const entry = path.join(root, "electron", "main.cjs");
const child = spawn(bin, [entry, "--dev"], {
  cwd: root, stdio: "inherit",
  env: { ...process.env, CULTURE_WAR_URL: process.env.CULTURE_WAR_URL || "http://127.0.0.1:8080" },
});
child.on("exit", (code) => process.exit(code ?? 0));
