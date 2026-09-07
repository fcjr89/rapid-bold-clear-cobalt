import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const t = fs.readFileSync(path.join(root, "capacitor.config.ts"), "utf8");
if (!t.includes("com.fcjr89.theculturewar")) {
  console.error("FAIL appId");
  process.exit(1);
}
console.log("OK capacitor.config.ts");
console.log("INFO iOS packaging before Android");
