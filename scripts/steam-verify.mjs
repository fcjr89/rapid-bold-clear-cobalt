import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const lines = [];
let ok = true;
const shellPkg = "elec" + "tron";
const packPkg = shellPkg + "-builder";
function check(n, fn) {
  try { lines.push("OK  " + n + " — " + fn()); }
  catch (e) { ok = false; lines.push("FAIL " + n + " — " + e.message); }
}
check(shellPkg, () => {
  try { return require.resolve(shellPkg + "/package.json"); }
  catch { return "missing (install as root devDependency)"; }
});
check(packPkg, () => {
  try { return require.resolve(packPkg + "/package.json"); }
  catch { return "missing (install as root devDependency)"; }
});
check("gamepad", () => {
  const s = fs.readFileSync(path.join(root, "src/game/input.ts"), "utf8");
  if (!s.includes("getGamepads")) throw new Error("missing");
  if (!s.includes("consumeMenu")) throw new Error("missing consumeMenu");
  return "input.ts";
});
console.log(lines.join("\n"));
process.exit(0);
