#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const target = process.argv[2] || "--win";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(path.join(root, "package.json"));
const builder = "elec" + "tron-builder";
try { require.resolve(builder + "/package.json"); } catch {
  console.error("[steam] Install desktop shell deps first");
  process.exit(1);
}
const cfg = path.join(root, "electron", "electron-builder.yml");
const child = spawn("npx", [builder, "--config", cfg, target], { cwd: root, stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
